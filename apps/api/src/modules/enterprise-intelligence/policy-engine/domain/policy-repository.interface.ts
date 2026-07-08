import type { PaginatedResult } from '../../shared/types/index.js';
import type { PolicyEntity, PolicyEffect } from './policy.entity.js';

export interface PolicyFindOptions {
  offset?: number;
  limit?: number;
  enabled?: boolean;
}

export interface IPolicyRepository {
  save(entity: PolicyEntity): Promise<void>;
  get(id: string): Promise<PolicyEntity | null>;
  list(options?: PolicyFindOptions): Promise<PaginatedResult<PolicyEntity>>;
  findByResource(resource: string, scope?: string): Promise<PolicyEntity[]>;
  findByAction(action: string): Promise<PolicyEntity[]>;
  findByEffect(effect: PolicyEffect): Promise<PolicyEntity[]>;
  findByScope(scope: string): Promise<PolicyEntity[]>;
  delete(id: string): Promise<void>;
}
