import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/infra/prisma/prisma.module';
import { RedisModule } from 'src/infra/redis/redis.module';
import { FileModule } from '../file/file.module';
import { LlmModule } from '../llm/llm.module';
// import { ChatAnalysisService } from './chat-analysis.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [FileModule, PrismaModule, RedisModule, forwardRef(() => LlmModule)],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
