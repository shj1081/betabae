import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class MessageQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  before?: number;
}
