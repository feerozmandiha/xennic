import { Module } from '@nestjs/common';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { EnterpriseAgentsController } from './presentation/controllers/enterprise-agents.controller.js';
import { AgentOrchestratorService } from './application/services/agent-orchestrator.service.js';
import { AgentRegistry } from './application/services/agent-registry.service.js';
import { ToolExecutor } from './application/services/tool-executor.service.js';
import { MultiAgentOrchestrator } from './application/services/multi-agent-orchestrator.service.js';
import { AgentMemory } from './application/services/agent-memory.service.js';
import { AgentSafety } from './application/services/agent-safety.service.js';

@Module({
  imports: [WorkspaceModule],
  controllers: [EnterpriseAgentsController],
  providers: [
    { provide: 'IAgentRegistry', useClass: AgentRegistry },
    AgentRegistry,
    { provide: 'IToolExecutor', useClass: ToolExecutor },
    ToolExecutor,
    { provide: 'IMultiAgentOrchestrator', useClass: MultiAgentOrchestrator },
    MultiAgentOrchestrator,
    { provide: 'IAgentMemory', useClass: AgentMemory },
    AgentMemory,
    { provide: 'IAgentSafety', useClass: AgentSafety },
    AgentSafety,
    AgentOrchestratorService,
  ],
  exports: [
    'IAgentRegistry', 'IToolExecutor', 'IMultiAgentOrchestrator',
    'IAgentMemory', 'IAgentSafety', AgentOrchestratorService,
  ],
})
export class EnterpriseAgentsModule {}
