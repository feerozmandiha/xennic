import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import type { PaginatedResult } from '../../shared/types/index.js';
import { PromptPolicyEntity, type PolicyRule, type PolicyEffect } from '../domain/prompt-policy.entity.js';
import type { IPromptPolicyRepository, PolicyFindOptions } from '../domain/prompt-policy-repository.interface.js';

export interface EvaluationResult {
  allowed: boolean;
  matchedRules: PolicyRule[];
}

@Injectable()
export class PromptPolicyService {
  private readonly logger = new Logger(PromptPolicyService.name);

  constructor(
    @Inject('IPromptPolicyRepository') private readonly repo: IPromptPolicyRepository,
  ) {}

  async create(
    data: {
      name: string;
      description: string;
      rules: PolicyRule[];
      effect: PolicyEffect;
      priority: number;
      createdBy: string;
    },
  ): Promise<PromptPolicyEntity> {
    const entity = PromptPolicyEntity.create(
      data.name,
      data.description,
      data.rules,
      data.effect,
      data.priority,
      data.createdBy,
    );
    await this.repo.save(entity);
    this.logger.debug(`Created policy ${entity.id} (${data.name})`);
    return entity;
  }

  async get(id: string): Promise<PromptPolicyEntity> {
    const entity = await this.repo.get(id);
    if (!entity) {
      throw new NotFoundException(`Policy ${id} not found`);
    }
    return entity;
  }

  async evaluate(
    promptId: string,
    action: string,
    context?: Record<string, unknown>,
  ): Promise<EvaluationResult> {
    const allowPolicies = await this.repo.findByEffect('allow');
    const denyPolicies = await this.repo.findByEffect('deny');

    const allPolicies = [...denyPolicies, ...allowPolicies].sort(
      (a, b) => b.priority - a.priority,
    );

    const matchedRules: PolicyRule[] = [];
    let matchedAllow = false;

    for (const policy of allPolicies) {
      for (const rule of policy.rules) {
        const resourceMatch = this.matchResource(rule.resource, promptId);
        const actionMatch = rule.action === '*' || rule.action === action;
        const conditionMatch = this.matchCondition(rule.condition, context);

        if (resourceMatch && actionMatch && conditionMatch) {
          matchedRules.push(rule);

          if (policy.effect === 'deny') {
            if (!matchedAllow) {
              return { allowed: false, matchedRules };
            }
          } else {
            matchedAllow = true;
          }
        }
      }
    }

    return { allowed: matchedAllow || matchedRules.length === 0, matchedRules };
  }

  async list(options?: PolicyFindOptions): Promise<PaginatedResult<PromptPolicyEntity>> {
    return this.repo.list(options);
  }

  async delete(id: string): Promise<void> {
    await this.get(id);
    await this.repo.delete(id);
    this.logger.debug(`Deleted policy ${id}`);
  }

  private matchResource(pattern: string, promptId: string): boolean {
    if (pattern === '*') return true;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(promptId);
  }

  private matchCondition(
    condition: Record<string, unknown> | null,
    context?: Record<string, unknown>,
  ): boolean {
    if (!condition) return true;
    if (!context) return false;

    for (const [key, value] of Object.entries(condition)) {
      if (context[key] !== value) return false;
    }

    return true;
  }
}
