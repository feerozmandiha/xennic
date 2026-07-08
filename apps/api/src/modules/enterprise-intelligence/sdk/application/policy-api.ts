import { Injectable, Logger } from '@nestjs/common';
import type { PolicyEntity } from '../../policy-engine/domain/policy.entity.js';
import type { PolicyEvaluationResult } from '../../policy-engine/domain/policy-evaluation.vo.js';
import type { EvaluationContext } from '../../policy-engine/application/policy-evaluation.service.js';
import { PolicyEnforcementService } from '../../policy-engine/application/policy-enforcement.service.js';
import { PolicyManagementService, type CreatePolicyData } from '../../policy-engine/application/policy-management.service.js';
import type { PaginatedResult } from '../../shared/types/index.js';
import type { PolicyFindOptions } from '../../policy-engine/domain/policy-repository.interface.js';

@Injectable()
export class PolicyApi {
  private readonly logger = new Logger(PolicyApi.name);

  constructor(
    private readonly enforcement: PolicyEnforcementService,
    private readonly management: PolicyManagementService,
  ) {}

  async evaluate(
    action: string,
    resource: string,
    context?: EvaluationContext,
  ): Promise<PolicyEvaluationResult> {
    this.logger.debug(`evaluate(action=${action}, resource=${resource})`);
    return this.enforcement.evaluate(action, resource, context);
  }

  async canAccess(userId: string, action: string, resource: string): Promise<boolean> {
    return this.enforcement.canAccess(userId, action, resource);
  }

  async createPolicy(data: CreatePolicyData): Promise<PolicyEntity> {
    this.logger.debug(`createPolicy(name=${data.name})`);
    return this.management.create(data);
  }

  async listPolicies(options?: PolicyFindOptions): Promise<PaginatedResult<PolicyEntity>> {
    return this.management.list(options);
  }
}
