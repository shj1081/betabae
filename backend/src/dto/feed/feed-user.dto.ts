export class FeedUserResponseDto {
  id: number;
  nickname: string;
  age: number;
  gender: string;
  city: string;
  province: string;
  profileImageUrl: string | null;
  compatibilityScore: number; // Overall percentage score (0-100)
}

export class FeedUserListResponseDto {
  users: FeedUserResponseDto[];
  totalCount: number;
  averageMatchScore: number;

  constructor(users: FeedUserResponseDto[]) {
    this.users = users;
    this.totalCount = users.length;
    
    // Calculate average match score
    if (users.length > 0) {
      const sum = users.reduce((acc, user) => acc + user.compatibilityScore, 0);
      this.averageMatchScore = Math.round(sum / users.length);
    } else {
      this.averageMatchScore = 0;
    }
  }
}
