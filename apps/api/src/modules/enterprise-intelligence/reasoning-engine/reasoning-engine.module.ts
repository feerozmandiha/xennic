import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { ReasoningEngineService } from './application/reasoning-engine.service.js';
import { ReasoningPlannerService } from './application/reasoning-planner.service.js';
import { ReasoningReflectionService } from './application/reasoning-reflection.service.js';
import { ReasoningVerificationService } from './application/reasoning-verification.service.js';
import { ReasoningTelemetryService } from './application/reasoning-telemetry.service.js';
import { PrismaReasoningRepository } from './infrastructure/persistence/prisma-reasoning-repository.js';

@Global()
@Module({
  providers: [
    ReasoningEngineService,
    ReasoningPlannerService,
    ReasoningReflectionService,
    ReasoningVerificationService,
    ReasoningTelemetryService,
    { provide: 'IReasoningRepository', useClass: PrismaReasoningRepository },
  ],
  exports: [
    ReasoningEngineService,
    ReasoningPlannerService,
    ReasoningReflectionService,
    ReasoningVerificationService,
    ReasoningTelemetryService,
  ],
})
export class ReasoningEngineModule implements OnModuleInit {
  private readonly logger = new Logger(ReasoningEngineModule.name);

  onModuleInit(): void {
    this.logger.log('Reasoning Engine Module initialized');
  }
}
