import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { WorkflowDefinitionService } from './application/workflow-definition.service.js';
import { WorkflowTemplateService } from './application/workflow-template.service.js';
import { WorkflowValidatorService } from './application/workflow-validator.service.js';
import { PrismaWorkflowRepository } from './infrastructure/persistence/prisma-workflow-repository.js';

@Global()
@Module({
  providers: [
    WorkflowDefinitionService,
    WorkflowTemplateService,
    WorkflowValidatorService,
    { provide: 'IWorkflowRepository', useClass: PrismaWorkflowRepository },
    { provide: 'IWorkflowValidator', useClass: WorkflowValidatorService },
  ],
  exports: [WorkflowDefinitionService, WorkflowTemplateService],
})
export class WorkflowEngineModule implements OnModuleInit {
  private readonly logger = new Logger(WorkflowEngineModule.name);

  onModuleInit(): void {
    this.logger.log('Workflow Engine Module initialized');
  }
}
