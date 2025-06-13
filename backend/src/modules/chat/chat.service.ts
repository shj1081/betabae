import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationType } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ChatPartnerDto, ConversationResponseDto } from 'src/dto/chat/conversation.response.dto';
import {
  MessageAttachmentDto,
  MessageResponseDto,
  MessageSenderDto,
} from 'src/dto/chat/message.response.dto';
import { ErrorResponseDto } from 'src/dto/common/error.response.dto';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { RedisService } from 'src/infra/redis/redis.service';
import { FileService } from 'src/modules/file/file.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private fileSrv: FileService,
  ) {}

  /**
   * Get conversations for a user
   * @param userId User ID
   * @returns List of conversations and total unread count
   */
  async getConversations(userId: number, type?: ConversationType) {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ requester_id: userId }, { requested_id: userId }],
        status: 'ACCEPTED',
      },
      include: {
        conversations: {
          // user_specific_id가 userId 인 경우 상대방이 생성한 beta_bae 채팅방이므로 제외
          // user_specific_id가 userId가 아닌 경우나 null인 경우만 가져오기
          where: {
            OR: [{ user_specific_id: { not: userId } }, { user_specific_id: null }],
            ...(type ? { type } : {}),
          },
          orderBy: { updated_at: 'desc' },
          include: {
            messages: { orderBy: { sent_at: 'desc' }, take: 1 },
          },
        },
        requester: { select: { id: true, profile: true } },
        requested: { select: { id: true, profile: true } },
      },
    });

    // Redis 파이프라인으로 unread 일괄 조회
    const pipeline = this.redis.multi();
    matches.forEach((m) =>
      m.conversations.forEach((c) => pipeline.get(`unread:${userId}:${c.id}`)),
    );
    const unreadCounts = (await pipeline.exec()) || [];

    // DTO 매핑
    let idx = 0;
    const conversations = matches
      .flatMap((match) => match.conversations)
      .map((conv) => {
        const match = matches.find((m) => m.conversations.some((c) => c.id === conv.id));
        if (!match) return null;

        const profile =
          match.requester_id === userId ? match.requested.profile : match.requester.profile;
        if (!profile) return null;

        const chatPartner = plainToInstance(ChatPartnerDto, {
          id: profile.user_id,
          nickname: profile.nickname,
          profileImageUrl: profile.profile_media_id,
        });

        // Map last message to DTO if it exists
        let lastMessage: MessageResponseDto | undefined = undefined;
        if (conv.messages[0]) {
          const msg = conv.messages[0];
          lastMessage = this.mapMessageToDto(msg);
        }

        return plainToInstance(ConversationResponseDto, {
          conversationId: conv.id,
          matchId: conv.match_id,
          type: conv.type,
          chatPartner,
          unreadCount: parseInt(
            unreadCounts[idx] && unreadCounts[idx][1] ? String(unreadCounts[idx++][1]) : '0',
            10,
          ),
          lastMessage,
          createdAt: new Date(conv.created_at),
          updatedAt: new Date(conv.updated_at),
        });
      });

    // Filter out null values and calculate total unread count
    const filteredConversations = conversations.filter((c) => c !== null);
    const totalUnreadCount = filteredConversations.reduce((sum, c) => sum + c.unreadCount, 0);
    return { conversations: filteredConversations, totalUnreadCount };
  }

  /**
   * Get messages for a conversation
   * @param userId User ID
   * @param conversationId Conversation ID
   * @param limit Number of messages to fetch
   * @param before Message ID to fetch before
   * @returns List of messages
   */
  async getMessages(userId: number, conversationId: number, limit = 30, before?: number) {
    await this.assertAccess(userId, conversationId);

    const messages = await this.prisma.message.findMany({
      where: {
        conversation_id: conversationId,
        ...(before && { id: { lt: before } }),
      },
      orderBy: { sent_at: 'desc' },
      take: limit,
      include: { sender: { select: { id: true, profile: true } }, media: true },
    });

    // Map database entities to DTOs
    return messages.map((msg) => this.mapMessageToDto(msg));
  }

  /**
   * Create a text message
   * @param senderId Sender ID
   * @param conversationId Conversation ID
   * @param text Message text
   * @returns Created message
   */
  async createText(senderId: number, conversationId: number, text: string) {
    const { requester_id, requested_id } = await this.assertAccess(senderId, conversationId);

    const recipientId = senderId === requester_id ? requested_id : requester_id;

    // 트랜잭션 + Redis INCR로 상태 정합성 확보
    const message = await this.prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversation_id: conversationId,
          sender_id: senderId,
          message_text: text,
        },
        include: {
          sender: { select: { id: true, profile: true } },
          conversation: true,
        },
      });
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updated_at: new Date() },
      });
      return msg;
    });

    await this.redis.incr(`unread:${recipientId}:${conversationId}`);

    const redisKey = `messages:${conversationId}`;
    const existing = await this.redis.get(redisKey);

    let conversationInfo: {
      partnerId: number;
      messages: { sender_id: number; message_text: string }[];
    };

    if (existing) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        conversationInfo = JSON.parse(existing);
      } catch {
        conversationInfo = { partnerId: recipientId, messages: [] };
      }
    } else {
      // First message of the convo — decide who the partner is (LLM clone target)
      conversationInfo = { partnerId: recipientId, messages: [] };
    }

    conversationInfo.messages.push({
      sender_id: senderId,
      message_text: text,
    });

    await this.redis.set(redisKey, JSON.stringify(conversationInfo));

    return this.mapMessageToDto(message);
  }

  /**
   * Create an image message
   * @param senderId Sender ID
   * @param conversationId Conversation ID
   * @param file Image file
   * @param messageText Message text
   * @returns Created message
   */
  async createImage(
    senderId: number,
    conversationId: number,
    file: Express.Multer.File,
    messageText?: string,
  ) {
    // First check access to the conversation
    await this.assertAccess(senderId, conversationId);

    // Then check if this is a BETA_BAE conversation
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { type: true },
    });

    if (conv && conv.type === ConversationType.BETA_BAE)
      throw new BadRequestException(new ErrorResponseDto('Image not allowed for BETA_BAE'));

    const media = await this.fileSrv.uploadFile(file, 'chat-image');
    const textMessage = await this.createText(senderId, conversationId, messageText ?? '');

    const updatedMessage = await this.prisma.message.update({
      where: { id: textMessage.messageId },
      data: { attachment_media_id: media.id },
      include: {
        sender: { select: { id: true, profile: true } },
        media: true,
        conversation: true,
      },
    });

    return this.mapMessageToDto(updatedMessage);
  }

  /**
   * Create a file message
   * @param senderId Sender ID
   * @param conversationId Conversation ID
   * @param file Any file
   * @param messageText Message text
   * @returns Created message
   */
  async createFile(
    senderId: number,
    conversationId: number,
    file: Express.Multer.File,
    messageText?: string,
  ) {
    await this.assertAccess(senderId, conversationId);

    // Get conversation details to check if it's BETA_BAE
    const conv = await this.getConversationDetails(conversationId);
    if (!conv) {
      throw new NotFoundException(new ErrorResponseDto('Conversation not found'));
    }

    if (conv.type === ConversationType.BETA_BAE) {
      throw new BadRequestException(
        new ErrorResponseDto('File attachments not allowed for BETA_BAE'),
      );
    }

    const media = await this.fileSrv.uploadFile(file, 'chat-file');
    const textMessage = await this.createText(
      senderId,
      conversationId,
      messageText ?? `File: ${file.originalname}`,
    );

    const updatedMessage = await this.prisma.message.update({
      where: { id: textMessage.messageId },
      data: { attachment_media_id: media.id },
      include: {
        sender: { select: { id: true, profile: true } },
        media: true,
        conversation: true,
      },
    });

    return this.mapMessageToDto(updatedMessage);
  }

  /**
   * Mark messages as read
   * @param userId User ID
   * @param conversationId Conversation ID
   */
  async markRead(userId: number, conversationId: number) {
    await this.prisma.message.updateMany({
      where: {
        conversation_id: conversationId,
        sender_id: { not: userId },
        is_read: false,
      },
      data: { is_read: true, read_at: new Date() },
    });
    await this.redis.set(`unread:${userId}:${conversationId}`, '0');
  }

  /**
   * Get conversation details including type
   */
  public async getConversationDetails(conversationId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        type: true,
        match_id: true,
        created_at: true,
        updated_at: true,
      },
    });
    return conversation;
  }

  /**
   * Get conversation with user IDs for notification purposes
   */
  public async getConversationWithUsers(conversationId: number) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { match: true },
    });
    if (!conv) throw new NotFoundException(new ErrorResponseDto('Conversation not found'));

    return {
      requesterUserId: conv.match.requester_id,
      requestedUserId: conv.match.requested_id,
    };
  }

  /**
   * Maps a database message entity to a MessageResponseDto
   */
  private mapMessageToDto(message: any): MessageResponseDto {
    // Extract conversation type if available
    const conversationType = message.conversation?.type;

    // Create sender DTO
    const senderDto = plainToInstance(MessageSenderDto, {
      id: message.sender_id,
      name: message.sender?.profile?.nickname || 'betabae',
    });

    // Create attachment DTO if media exists
    let attachmentDto: MessageAttachmentDto | undefined = undefined;
    if (message.media) {
      attachmentDto = plainToInstance(MessageAttachmentDto, {
        id: message.media.id,
        url: this.fileSrv.getFile(message.media.id),
        type: message.media.mime_type,
      });
    }

    // Create and return the message DTO
    return plainToInstance(MessageResponseDto, {
      messageId: message.id,
      conversationId: message.conversation_id,
      sender: senderDto,
      messageText: message.message_text,
      sentAt: message.sent_at ? new Date(message.sent_at) : null,
      isRead: message.is_read,
      readAt: message.read_at ? new Date(message.read_at) : null,
      attachment: attachmentDto,
    });
  }

  /**
   * Verify that the user has access to the conversation
   * @returns The match object associated with the conversation
   */
  private async assertAccess(userId: number, conversationId: number) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { match: true },
    });
    if (!conv) throw new NotFoundException(new ErrorResponseDto('Conversation not found'));

    const { requester_id, requested_id } = conv.match;
    if (userId !== 0 && userId !== requester_id && userId !== requested_id)
      throw new BadRequestException(new ErrorResponseDto('No access to this conversation'));

    // Return match object for further processing
    return {
      requester_id,
      requested_id,
    };
  }
}
