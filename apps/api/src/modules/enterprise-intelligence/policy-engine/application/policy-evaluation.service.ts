import { Injectable, Logger } from '@nestjs/common';
import type { PolicyEntity } from '../domain/policy.entity.js';
import type { PolicyMatch } from '../domain/policy-evaluation.vo.js';

export interface EvaluationContext {
  userId?: string;
  scope?: string;
  scopeId?: string;
  roles?: string[];
  attributes?: Record<string, unknown>;
}

@Injectable()
export class PolicyEvaluationService {
  private readonly logger = new Logger(PolicyEvaluationService.name);

  matchPolicies(
    action: string,
    resource: string,
    context?: EvaluationContext,
    policies?: PolicyEntity[],
  ): PolicyEntity[] {
    if (!policies || policies.length === 0) return [];

    return policies.filter(policy => {
      if (!policy.enabled) return false;

      const actionMatch = this.matchPattern(policy.action, action);
      const resourceMatch = this.matchPattern(policy.resource, resource);

      if (!actionMatch || !resourceMatch) return false;

      if (context?.scope && policy.scope !== 'global') {
        if (policy.scope !== context.scope) return false;
        if (policy.scopeId && policy.scopeId !== '*' && policy.scopeId !== context.scopeId) return false;
      }

      return true;
    });
  }

  evaluateConditions(policy: PolicyEntity, context?: EvaluationContext): boolean {
    if (!policy.conditions || Object.keys(policy.conditions).length === 0) return true;
    if (!context) return false;

    for (const [key, value] of Object.entries(policy.conditions)) {
      if (key === 'roles' && context.roles) {
        const requiredRoles = value as string[];
        if (!requiredRoles.some(role => context.roles!.includes(role))) return false;
        continue;
      }

      if (key === 'userId' && context.userId) {
        if (context.userId !== value) return false;
        continue;
      }

      if (context.attributes && key in context.attributes) {
        if (context.attributes[key] !== value) return false;
        continue;
      }

      if (key in context) {
        if ((context as Record<string, unknown>)[key] !== value) return false;
        continue;
      }

      return false;
    }

    return true;
  }

  resolveConflict(matches: PolicyMatch[]): { allowed: boolean; reason: string } {
    if (matches.length === 0) {
      return { allowed: true, reason: 'No matching policies — access granted by default' };
    }

    const sorted = [...matches].sort((a, b) => b.priority - a.priority);
    const highestPriority = sorted[0]!.priority;
    const topMatches = sorted.filter(m => m.priority === highestPriority);

    const hasDeny = topMatches.some(m => m.effect === 'deny');

    if (hasDeny) {
      const denyPolicies = topMatches.filter(m => m.effect === 'deny');
      return {
        allowed: false,
        reason: `Denied by policies: ${denyPolicies.map(m => `${m.name} (${m.policyId})`).join(', ')}`,
      };
    }

    return {
      allowed: true,
      reason: `Allowed by policies: ${topMatches.map(m => `${m.name} (${m.policyId})`).join(', ')}`,
    };
  }

  private matchPattern(pattern: string, value: string): boolean {
    if (pattern === '*') return true;
    const regexStr = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regexStr}$`).test(value);
  }
}
