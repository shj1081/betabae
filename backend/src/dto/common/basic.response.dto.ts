import { IsString } from 'class-validator';

export class BasicResponseDto {
  @IsString()
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
