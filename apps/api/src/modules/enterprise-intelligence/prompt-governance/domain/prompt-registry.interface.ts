import type { PaginatedResult } from '../../shared/types/index.js';
import type { PromptEntity, PromptStatus } from './prompt.entity.js';

export interface PromptFindOptions {
  offset?: number;
  limit?: number;
  status?: PromptStatus;
}

export interface IPromptRegistry {
  register(entity: PromptEntity): Promise<void>;
  get(id: string): Promise<PromptEntity | null>;
  getByName(name: string, version?: number): Promise<PromptEntity | null>;
  list(options?: PromptFindOptions): Promise<PaginatedResult<PromptEntity>>;
  search(query: string, options?: PromptFindOptions): Promise<PaginatedResult<PromptEntity>>;
  delete(id: string): Promise<void>;
}
