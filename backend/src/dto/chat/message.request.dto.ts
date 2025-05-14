import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsInt()
  @IsNotEmpty()
  conversationId: number;

  @IsString()
  @IsNotEmpty()
  messageText: string;
}

export class SendImageMessageDto {
  @IsInt()
  @IsNotEmpty()
  conversationId: number;

  @IsString()
  @IsOptional()
  messageText?: string; // Optional caption for the image
}

export class SendFileMessageDto {
  @IsInt()
  @IsNotEmpty()
  conversationId: number;

  @IsString()
  @IsOptional()
  messageText?: string; // Optional description for the file
}
