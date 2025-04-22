import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { ConversationType } from '@prisma/client';

export class CreateConversationRequestDto {
  @IsInt()
  targetUserId: number;

  @IsEnum(ConversationType)
  @IsOptional()
  type?: ConversationType;
}
