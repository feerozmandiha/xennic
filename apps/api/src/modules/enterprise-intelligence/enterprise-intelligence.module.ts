import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';

import { ContextEngineModule } from './context-engine/context-engine.module.js';
import { MemoryPlatformModule } from './memory-platform/memory-platform.module.js';
import { PromptGovernanceModule } from './prompt-governance/prompt-governance.module.js';
import { ToolRegistryModule } from './tool-registry/tool-registry.module.js';
import { SkillRegistryModule } from './skill-registry/skill-registry.module.js';
import { ReasoningEngineModule } from './reasoning-engine/reasoning-engine.module.js';
import { PolicyEngineModule } from './policy-engine/policy-engine.module.js';
import { AIGatewayModule } from './ai-gateway/ai-gateway.module.js';
import { EvaluationPlatformModule } from './evaluation-platform/evaluation-platform.module.js';
import { EnterpriseIntelligenceSdkModule } from './sdk/sdk.module.js';

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
    EnterpriseIntelligenceSdkModule,
  ],
  exports: [EnterpriseIntelligenceSdkModule],
})
export class EnterpriseIntelligenceModule implements OnModuleInit {
  private readonly logger = new Logger(EnterpriseIntelligenceModule.name);

  onModuleInit(): void {
    this.logger.log('Enterprise Intelligence Platform initialized — 10 phases, 10 modules');
  }
}
