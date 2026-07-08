import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { CoordinatorService } from './application/coordinator.service.js';
import { WorkerService } from './application/worker.service.js';
import { ReviewerService } from './application/reviewer.service.js';
import { CriticService } from './application/critic.service.js';
import { SupervisorService } from './application/supervisor.service.js';
import { PrismaCoordinationRepository } from './infrastructure/persistence/prisma-coordination-repository.js';

@Global()
@Module({
  providers: [
    CoordinatorService,
    WorkerService,
    ReviewerService,
    CriticService,
    SupervisorService,
    { provide: 'ICoordinationRepository', useClass: PrismaCoordinationRepository },
  ],
  exports: [
    CoordinatorService,
    SupervisorService,
  ],
})
export class MultiAgentModule implements OnModuleInit {
  private readonly logger = new Logger(MultiAgentModule.name);

  onModuleInit(): void {
    this.logger.log('Multi-Agent Coordination Module initialized');
  }
}
