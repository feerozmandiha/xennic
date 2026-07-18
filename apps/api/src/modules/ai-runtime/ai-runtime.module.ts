import { Module } from '@nestjs/common';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { AiRuntimeController } from './presentation/controllers/ai-runtime.controller.js';
import { ExecutionPipelineService } from './application/services/execution-pipeline.service.js';
import { ConversationContextManagerService } from './application/services/conversation-context-manager.service.js';
import { PromptRegistryService } from './application/services/prompt-registry.service.js';
import { PromptTemplateEngineService } from './application/services/prompt-template-engine.service.js';
import { ToolRegistryService } from './application/services/tool-registry.service.js';
import { ToolDispatcherService } from './application/services/tool-dispatcher.service.js';
import { AgentSessionManagerService } from './application/services/agent-session-manager.service.js';
import { AgentStateManagerService } from './application/services/agent-state-manager.service.js';
import { MemoryAbstractionService } from './application/services/memory-abstraction.service.js';
import { StreamingResponseManagerService } from './application/services/streaming-response-manager.service.js';
import { PrismaSessionStore } from './infrastructure/stores/prisma-session.store.js';
import { PrismaMemoryStore } from './infrastructure/stores/prisma-memory.store.js';
import { PrismaPromptTemplateStore } from './infrastructure/stores/prisma-prompt-template.store.js';
import { I_SESSION_STORE } from './domain/interfaces/session-store.interface.js';
import { I_MEMORY_STORE } from './domain/interfaces/memory-store.interface.js';
import { I_PROMPT_TEMPLATE_STORE } from './domain/interfaces/prompt-template-store.interface.js';
import { I_TOOL_REGISTRY } from './domain/interfaces/tool-registry.interface.js';

@Module({
  imports: [WorkspaceModule],
  controllers: [AiRuntimeController],
  providers: [
    ExecutionPipelineService,
    ConversationContextManagerService,
    PromptRegistryService,
    PromptTemplateEngineService,
    ToolRegistryService,
    ToolDispatcherService,
    AgentSessionManagerService,
    AgentStateManagerService,
    MemoryAbstractionService,
    StreamingResponseManagerService,
    {
      provide: I_SESSION_STORE,
      useClass: PrismaSessionStore,
    },
    {
      provide: I_MEMORY_STORE,
      useClass: PrismaMemoryStore,
    },
    {
      provide: I_PROMPT_TEMPLATE_STORE,
      useClass: PrismaPromptTemplateStore,
    },
    {
      provide: I_TOOL_REGISTRY,
      useExisting: ToolRegistryService,
    },
  ],
  exports: [
    ExecutionPipelineService,
    ConversationContextManagerService,
    ToolRegistryService,
    PromptRegistryService,
    PromptTemplateEngineService,
    ToolDispatcherService,
    AgentSessionManagerService,
    AgentStateManagerService,
    MemoryAbstractionService,
    StreamingResponseManagerService,
  ],
})
export class AiRuntimeModule {}
