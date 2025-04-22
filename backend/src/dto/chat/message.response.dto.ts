import { Expose, Transform, Type } from 'class-transformer';

export class MessageSenderDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

export class MessageAttachmentDto {
  @Expose()
  id: number;

  @Expose()
  url: string;

  @Expose()
  type: string;
}

export class MessageResponseDto {
  @Expose()
  messageId: number;

  @Expose()
  conversationId: number;

  @Expose()
  @Type(() => MessageSenderDto)
  sender: MessageSenderDto;

  @Expose()
  messageText: string;

  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toISOString();
    } else if (typeof value === 'string') {
      return value;
    }
    return null;
  })
  sentAt: Date;

  @Expose()
  isRead: boolean;

  @Expose()
  @Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toISOString();
    } else if (typeof value === 'string') {
      return value;
    }
    return null;
  })
  readAt?: Date;

  @Expose()
  @Type(() => MessageAttachmentDto)
  attachment?: MessageAttachmentDto;
}
