import { ConversationType } from '@prisma/client';
import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsNumber } from 'class-validator';
import { MessageResponseDto } from './message.response.dto';

export class ChatPartnerDto {
  @Expose()
  id: number;

  @Expose()
  nickname: string;

  @Expose()
  profileImageUrl?: string;
}

export class ConversationResponseDto {
  @Expose()
  conversationId: number;

  @Expose()
  matchId: number;

  @Expose()
  type: ConversationType;

  @Expose()
  @Type(() => ChatPartnerDto)
  chatPartner: ChatPartnerDto;

  @Expose()
  unreadCount: number;

  @Expose()
  @Type(() => MessageResponseDto)
  lastMessage?: MessageResponseDto;

  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toISOString();
    } else if (value) {
      return new Date(value).toISOString();
    }
    return null;
  })
  createdAt: Date;

  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toISOString();
    } else if (value) {
      return new Date(value).toISOString();
    }
    return null;
  })
  updatedAt: Date;
}

export class ConversationListResponseDto {
  @IsArray()
  @Type(() => ConversationResponseDto)
  conversations: ConversationResponseDto[];

  @IsNumber()
  totalUnreadCount: number;

  constructor(
    conversations: ConversationResponseDto[],
    totalUnreadCount: number,
  ) {
    this.conversations = conversations;
    this.totalUnreadCount = totalUnreadCount;
  }
}
