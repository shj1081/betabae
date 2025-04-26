import { IsEmail } from 'class-validator';

export class LoginResponseDto {
  @IsEmail()
  email: string;

  constructor(email: string) {
    this.email = email;
  }
}
