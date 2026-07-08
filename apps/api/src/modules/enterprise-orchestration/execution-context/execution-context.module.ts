import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { ContextVariablesService } from './application/context-variables.service.js';
import { ArtifactService } from './application/artifact.service.js';
import { SharedMemoryService } from './application/shared-memory.service.js';
import { PrismaContextRepository } from './infrastructure/persistence/prisma-context-repository.js';

@Global()
@Module({
  providers: [
    ContextVariablesService,
    ArtifactService,
    SharedMemoryService,
    { provide: 'IContextRepository', useClass: PrismaContextRepository },
  ],
  exports: [
    ContextVariablesService,
    ArtifactService,
    SharedMemoryService,
  ],
})
export class ExecutionContextModule implements OnModuleInit {
  private readonly logger = new Logger(ExecutionContextModule.name);

  onModuleInit(): void {
    this.logger.log('Execution Context Module initialized');
  }
}
