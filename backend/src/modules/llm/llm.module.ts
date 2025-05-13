import { Module, forwardRef } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { LlmCloneService } from 'src/modules/llm/llm-clone.service';
import { LlmCloneController } from 'src/modules/llm/llm-clone.controller';

@Module({
  imports: [forwardRef(() => ChatModule)],
  providers: [LlmCloneService],
  exports: [LlmCloneService],
  controllers: [LlmCloneController],
})
export class LlmModule {}
