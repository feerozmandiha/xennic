import type { PaginatedResult } from '../../shared/types/index.js';
import type { PromptTemplateEntity } from './prompt-template.entity.js';

export interface TemplateFindOptions {
  offset?: number;
  limit?: number;
}

export interface ITemplateRegistry {
  register(entity: PromptTemplateEntity): Promise<void>;
  get(id: string): Promise<PromptTemplateEntity | null>;
  getByName(name: string, version?: number): Promise<PromptTemplateEntity | null>;
  list(options?: TemplateFindOptions): Promise<PaginatedResult<PromptTemplateEntity>>;
  delete(id: string): Promise<void>;
}
