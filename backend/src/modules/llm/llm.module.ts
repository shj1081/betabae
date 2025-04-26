import { Module, forwardRef } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { LlmService } from './llm.service';

@Module({
  imports: [forwardRef(() => ChatModule)],
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
