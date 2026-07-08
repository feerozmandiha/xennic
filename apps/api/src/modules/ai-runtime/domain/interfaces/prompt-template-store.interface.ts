import type { PromptTemplate } from '../types/prompt.types.js';

export const I_PROMPT_TEMPLATE_STORE = 'IPromptTemplateStore';

export interface IPromptTemplateStore {
  save(template: PromptTemplate): Promise<void>;
  findByKey(key: string): Promise<PromptTemplate | null>;
  findAll(tags?: string[]): Promise<PromptTemplate[]>;
  delete(id: string): Promise<void>;
}
