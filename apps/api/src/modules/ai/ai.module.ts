import { Module } from '@nestjs/common';
import { AiController }   from './presentation/controllers/ai.controller.js';
import { AiService }      from './application/services/ai.service.js';
import { AiRepository }   from './infrastructure/repositories/ai.repository.js';
import { LlmProvider }    from './infrastructure/providers/llm.provider.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';

@Module({
  imports: [WorkspaceModule],
  controllers: [AiController],
  providers: [
    AiService,
    LlmProvider,
    {
      provide:  'IAiRepository',
      useClass: AiRepository,
    },
  ],
  exports: [AiService, LlmProvider],
})
export class AiModule {}
