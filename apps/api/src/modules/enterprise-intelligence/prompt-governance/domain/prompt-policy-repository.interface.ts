import type { PaginatedResult } from '../../shared/types/index.js';
import type { PromptPolicyEntity, PolicyEffect } from './prompt-policy.entity.js';

export interface PolicyFindOptions {
  offset?: number;
  limit?: number;
}

export interface IPromptPolicyRepository {
  save(entity: PromptPolicyEntity): Promise<void>;
  get(id: string): Promise<PromptPolicyEntity | null>;
  list(options?: PolicyFindOptions): Promise<PaginatedResult<PromptPolicyEntity>>;
  findByEffect(effect: PolicyEffect): Promise<PromptPolicyEntity[]>;
  delete(id: string): Promise<void>;
}
