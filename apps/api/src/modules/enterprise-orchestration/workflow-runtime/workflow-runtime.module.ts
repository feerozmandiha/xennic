import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { WorkflowExecutorService } from './application/workflow-executor.service.js';
import { RetryHandlerService } from './application/retry-handler.service.js';
import { TimeoutHandlerService } from './application/timeout-handler.service.js';
import { CompensationService } from './application/compensation.service.js';
import { LifecycleService } from './application/lifecycle.service.js';
import { PrismaExecutionRepository } from './infrastructure/persistence/prisma-execution-repository.js';

@Global()
@Module({
  providers: [
    WorkflowExecutorService,
    RetryHandlerService,
    TimeoutHandlerService,
    CompensationService,
    LifecycleService,
    { provide: 'IExecutionRepository', useClass: PrismaExecutionRepository },
  ],
  exports: [
    WorkflowExecutorService,
    LifecycleService,
    CompensationService,
  ],
})
export class WorkflowRuntimeModule implements OnModuleInit {
  private readonly logger = new Logger(WorkflowRuntimeModule.name);

  onModuleInit(): void {
    this.logger.log('Workflow Runtime Module initialized');
  }
}
