import { IsString } from 'class-validator';

export class ErrorResponseDto {
  @IsString()
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
