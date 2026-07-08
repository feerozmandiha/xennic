import { Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { PromptRegistryService } from './application/prompt-registry.service.js';
import { PromptTemplateService } from './application/prompt-template.service.js';
import { PromptPolicyService } from './application/prompt-policy.service.js';
import { PromptAuditService } from './application/prompt-audit.service.js';
import { PromptEvaluationService } from './application/prompt-evaluation.service.js';
import { PrismaPromptRegistry } from './infrastructure/persistence/prisma-prompt-registry.js';
import { PrismaTemplateRegistry } from './infrastructure/persistence/prisma-template-registry.js';
import { PrismaPromptPolicyRepo } from './infrastructure/persistence/prisma-prompt-policy-repo.js';

@Global()
@Module({
  providers: [
    PromptRegistryService,
    PromptTemplateService,
    PromptPolicyService,
    PromptAuditService,
    PromptEvaluationService,
    { provide: 'IPromptRegistry', useClass: PrismaPromptRegistry },
    { provide: 'ITemplateRegistry', useClass: PrismaTemplateRegistry },
    { provide: 'IPromptPolicyRepository', useClass: PrismaPromptPolicyRepo },
  ],
  exports: [
    PromptRegistryService,
    PromptTemplateService,
    PromptPolicyService,
    PromptAuditService,
    PromptEvaluationService,
  ],
})
export class PromptGovernanceModule implements OnModuleInit {
  private readonly logger = new Logger(PromptGovernanceModule.name);

  onModuleInit(): void {
    this.logger.log('Prompt Governance Module initialized');
  }
}
