import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { FeedFilterDto } from 'src/dto/feed/feed-filter.dto';
import {
  FeedUserListResponseDto,
  FeedUserResponseDto,
} from 'src/dto/feed/feed-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /**
   * Get a list of highly compatible users, optionally filtered by criteria.
   *
   * @param filters - Filtering options such as age, gender, location, etc.
   * @returns The list of highly compatible users.
   */
  @UseGuards(AuthGuard)
  @Get()
  async getFeed(@Query() filters: FeedFilterDto, @Req() req: Request) {
    const currentUserId = Number(req['user'].id);
    const users: FeedUserResponseDto[] =
      await this.feedService.getHighlyCompatibleUsers(currentUserId, filters);
    return new FeedUserListResponseDto(users);
  }
}
