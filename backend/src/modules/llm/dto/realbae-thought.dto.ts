import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RealBaeThoughtRequestDto {
  @IsString()
  @IsNotEmpty()
  messageText: string;

  @IsNumber()
  @Type(() => Number)
  chatId: number;
}

export class RealBaeThoughtResponseDto {
  response: string;

  constructor(response: string) {
    this.response = response;
  }
}
