import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IPolicyRepository } from '../domain/policy-repository.interface.js';
import type { PolicyEntity } from '../domain/policy.entity.js';
import { PolicyEvaluationResult, type PolicyMatch } from '../domain/policy-evaluation.vo.js';
import { PolicyEvaluationService, type EvaluationContext } from './policy-evaluation.service.js';

export interface EnforcementOptions {
  includeDisabled?: boolean;
}

@Injectable()
export class PolicyEnforcementService {
  private readonly logger = new Logger(PolicyEnforcementService.name);

  constructor(
    @Inject('IPolicyRepository')
    private readonly policyRepository: IPolicyRepository,
    private readonly evaluationService: PolicyEvaluationService,
  ) {}

  async evaluate(
    action: string,
    resource: string,
    context?: EvaluationContext,
    options?: EnforcementOptions,
  ): Promise<PolicyEvaluationResult> {
    const allPolicies = await this.policyRepository.list();
    const policies = options?.includeDisabled
      ? allPolicies.items
      : allPolicies.items.filter(p => p.enabled);

    const matched = this.evaluationService.matchPolicies(action, resource, context, policies);
    const matchedWithConditions = matched.filter(p => this.evaluationService.evaluateConditions(p, context));

    const matches: PolicyMatch[] = matchedWithConditions.map(p => ({
      policyId: p.id,
      name: p.name,
      effect: p.effect,
      priority: p.priority,
    }));

    const { allowed, reason } = this.evaluationService.resolveConflict(matches);

    this.logger.debug(
      `Evaluate action=${action} resource=${resource} → ${allowed ? 'ALLOW' : 'DENY'} (${reason})`,
    );

    return PolicyEvaluationResult.create({ allowed, reason, matchedPolicies: matches });
  }

  async canAccess(userId: string, action: string, resource: string): Promise<boolean> {
    const result = await this.evaluate(action, resource, { userId });
    return result.allowed;
  }

  async getUserPolicies(userId: string): Promise<PolicyEntity[]> {
    const allPolicies = await this.policyRepository.list();
    return allPolicies.items.filter(p => {
      if (!p.enabled) return false;
      if (p.conditions && p.conditions.userId && p.conditions.userId !== userId) return false;
      return true;
    });
  }
}
