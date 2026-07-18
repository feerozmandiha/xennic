import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { DecisionLoggerService } from './application/decision-logger.service.js';
import { RationaleService } from './application/rationale.service.js';
import { ConfidenceService } from './application/confidence.service.js';
import { ExplainabilityService } from './application/explainability.service.js';
import { PrismaExplainabilityRepository } from './infrastructure/persistence/prisma-explainability-repository.js';

@Global()
@Module({
  providers: [
    DecisionLoggerService,
    RationaleService,
    ConfidenceService,
    ExplainabilityService,
    { provide: 'IExplainabilityRepository', useClass: PrismaExplainabilityRepository },
  ],
  exports: [ExplainabilityService, DecisionLoggerService],
})
export class ExplainabilityModule implements OnModuleInit {
  private readonly logger = new Logger(ExplainabilityModule.name);

  onModuleInit(): void {
    this.logger.log('Explainability & Audit Module initialized');
  }
}
