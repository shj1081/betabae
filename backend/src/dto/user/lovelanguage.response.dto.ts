// Love language scale: 1–5 (min 1, max 5)
import { Expose, Transform } from 'class-transformer';

export class UserLoveLanguageResponseDto {
  @Expose()
  id: number;

  @Expose()
  user_id: number;

  @Expose()
  words_of_affirmation: number;

  @Expose()
  acts_of_service: number;

  @Expose()
  receiving_gifts: number;

  @Expose()
  quality_time: number;

  @Expose()
  physical_touch: number;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  created_at: Date;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  updated_at: Date;

  constructor(partial: Partial<UserLoveLanguageResponseDto>) {
    Object.assign(this, partial);
  }
}
