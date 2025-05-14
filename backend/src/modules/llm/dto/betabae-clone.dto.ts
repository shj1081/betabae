import { IsArray } from 'class-validator';

export class BetaBaeCreateRequestDto {
  @IsArray()
  sampleUserResponses: string[];
}

export class BetaBaeUpdateRequestDto extends BetaBaeCreateRequestDto {}
