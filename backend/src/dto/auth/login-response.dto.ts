import { IsBoolean, IsEmail } from 'class-validator';

export class LoginResponseDto {
  @IsEmail()
  email: string;

  @IsBoolean()
  hasProfile: boolean;

  @IsBoolean()
  hasLoveLanguage: boolean;

  @IsBoolean()
  hasPersonality: boolean;

  constructor(email: string, hasProfile: boolean = false, hasLoveLanguage: boolean = false, hasPersonality: boolean = false) {
    this.email = email;
    this.hasProfile = hasProfile;
    this.hasLoveLanguage = hasLoveLanguage;
    this.hasPersonality = hasPersonality;
  }
}
