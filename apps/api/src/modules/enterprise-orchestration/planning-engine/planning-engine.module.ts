import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { DecompositionService } from './application/decomposition.service.js';
import { PlannerService } from './application/planner.service.js';
import { ReplannerService } from './application/replanner.service.js';
import { PrismaPlannerRepository } from './infrastructure/persistence/prisma-planner-repository.js';

@Global()
@Module({
  providers: [
    DecompositionService,
    PlannerService,
    ReplannerService,
    { provide: 'IPlannerRepository', useClass: PrismaPlannerRepository },
  ],
  exports: [
    PlannerService,
    ReplannerService,
  ],
})
export class PlanningEngineModule implements OnModuleInit {
  private readonly logger = new Logger(PlanningEngineModule.name);

  onModuleInit(): void {
    this.logger.log('Planning Engine Module initialized');
  }
}
