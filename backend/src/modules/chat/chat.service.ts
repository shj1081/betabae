import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConversationType, MatchStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import {
  ConversationListResponseDto,
  ConversationResponseDto,
} from 'src/dto/chat/conversation.response.dto';
import { MessageResponseDto } from 'src/dto/chat/message.response.dto';
import { ErrorResponseDto } from 'src/dto/common/error.response.dto';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { RedisService } from 'src/infra/redis/redis.service';
import { FileService } from 'src/modules/file/file.service';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly fileService: FileService,
    @Inject(forwardRef(() => LlmService))
    private readonly llmService: LlmService,
  ) {}

  //
  // Core Business Logic (Public Methods)
  //

  async getConversations(userId: number): Promise<ConversationListResponseDto> {
    // Get conversations for the user
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ requester_id: userId }, { requested_id: userId }],
        status: MatchStatus.ACCEPTED,
        conversations: {
          some: {
            // type: ConversationType.REAL_BAE,
          },
        },
      },
      include: {
        requester: {
          select: {
            id: true,
            profile: {
              select: {
                nickname: true,
                profile_image: {
                  select: { file_url: true },
                },
              },
            },
          },
        },
        requested: {
          select: {
            id: true,
            profile: {
              select: {
                nickname: true,
                profile_image: {
                  select: { file_url: true },
                },
              },
            },
          },
        },
        conversations: {
          where: {
            // type: ConversationType.REAL_BAE,
          },
          include: {
            messages: {
              orderBy: { sent_at: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: { id: true },
                },
                media: true,
              },
            },
          },
        },
      },
    });

    let totalUnreadCount = 0;
    const conversationsData = await Promise.all(
      matches.map(async (match) => {
        const isRequester = match.requester_id === userId;
        const chatPartner = isRequester ? match.requested : match.requester;

        const chatPartnerNickname = chatPartner.profile?.nickname ?? '';
        const chatPartnerProfileImageUrl =
          chatPartner.profile?.profile_image?.file_url;

        const conversation = match.conversations[0];
        if (!conversation) return null;

        // redis unread count
        const unreadCountKey = `unread:${userId}:${conversation.id}`;
        const unreadCountStr = await this.redis.get(unreadCountKey);
        const unreadCount = unreadCountStr ? parseInt(unreadCountStr, 10) : 0;
        totalUnreadCount += unreadCount;

        const lastMessage =
          conversation.messages.length > 0
            ? this.mapMessageToDto(conversation.messages[0])
            : undefined;

        return {
          conversationId: conversation.id,
          matchId: match.id,
          type: conversation.type,
          chatPartner: {
            id: chatPartner.id,
            name: chatPartnerNickname, // for DTO compatibility
            nickname: chatPartnerNickname,
            profileImageUrl: chatPartnerProfileImageUrl,
          },
          unreadCount,
          lastMessage,
          createdAt: conversation.created_at,
          updatedAt: conversation.updated_at,
        };
      }),
    );

    const filteredConversations = conversationsData.filter(
      Boolean,
    ) as ConversationResponseDto[];

    return {
      conversations: filteredConversations,
      totalUnreadCount,
    };
  }

  async getMessages(
    userId: number,
    conversationId: number,
    limit: number = 20,
    before?: number,
  ): Promise<MessageResponseDto[]> {
    await this.verifyConversationAccess(userId, conversationId);

    const whereCondition: any = { conversation_id: conversationId };
    if (before) {
      whereCondition.id = { lt: before };
    }

    const messages = await this.prisma.message.findMany({
      where: whereCondition,
      orderBy: { sent_at: 'desc' },
      take: limit,
      include: {
        sender: { select: { id: true } },
        media: true,
      },
    });

    return messages.map((m) => this.mapMessageToDto(m));
  }

  /**
   * Send a text message in a conversation
   * Handles both user messages and beta_bae messages
   */
  async sendTextMessage(
    senderId: number,
    conversationId: number,
    messageText: string,
  ) {
    // 대화방 접근 권한 확인
    await this.verifyConversationAccess(senderId, conversationId);

    // Get conversation to check type
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    // 메시지 저장
    const message = await this.prisma.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: senderId,
        message_text: messageText,
        sent_at: new Date(),
        is_read: false,
      },
      include: {
        sender: {
          select: { id: true },
        },
      },
    });

    // 대화방 활동 시간 업데이트
    await this.updateConversationActivity(conversationId);

    // 상대방의 unread count 증가
    await this.incrementUnreadCount(senderId, conversationId);

    // DTO 변환 후 반환
    return this.mapMessageToDto(message);
  }

  async sendImageMessage(
    senderId: number,
    conversationId: number,
    file: Express.Multer.File,
    messageText?: string,
  ) {
    const conversation = await this.getConversationEntity(
      conversationId,
      senderId,
    );

    if (conversation.type !== ConversationType.REAL_BAE) {
      throw new BadRequestException('Image messages not supported for BETABAE');
    }

    // 파일 업로드
    const uploadedFile = await this.fileService.uploadFile(file, 'chat-image');

    await this.prisma.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: senderId,
        message_text: messageText || '',
        is_read: false,
        attachment_media_id: uploadedFile.id,
      },
      include: {
        sender: {
          select: { id: true },
        },
        media: true,
      },
    });

    await this.updateConversationActivity(conversationId);
    await this.incrementUnreadCount(senderId, conversationId);
  }

  /**
   * Mark all unread messages in a conversation as read for a specific user
   * This is called when a user enters a chat room screen
   */
  async markMessagesAsRead(
    userId: number,
    conversationId: number,
  ): Promise<void> {
    // 내 메시지가 아닌 것만 is_read=true
    await this.prisma.message.updateMany({
      where: {
        conversation_id: conversationId,
        sender_id: { not: userId },
        is_read: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    // Redis unreadCount 0
    const unreadCountKey = `unread:${userId}:${conversationId}`;
    await this.redis.set(unreadCountKey, '0');
  }

  async getConversationWithUsers(conversationId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { match: true },
    });
    if (!conversation) {
      return null;
    }
    return {
      matchId: conversation.match_id,
      requesterUserId: conversation.match?.requester_id,
      requestedUserId: conversation.match?.requested_id,
    };
  }

  //
  // Entity Access Methods
  //

  async getConversationEntity(conversationId: number, userId?: number) {
    // DB에서 conversation
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { match: true },
    });
    if (!conversation) {
      throw new NotFoundException(
        new ErrorResponseDto(
          `Conversation with ID ${conversationId} not found`,
        ),
      );
    }
    // 사용자가 접근 가능한지 체크
    if (userId) {
      const { requester_id, requested_id } = conversation.match;
      if (userId !== requester_id && userId !== requested_id) {
        throw new BadRequestException(
          new ErrorResponseDto('You do not have access to this conversation'),
        );
      }
    }
    return conversation;
  }

  //
  // Helper Methods (Private)
  //

  private async verifyConversationAccess(
    userId: number,
    conversationId: number,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { match: true },
    });
    if (!conversation) {
      throw new NotFoundException(
        new ErrorResponseDto(
          `Conversation with ID ${conversationId} not found`,
        ),
      );
    }
    const { requester_id, requested_id } = conversation.match;

    // beta_bae 자동 답장 handling
    if (userId !== requester_id && userId !== requested_id && userId != 0) {
      throw new BadRequestException(
        new ErrorResponseDto('You do not have access to this conversation 2'),
      );
    }
  }

  private async updateConversationActivity(conversationId: number) {
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updated_at: new Date() },
    });
  }

  /**
   * Increment the unread count for a recipient in a conversation
   * This is called when a new message is sent and the recipient is not in the chat room screen
   */
  private async incrementUnreadCount(senderId: number, conversationId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { match: true },
    });
    if (!conversation) return;

    const { requester_id, requested_id } = conversation.match;
    const recipientId = senderId === requester_id ? requested_id : requester_id;

    const unreadCountKey = `unread:${recipientId}:${conversationId}`;
    const currentCountStr = await this.redis.get(unreadCountKey);
    const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;
    await this.redis.set(unreadCountKey, (currentCount + 1).toString());
  }

  private mapMessageToDto(message: any): MessageResponseDto {
    const attachmentDto = message.media
      ? {
          id: message.media.id,
          url: message.media.file_url,
          type: message.media.file_type,
        }
      : undefined;

    return plainToInstance(
      MessageResponseDto,
      {
        messageId: message.id,
        conversationId: message.conversation_id,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
        },
        messageText: message.message_text,
        sentAt: message.sent_at,
        isRead: message.is_read,
        readAt: message.read_at,
        attachment: attachmentDto,
      },
      { excludeExtraneousValues: true },
    );
  }
}
