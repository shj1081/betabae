export class FeedUserResponseDto {
  id: number;
  nickname: string;
  age: number;
  gender: string;
  city: string;
  province: string;
  profileImageUrl: string | null;
  compatibilityScore: number;
}

export class FeedUserListResponseDto {
  users: FeedUserResponseDto[];
  totalCount: number;

  constructor(users: FeedUserResponseDto[]) {
    this.users = users;
    this.totalCount = users.length;
  }
}
