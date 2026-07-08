import type { ContextScope, PaginatedResult } from '../../shared/types/index.js';
import type { MemoryEntity, MemoryType } from './memory.entity.js';

export interface FindOptions {
  offset?: number;
  limit?: number;
}

export interface IMemoryStore {
  save(entity: MemoryEntity): Promise<void>;
  findById(id: string): Promise<MemoryEntity | null>;
  findByType(
    type: MemoryType,
    scope: ContextScope,
    scopeId: string,
    options?: FindOptions,
  ): Promise<PaginatedResult<MemoryEntity>>;
  findByScope(
    scope: ContextScope,
    scopeId: string,
    options?: FindOptions,
  ): Promise<PaginatedResult<MemoryEntity>>;
  search(query: string, options?: FindOptions): Promise<PaginatedResult<MemoryEntity>>;
  findByTags(
    tags: string[],
    options?: FindOptions & { scope?: ContextScope; scopeId?: string },
  ): Promise<PaginatedResult<MemoryEntity>>;
  delete(id: string): Promise<void>;
  deleteExpired(): Promise<number>;
  count(type?: MemoryType, scope?: ContextScope, scopeId?: string): Promise<number>;
}
