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
  @IsString()
  analysis: string;

  @IsString()
  suggestions: string;

  constructor(analysis: string, suggestions: string) {
    this.analysis = analysis;
    this.suggestions = suggestions;
  }
}
