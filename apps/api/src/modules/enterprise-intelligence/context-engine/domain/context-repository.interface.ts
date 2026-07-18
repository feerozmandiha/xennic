import type { ContextScope } from '../../shared/types/index.js';
import type { ContextEntity } from './context.entity.js';
import type { PaginatedResult } from '../../shared/types/index.js';

export interface FindByScopeOptions {
  offset?: number;
  limit?: number;
}

export interface IContextRepository {
  save(entity: ContextEntity): Promise<void>;
  findById(id: string): Promise<ContextEntity | null>;
  findByScope(
    scope: ContextScope,
    scopeId: string,
    options?: FindByScopeOptions,
  ): Promise<PaginatedResult<ContextEntity>>;
  findBySource(scope: ContextScope, scopeId: string, source: string): Promise<ContextEntity[]>;
  findKeys(scope: ContextScope, scopeId: string, keys: string[]): Promise<ContextEntity[]>;
  delete(id: string): Promise<void>;
  deleteByScope(scope: ContextScope, scopeId: string): Promise<void>;
}
