import { MatchStatus } from '@prisma/client';
import { Expose, Transform, Type } from 'class-transformer';

export class MatchUserInfoDto {
  @Expose()
  id: number;

  @Expose()
  legal_name: string;

  @Expose()
  email: string;
}

export class MatchResponseDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => MatchUserInfoDto)
  requester: MatchUserInfoDto;

  @Expose()
  @Type(() => MatchUserInfoDto)
  requested: MatchUserInfoDto;

  @Expose()
  status: MatchStatus;

  @Expose()
  requester_consent: boolean;

  @Expose()
  requested_consent: boolean;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  created_at: Date;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  updated_at: Date;

  constructor(partial: Partial<MatchResponseDto>) {
    Object.assign(this, partial);
  }
}

export class MatchListResponseDto {
  @Type(() => MatchResponseDto)
  matches: MatchResponseDto[];

  @Expose()
  totalCount: number;

  constructor(matches: MatchResponseDto[]) {
    this.matches = matches;
    this.totalCount = matches.length;
  }
}
