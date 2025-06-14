import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { UserModule } from '../user/user.module';
import { FeedService } from './feed.service';
import { MatchScoreService } from './match-score.service';

@Module({
  imports: [UserModule],
  controllers: [FeedController],
  providers: [FeedService, MatchScoreService],
})
export class FeedModule {}
