import { Module, forwardRef } from '@nestjs/common';
import { LlmCloneController } from 'src/modules/llm/llm-clone.controller';
import { LlmCloneService } from 'src/modules/llm/llm-clone.service';
import { OpenAIProvider } from 'src/modules/llm/providers/openai.provider';
import { ChatModule } from '../chat/chat.module';
import { ClaudeProvider } from 'src/modules/llm/providers/claude.provider';
import { GeminiProvider } from 'src/modules/llm/providers/gemini.provider';
import { DeepSeekProvider } from 'src/modules/llm/providers/deepseek.provider';

@Module({
  imports: [forwardRef(() => ChatModule)],
  providers: [LlmCloneService, OpenAIProvider, ClaudeProvider, GeminiProvider, DeepSeekProvider],
  exports: [LlmCloneService],
  controllers: [LlmCloneController],
})
export class LlmModule {}
