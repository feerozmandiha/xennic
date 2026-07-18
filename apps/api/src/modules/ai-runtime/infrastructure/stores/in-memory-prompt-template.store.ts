import { Injectable } from '@nestjs/common';
import type { IPromptTemplateStore } from '../../domain/interfaces/prompt-template-store.interface.js';
import type { PromptTemplate } from '../../domain/types/prompt.types.js';

@Injectable()
export class InMemoryPromptTemplateStore implements IPromptTemplateStore {
  private readonly _templates = new Map<string, PromptTemplate>();

  async save(template: PromptTemplate): Promise<void> {
    this._templates.set(template.key, template);
  }

  async findByKey(key: string): Promise<PromptTemplate | null> {
    return this._templates.get(key) ?? null;
  }

  async findAll(tags?: string[]): Promise<PromptTemplate[]> {
    let results = Array.from(this._templates.values());
    if (tags && tags.length > 0) {
      results = results.filter((t) => tags.some((tag) => t.tags.includes(tag)));
    }
    return results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async delete(id: string): Promise<void> {
    for (const [key, template] of this._templates) {
      if (template.id === id) {
        this._templates.delete(key);
        return;
      }
    }
  }
}
