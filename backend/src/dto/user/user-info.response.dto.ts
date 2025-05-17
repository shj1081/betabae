import { Gender, MBTI } from '@prisma/client';
import { Expose, Transform, Type } from 'class-transformer';
import { ProfileDto, UserDto } from './profile.response.dto';
import { UserPersonalityResponseDto } from './personality.response.dto';
import { UserLoveLanguageResponseDto } from './lovelanguage.response.dto';

export class UserInfoResponseDto {
  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  @Type(() => ProfileDto)
  profile: ProfileDto;

  @Expose()
  @Type(() => UserPersonalityResponseDto)
  personality: UserPersonalityResponseDto;

  @Expose()
  @Type(() => UserLoveLanguageResponseDto)
  loveLanguage: UserLoveLanguageResponseDto;

  constructor(
    user: UserDto,
    profile: ProfileDto,
    personality: UserPersonalityResponseDto,
    loveLanguage: UserLoveLanguageResponseDto,
  ) {
    this.user = user;
    this.profile = profile;
    this.personality = personality;
    this.loveLanguage = loveLanguage;
  }
}
