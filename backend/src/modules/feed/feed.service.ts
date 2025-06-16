import { Injectable } from '@nestjs/common';
import { Gender } from '@prisma/client';
import { FeedFilterDto } from 'src/dto/feed/feed-filter.dto';
import { FeedUserResponseDto } from 'src/dto/feed/feed-user.dto';
import { UserService } from '../user/user.service';
import { MatchScoreService, UserFeatures } from './match-score.service';

@Injectable()
export class FeedService {
  constructor(
    private readonly userService: UserService,
    private readonly matchScoreService: MatchScoreService
  ) {}

  async getHighlyCompatibleUsers(
    currentUserId: number,
    filters: FeedFilterDto,
  ): Promise<FeedUserResponseDto[]> {
    // Get current user's comprehensive information
    const currentUserInfo = await this.userService.getUserInfo(currentUserId);
    
    // Extract current user features for matching
    const currentUserFeatures: UserFeatures = {
      mbti: currentUserInfo.profile.mbti,
      interests: currentUserInfo.profile.interests || [],
      loveLang: [
        currentUserInfo.loveLanguage.words_of_affirmation,
        currentUserInfo.loveLanguage.acts_of_service,
        currentUserInfo.loveLanguage.receiving_gifts,
        currentUserInfo.loveLanguage.quality_time,
        currentUserInfo.loveLanguage.physical_touch,
      ],
      personality: [
        currentUserInfo.personality.openness,
        currentUserInfo.personality.conscientiousness,
        currentUserInfo.personality.extraversion,
        currentUserInfo.personality.agreeableness,
        currentUserInfo.personality.neuroticism,
      ],
      location: {
        province: currentUserInfo.profile.province || '',
        city: currentUserInfo.profile.city || '',
      },
      gender: currentUserInfo.profile.gender as Gender,
    };

    // Fetch all users except the current user
    const users = await this.userService.getAllUsersExcept(currentUserId);
    
    // Filter out users with ID 0 (bot dummy accounts) before processing
    const validUsers = users.filter(user => user.id !== 0);
    
    // Get comprehensive info for all users for matching
    const userInfoPromises = validUsers.map(user => this.userService.getUserInfo(user.id));
    const usersInfo = await Promise.all(userInfoPromises);
    
    // Calculate match scores and create feed user DTOs
    // Calculate match scores and create feed user DTOs
    const feedUsersWithNulls: (FeedUserResponseDto | null)[] = usersInfo
      .map(userInfo => {
        // Extract candidate user features for matching
        const candidateFeatures: UserFeatures = {
          mbti: userInfo.profile.mbti,
          interests: userInfo.profile.interests || [],
          loveLang: [
            userInfo.loveLanguage.words_of_affirmation,
            userInfo.loveLanguage.acts_of_service,
            userInfo.loveLanguage.receiving_gifts,
            userInfo.loveLanguage.quality_time,
            userInfo.loveLanguage.physical_touch,
          ],
          personality: [
            userInfo.personality.openness,
            userInfo.personality.conscientiousness,
            userInfo.personality.extraversion,
            userInfo.personality.agreeableness,
            userInfo.personality.neuroticism,
          ],
          location: {
            province: userInfo.profile.province,
            city: userInfo.profile.city,
          },
          gender: userInfo.profile.gender as Gender,
        };
        
        // Calculate match scores
        const matchScores = this.matchScoreService.calculateMatchScore(
          currentUserFeatures,
          candidateFeatures
        );
        
        // If matchScores is null (same gender MALE-MALE or FEMALE-FEMALE), skip this user
        if (matchScores === null) {
          return null;
        }
        
        // Convert to percentage for display (0-100)
        const compatibilityScore = Math.round(matchScores.totalScore * 100);
        
        // Create a properly typed FeedUserResponseDto object
        const feedUser: FeedUserResponseDto = {
          id: userInfo.user.id,
          nickname: userInfo.profile.nickname || '',
          age: userInfo.profile.birthday
            ? this.getAgeFromBirthday(userInfo.profile.birthday)
            : 0,
          gender: userInfo.profile.gender || '',
          city: userInfo.profile.city || '',
          province: userInfo.profile.province || '',
          profileImageUrl: userInfo.profile.profile_image_url || null,
          compatibilityScore,
        };
        
        return feedUser;
      });
      
    // Filter out null entries (users with same gender that were excluded)
    const feedUsers = feedUsersWithNulls.filter((user): user is FeedUserResponseDto => user !== null);

    // Apply filters and sort by compatibility score
    return feedUsers
      .filter(user => {
        // Apply filters if provided
        if (filters.age && user.age !== filters.age) return false;
        if (filters.gender && user.gender !== filters.gender) return false;
        if (
          filters.location &&
          user.city !== filters.location &&
          user.province !== filters.location
        )
          return false;
        return true;
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  private getAgeFromBirthday(birthday: string | Date): number {
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}
