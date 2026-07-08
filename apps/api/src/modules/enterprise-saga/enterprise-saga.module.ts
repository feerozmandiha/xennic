import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { SagaOrchestratorService } from './application/orchestrator/saga-orchestrator.service.js';
import { CompensationHandler } from './application/compensation/compensation-handler.js';
import { SagaInstanceRepository } from './infrastructure/persistence/saga-instance.repository.js';

@Module({
  providers: [
    SagaOrchestratorService,
    CompensationHandler,
    SagaInstanceRepository,
  ],
  exports: [
    SagaOrchestratorService,
    CompensationHandler,
  ],
})
export class EnterpriseSagaModule implements OnModuleInit {
  private readonly logger = new Logger(EnterpriseSagaModule.name);

  onModuleInit(): void {
    this.logger.log('Enterprise Saga Module initialized: orchestrator + compensation ready');
  }
}
