import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';

import { WorkflowEngineModule } from './workflow-engine/workflow-engine.module.js';
import { PlanningEngineModule } from './planning-engine/planning-engine.module.js';
import { WorkflowRuntimeModule } from './workflow-runtime/workflow-runtime.module.js';
import { HumanInTheLoopModule } from './human-in-the-loop/human-in-the-loop.module.js';
import { MultiAgentModule } from './multi-agent/multi-agent.module.js';
import { ExecutionContextModule } from './execution-context/execution-context.module.js';
import { ConversationRuntimeModule } from './conversation-runtime/conversation-runtime.module.js';
import { CostManagementModule } from './cost-management/cost-management.module.js';
import { ExplainabilityModule } from './explainability/explainability.module.js';

@Global()
@Module({
  imports: [
    WorkflowEngineModule,
    PlanningEngineModule,
    WorkflowRuntimeModule,
    HumanInTheLoopModule,
    MultiAgentModule,
    ExecutionContextModule,
    ConversationRuntimeModule,
    CostManagementModule,
    ExplainabilityModule,
  ],
  exports: [],
})
export class EnterpriseOrchestrationModule implements OnModuleInit {
  private readonly logger = new Logger(EnterpriseOrchestrationModule.name);

  onModuleInit(): void {
    this.logger.log('Enterprise Orchestration Platform initialized — 9 phases, 9 modules');
  }
}
