import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Gender, MBTI } from '@prisma/client';
import { ErrorResponseDto } from 'src/dto/common/error.response.dto';
import { UpdateCredentialDto } from 'src/dto/user/credential.request.dto';
import { UserLoveLanguageDto } from 'src/dto/user/lovelanguage.request.dto';
import { UserLoveLanguageResponseDto } from 'src/dto/user/lovelanguage.response.dto';
import { UserPersonalityDto } from 'src/dto/user/personality.request.dto';
import { UserPersonalityResponseDto } from 'src/dto/user/personality.response.dto';
import { UserProfileDto } from 'src/dto/user/profile.request.dto';
import { ProfileDto, UserProfileResponseDto } from 'src/dto/user/profile.response.dto';
import { UserInfoResponseDto } from 'src/dto/user/user-info.response.dto';

import { PrismaService } from 'src/infra/prisma/prisma.service';
import { FileService } from '../file/file.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService
  ) {}

  async getAllUsersExcept(currentUserId: number) {
    return this.prisma.user.findMany({
      where: { id: { not: currentUserId } },
      select: {
        id: true,
        profile: {
          select: {
            nickname: true,
            birthday: true,
            gender: true,
            city: true,
            province: true,
            profile_image: { select: { file_url: true } },
          },
        },
      },
    });
  }

  async getUserProfile(userId: number) {
    // select를 이용하여 불필요 필드 차단 -> 쿼리 부담 줄임
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        legal_name: true,
        profile: {
          select: {
            nickname: true,
            birthday: true,
            introduce: true,
            gender: true,
            mbti: true,
            interests: true,
            province: true,
            city: true,
            profile_image: {
              select: {
                file_url: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        new ErrorResponseDto(`User with ID ${userId} not found`),
      );
    }

    // profile_image_url 필드를 직접 매핑
    const profileData = {
      user: {
        id: user.id,
        email: user.email,
        legal_name: user.legal_name,
      },
      profile: user.profile
        ? {
            nickname: user.profile.nickname,
            birthday: user.profile.birthday,
            introduce: user.profile.introduce,
            gender: user.profile.gender,
            mbti: user.profile.mbti,
            interests: user.profile.interests,
            province: user.profile.province,
            city: user.profile.city,
            profile_image_url: user.profile.profile_image?.file_url || null,
          }
        : null,
    };

    return plainToInstance(UserProfileResponseDto, profileData, {
      excludeExtraneousValues: true,
    });
  }

  async updateOrCreateUserProfile(
    userId: number, 
    dto: UserProfileDto, 
    profileImage?: Express.Multer.File
  ) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        new ErrorResponseDto(`User with ID ${userId} not found`),
      );
    }
    
    // Check if profile exists with related profile image
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { user_id: userId },
      include: { profile_image: true }
    });
    
    // Upload profile image if provided
    let profileMediaId: number | undefined;
    if (profileImage) {
      try {
        // Upload the file to S3 and create a media record
        const uploadResult = await this.fileService.uploadFile(profileImage, 'profile');
        profileMediaId = uploadResult.id;
        
        // If there was an existing profile image, delete it
        if (existingProfile?.profile_media_id) {
          await this.fileService.deleteFile(existingProfile.profile_media_id);
        }
      } catch (error) {
        throw new BadRequestException(
          new ErrorResponseDto(`Failed to upload profile image: ${error.message}`),
        );
      }
    }

    // 프로필 생성 또는 업데이트
    if (existingProfile) {
      // interests 처리
      const interests = dto.interests
        ? Array.isArray(dto.interests)
          ? dto.interests.join(',')
          : dto.interests
        : undefined;

      // 업데이트용 프로필 데이터 객체 구성 - null/undefined가 아닌 필드만 포함
      const profileData = Object.entries({
        nickname: dto.nickname,
        introduce: dto.introduce,
        birthday: new Date(dto.birthday),
        gender: dto.gender,
        mbti: dto.mbti,
        interests,
        province: dto.province,
        city: dto.city,
        profile_media_id: profileMediaId,
      }).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value;
        return acc;
      }, {});

      // 업데이트할 내용이 있는 경우만 업데이트
      if (Object.keys(profileData).length > 0) {
        await this.prisma.userProfile.update({
          where: { user_id: userId },
          data: profileData,
        });
      }
    } else {
      // 프로필 생성 시 필수 정보
      if (
        dto.nickname === undefined ||
        dto.birthday === undefined ||
        dto.gender === undefined ||
        dto.province === undefined ||
        dto.city === undefined
      ) {
        throw new BadRequestException(
          new ErrorResponseDto('Not enough profile information provided'),
        );
      }

      // 새 프로필 생성을 위한 타입 안전한 데이터 객체 생성
      const createProfileData = {
        nickname: dto.nickname!,
        introduce: dto.introduce!,
        birthday: new Date(dto.birthday!),
        gender: dto.gender!,
        province: dto.province!,
        city: dto.city!,
        mbti: dto.mbti!,
        interests: dto.interests,
        profile_media_id: profileMediaId,
      };

      await this.prisma.userProfile.create({
        data: {
          user_id: userId,
          ...createProfileData,
          interests: Array.isArray(dto.interests)
            ? dto.interests.join(',')
            : dto.interests || '',
        },
      });
    }

    // Return updated user with profile
    return this.getUserProfile(userId);
  }

  async getUserPersonality(userId: number) {
    const personality = await this.prisma.userPersonality.findUnique({
      where: { user_id: userId },
    });

    if (!personality) {
      throw new NotFoundException(
        new ErrorResponseDto(`User personality with ID ${userId} not found`),
      );
    }

    // Transform raw data to DTO using plainToInstance
    return plainToInstance(UserPersonalityResponseDto, personality, {
      excludeExtraneousValues: true,
    });
  }

  async updateOrCreateUserPersonality(userId: number, dto: UserPersonalityDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        new ErrorResponseDto(`User with ID ${userId} not found`),
      );
    }

    // Check if personality exists, upsert if needed
    const existingPersonality = await this.prisma.userPersonality.findUnique({
      where: { user_id: userId },
    });

    if (existingPersonality) {
      // Update existing personality
      return this.prisma.userPersonality.update({
        where: { user_id: userId },
        data: {
          openness: dto.openness,
          conscientiousness: dto.conscientiousness,
          extraversion: dto.extraversion,
          agreeableness: dto.agreeableness,
          neuroticism: dto.neuroticism,
          updated_at: new Date(),
        },
      });
    } else {
      // Create new personality
      return this.prisma.userPersonality.create({
        data: {
          user_id: userId,
          openness: dto.openness,
          conscientiousness: dto.conscientiousness,
          extraversion: dto.extraversion,
          agreeableness: dto.agreeableness,
          neuroticism: dto.neuroticism,
          updated_at: new Date(),
        },
      });
    }
  }

  async updateUserCredential(userId: number, dto: UpdateCredentialDto) {
    // 1. Find the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(
        new ErrorResponseDto(`User with ID ${userId} not found`),
      );
    }

    // 2. Compare passwords
    const passwordMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password_hash,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException(
        new ErrorResponseDto('Current password is incorrect'),
      );
    }

    // 3. Hash new password
    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });
  }

  async getUserLoveLanguage(userId: number) {
    const loveLanguage = await this.prisma.userLoveLanguage.findUnique({
      where: { user_id: userId },
    });

    if (!loveLanguage) {
      throw new NotFoundException(
        new ErrorResponseDto(
          `Love language data for user with ID ${userId} not found`,
        ),
      );
    }

    return plainToInstance(UserLoveLanguageResponseDto, loveLanguage, {
      excludeExtraneousValues: true,
    });
  }

  async updateOrCreateUserLoveLanguage(
    userId: number,
    dto: UserLoveLanguageDto,
  ) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(
        new ErrorResponseDto(`User with ID ${userId} not found`),
      );
    }

    // Check if love language exists, upsert if needed
    const existingLoveLanguage = await this.prisma.userLoveLanguage.findUnique({
      where: { user_id: userId },
    });

    if (existingLoveLanguage) {
      // Update existing love language
      return this.prisma.userLoveLanguage.update({
        where: { user_id: userId },
        data: {
          words_of_affirmation: dto.words_of_affirmation,
          acts_of_service: dto.acts_of_service,
          receiving_gifts: dto.receiving_gifts,
          quality_time: dto.quality_time,
          physical_touch: dto.physical_touch,
          updated_at: new Date(),
        },
      });
    } else {
      // Create new love language
      return this.prisma.userLoveLanguage.create({
        data: {
          user_id: userId,
          words_of_affirmation: dto.words_of_affirmation,
          acts_of_service: dto.acts_of_service,
          receiving_gifts: dto.receiving_gifts,
          quality_time: dto.quality_time,
          physical_touch: dto.physical_touch,
          updated_at: new Date(),
        },
      });
    }
  }

  // Calculate personality from survey answers (mock logic)
  async scorePersonalitySurvey(userId: number, dto: { answers: number[] }) {
    const [a1, a2, a3, a4, a5] = dto.answers;
    const personality = {
      id: 0, // mocked ID
      user_id: userId,
      openness: a1,
      conscientiousness: a2,
      extraversion: a3,
      agreeableness: a4,
      neuroticism: a5,
      created_at: new Date(), // mock
      updated_at: new Date(), // mock
    }; 

    // Save to database
    await this.updateOrCreateUserPersonality(userId, {
      openness: personality.openness,
      conscientiousness: personality.conscientiousness,
      extraversion: personality.extraversion,
      agreeableness: personality.agreeableness,
      neuroticism: personality.neuroticism,
    });

    return personality;
  }

  // Calculate love language from survey answers (mock logic)
  async scoreLoveLanguageSurvey(userID: number, dto: { answers: number[] }) {
    const [a1, a2, a3, a4, a5] = dto.answers;
    const loveLanguage = {
      id: 0, // mocked ID
      user_id: userID,
      words_of_affirmation: a1,
      acts_of_service: a2,
      receiving_gifts: a3,
      quality_time: a4,
      physical_touch: a5,
      created_at: new Date(), // mock
      updated_at: new Date(), // mock
    };

    // save to database
    await this.updateOrCreateUserLoveLanguage(userID, {
      words_of_affirmation: loveLanguage.words_of_affirmation,
      acts_of_service: loveLanguage.acts_of_service,
      receiving_gifts: loveLanguage.receiving_gifts,
      quality_time: loveLanguage.quality_time,
      physical_touch: loveLanguage.physical_touch,
    });

    return loveLanguage;
  }

  /**
   * Get comprehensive user information including profile, personality, and love language data
   * 
   * @param userId - The ID of the user to fetch information for
   * @returns Combined user information including profile, personality, and love language data
   * @throws NotFoundException if the user, personality, or love language data is not found
   */
  async getUserInfo(userId: number) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        legal_name: true,
        profile: {
          select: {
            nickname: true,
            birthday: true,
            introduce: true,
            gender: true,
            mbti: true,
            interests: true,
            province: true,
            city: true,
            profile_image: {
              select: {
                file_url: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(
        new ErrorResponseDto(`User with ID ${userId} not found`),
      );
    }

    // Get personality data
    const personality = await this.prisma.userPersonality.findUnique({
      where: { user_id: userId },
    });

    if (!personality) {
      throw new NotFoundException(
        new ErrorResponseDto(`Personality data for user with ID ${userId} not found`),
      );
    }

    // Get love language data
    const loveLanguage = await this.prisma.userLoveLanguage.findUnique({
      where: { user_id: userId },
    });

    if (!loveLanguage) {
      throw new NotFoundException(
        new ErrorResponseDto(`Love language data for user with ID ${userId} not found`),
      );
    }

    // Format user profile data
    const userDto = {
      id: user.id,
      email: user.email,
      legal_name: user.legal_name,
    };

    // Convert profile data to match ProfileDto type
    const profileDto: ProfileDto = user.profile
      ? {
          nickname: user.profile.nickname,
          birthday: user.profile.birthday,
          introduce: user.profile.introduce || undefined, // Convert null to undefined
          gender: user.profile.gender,
          mbti: user.profile.mbti || undefined, // Convert null to undefined
          interests: typeof user.profile.interests === 'string' 
            ? user.profile.interests.split(',') 
            : (user.profile.interests as string[] || []),
          province: user.profile.province,
          city: user.profile.city,
          profile_image_url: user.profile.profile_image?.file_url || undefined,
        }
      : { // Create a default profile if null to satisfy type requirements
          nickname: '',
          birthday: new Date(),
          gender: Gender.MALE,
          interests: [],
          province: '',
          city: '',
        };

    return new UserInfoResponseDto(
      userDto,
      profileDto,
      plainToInstance(UserPersonalityResponseDto, personality, { excludeExtraneousValues: true }),
      plainToInstance(UserLoveLanguageResponseDto, loveLanguage, { excludeExtraneousValues: true }),
    );
  }
}
