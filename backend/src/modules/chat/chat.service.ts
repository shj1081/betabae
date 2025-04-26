import {
  BadRequestException,
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
    private readonly llmService: LlmService,
  ) {}

  //
  // Core Business Logic (Public Methods)
  //

  async getConversations(userId: number): Promise<ConversationListResponseDto> {
    // 매칭 중 REAL_BAE 대화만
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ requester_id: userId }, { requested_id: userId }],
        status: MatchStatus.ACCEPTED,
        conversations: {
          some: {
            type: ConversationType.REAL_BAE,
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
            type: ConversationType.REAL_BAE,
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

    // 읽음처리
    await this.markMessagesAsRead(userId, conversationId);

    return messages.map((m) => this.mapMessageToDto(m));
  }

  async sendTextMessage(
    senderId: number,
    conversationId: number,
    messageText: string,
  ) {
    // conversation 정보
    const conversation = await this.getConversationEntity(
      conversationId,
      senderId,
    );

    if (conversation.type === ConversationType.REAL_BAE) {
      // REAL_BAE 로직
      await this.prisma.message.create({
        data: {
          conversation_id: conversationId,
          sender_id: senderId,
          message_text: messageText,
          is_read: false,
        },
        include: {
          sender: { select: { id: true } },
        },
      });

      await this.updateConversationActivity(conversationId);
      await this.incrementUnreadCount(senderId, conversationId);
    } else if (conversation.type === ConversationType.BETA_BAE) {
      const botReply = await this.llmService.getAnswerFromBot(messageText);

      // 유저 답변과 llm 답변을 DB 저장 (임시)
      await this.prisma.message.create({
        data: {
          conversation_id: conversationId,
          sender_id: senderId,
          message_text: `[USER] ${messageText}`,
          is_read: true,
        },
      });
      await this.prisma.message.create({
        data: {
          conversation_id: conversationId,
          sender_id: 0, // bot user id = 0 or something
          message_text: `[BOT] ${botReply}`,
          is_read: true,
        },
      });
    }

    // TODO: error dto 처리
    throw new BadRequestException(
      new ErrorResponseDto('Unsupported conversation type'),
    );
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

  async markMessagesAsRead(
    userId: number,
    conversationId: number,
  ): Promise<void> {
    await this.verifyConversationAccess(userId, conversationId);

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
    if (userId !== requester_id && userId !== requested_id) {
      throw new BadRequestException(
        new ErrorResponseDto('You do not have access to this conversation'),
      );
    }
  }

  private async updateConversationActivity(conversationId: number) {
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updated_at: new Date() },
    });
  }

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
