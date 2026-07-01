import { Module } from '@nestjs/common';
import { WorkspaceModule } from '../workspace/workspace.module.js';

import { ReasoningKernel } from './application/services/reasoning-kernel.service.js';
import { EngineeringPlanner } from './application/services/engineering-planner.service.js';
import { WorkflowEngine } from './application/services/workflow-engine.service.js';
import { ToolRegistry } from './application/services/tool-registry.service.js';
import { CalcOrchestrator } from './application/services/calc-orchestrator.service.js';
import { KnowledgeGraphService } from './application/services/knowledge-graph.service.js';
import { DecisionEngine } from './application/services/decision-engine.service.js';
import { ReportGenerator } from './application/services/report-generator.service.js';
import { EngineeringMemory } from './application/services/engineering-memory.service.js';
import { AuditEngine } from './application/services/audit-engine.service.js';
import { EiOrchestratorService } from './application/services/ei-orchestrator.service.js';

import { EngineeringIntelligenceController } from './presentation/controllers/engineering-intelligence.controller.js';

@Module({
  imports: [WorkspaceModule],
  controllers: [EngineeringIntelligenceController],
  providers: [
    { provide: 'IReasoningKernel', useClass: ReasoningKernel },
    ReasoningKernel,
    { provide: 'IEngineeringPlanner', useClass: EngineeringPlanner },
    EngineeringPlanner,
    { provide: 'IWorkflowEngine', useClass: WorkflowEngine },
    WorkflowEngine,
    { provide: 'IToolRegistry', useClass: ToolRegistry },
    ToolRegistry,
    { provide: 'ICalcOrchestrator', useClass: CalcOrchestrator },
    CalcOrchestrator,
    { provide: 'IKnowledgeGraphService', useClass: KnowledgeGraphService },
    KnowledgeGraphService,
    { provide: 'IDecisionEngine', useClass: DecisionEngine },
    DecisionEngine,
    { provide: 'IReportGenerator', useClass: ReportGenerator },
    ReportGenerator,
    { provide: 'IEngineeringMemory', useClass: EngineeringMemory },
    EngineeringMemory,
    { provide: 'IAuditEngine', useClass: AuditEngine },
    AuditEngine,
    EiOrchestratorService,
  ],
  exports: [
    'IReasoningKernel',
    'IEngineeringPlanner',
    'IWorkflowEngine',
    'IToolRegistry',
    'ICalcOrchestrator',
    'IKnowledgeGraphService',
    'IDecisionEngine',
    'IReportGenerator',
    'IEngineeringMemory',
    'IAuditEngine',
    EiOrchestratorService,
  ],
})
export class EngineeringIntelligenceModule {}
