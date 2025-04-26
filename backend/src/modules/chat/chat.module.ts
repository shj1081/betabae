import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FileModule } from '../file/file.module';
import { LlmModule } from '../llm/llm.module';
import { ChatAnalysisService } from './chat-analysis.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [
    FileModule, 
    forwardRef(() => AuthModule), 
    forwardRef(() => LlmModule)
  ],
  providers: [ChatService, ChatGateway, ChatAnalysisService],
  controllers: [ChatController],
  exports: [ChatService, ChatAnalysisService, ChatGateway],
})
export class ChatModule {}
