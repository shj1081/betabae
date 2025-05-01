import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class EnterRoomDto {
  @IsInt()
  @IsNotEmpty()
  cid: number;
}

export class LeaveRoomDto {
  @IsInt()
  @IsNotEmpty()
  cid: number;
}

export class SendTextDto {
  @IsInt()
  @IsNotEmpty()
  cid: number;

  @IsString()
  @IsNotEmpty()
  text: string;
}
