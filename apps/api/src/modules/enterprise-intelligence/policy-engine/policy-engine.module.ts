import { Module, Global, Logger, OnModuleInit } from '@nestjs/common';
import { PolicyEnforcementService } from './application/policy-enforcement.service.js';
import { PolicyEvaluationService } from './application/policy-evaluation.service.js';
import { PolicyManagementService } from './application/policy-management.service.js';
import { PrismaPolicyRepository } from './infrastructure/persistence/prisma-policy-repository.js';

@Global()
@Module({
  providers: [
    PolicyEnforcementService,
    PolicyEvaluationService,
    PolicyManagementService,
    { provide: 'IPolicyRepository', useClass: PrismaPolicyRepository },
  ],
  exports: [
    PolicyEnforcementService,
    PolicyEvaluationService,
    PolicyManagementService,
    'IPolicyRepository',
  ],
})
export class PolicyEngineModule implements OnModuleInit {
  private readonly logger = new Logger(PolicyEngineModule.name);

  onModuleInit(): void {
    this.logger.log('Policy Engine Module initialized');
  }
}
