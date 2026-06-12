import { Module }                   from '@nestjs/common';
import { ConsultationsController }  from './presentation/controllers/consultations.controller.js';
import { ConsultationsService }     from './application/services/consultations.service.js';
import { ConsultationsRepository }  from './infrastructure/repositories/consultations.repository.js';
import { LlmProvider }              from '../ai/infrastructure/providers/llm.provider.js';
import { WorkspaceModule }          from '../workspace/workspace.module.js';

@Module({
  imports:     [WorkspaceModule],
  controllers: [ConsultationsController],
  providers:   [ConsultationsService, ConsultationsRepository, LlmProvider],
  exports:     [ConsultationsService],
})
export class ConsultationsModule {}
