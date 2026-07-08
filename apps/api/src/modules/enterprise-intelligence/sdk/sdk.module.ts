import { Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { ContextEngineModule } from '../context-engine/context-engine.module.js';
import { MemoryPlatformModule } from '../memory-platform/memory-platform.module.js';
import { PromptGovernanceModule } from '../prompt-governance/prompt-governance.module.js';
import { ToolRegistryModule } from '../tool-registry/tool-registry.module.js';
import { SkillRegistryModule } from '../skill-registry/skill-registry.module.js';
import { ReasoningEngineModule } from '../reasoning-engine/reasoning-engine.module.js';
import { PolicyEngineModule } from '../policy-engine/policy-engine.module.js';
import { AIGatewayModule } from '../ai-gateway/ai-gateway.module.js';
import { EvaluationPlatformModule } from '../evaluation-platform/evaluation-platform.module.js';
import { ContextApi } from './application/context-api.js';
import { MemoryApi } from './application/memory-api.js';
import { PromptApi } from './application/prompt-api.js';
import { ToolApi } from './application/tool-api.js';
import { SkillApi } from './application/skill-api.js';
import { ReasoningApi } from './application/reasoning-api.js';
import { PolicyApi } from './application/policy-api.js';
import { GatewayApi } from './application/gateway-api.js';
import { EvaluationApi } from './application/evaluation-api.js';
import { IntelligenceClient } from './application/intelligence-client.js';

@Global()
@Module({
  imports: [
    ContextEngineModule,
    MemoryPlatformModule,
    PromptGovernanceModule,
    ToolRegistryModule,
    SkillRegistryModule,
    ReasoningEngineModule,
    PolicyEngineModule,
    AIGatewayModule,
    EvaluationPlatformModule,
  ],
  providers: [
    ContextApi,
    MemoryApi,
    PromptApi,
    ToolApi,
    SkillApi,
    ReasoningApi,
    PolicyApi,
    GatewayApi,
    EvaluationApi,
    IntelligenceClient,
  ],
  exports: [
    ContextApi,
    MemoryApi,
    PromptApi,
    ToolApi,
    SkillApi,
    ReasoningApi,
    PolicyApi,
    GatewayApi,
    EvaluationApi,
    IntelligenceClient,
  ],
})
export class EnterpriseIntelligenceSdkModule implements OnModuleInit {
  private readonly logger = new Logger(EnterpriseIntelligenceSdkModule.name);

  onModuleInit(): void {
    this.logger.log('Enterprise Intelligence SDK Module initialized');
  }
}
