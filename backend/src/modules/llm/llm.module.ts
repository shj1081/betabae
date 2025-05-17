import { Module, forwardRef } from '@nestjs/common';
import { LlmCloneController } from 'src/modules/llm/llm-clone.controller';
import { LlmCloneService } from 'src/modules/llm/llm-clone.service';
import { OpenAIProvider } from 'src/modules/llm/providers/openai.provider';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [forwardRef(() => ChatModule)],
  providers: [LlmCloneService, OpenAIProvider],
  exports: [LlmCloneService],
  controllers: [LlmCloneController],
})
export class LlmModule {}
