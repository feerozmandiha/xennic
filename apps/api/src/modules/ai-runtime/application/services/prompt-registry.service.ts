import { Injectable, Inject } from '@nestjs/common';
import type { IPromptTemplateStore } from '../../domain/interfaces/prompt-template-store.interface.js';
import { I_PROMPT_TEMPLATE_STORE } from '../../domain/interfaces/prompt-template-store.interface.js';
import { PromptTemplate } from '../../domain/types/prompt.types.js';
import type { TemplateSection, TemplateVariable } from '../../domain/types/prompt.types.js';
import { PromptNotFoundException } from '../../domain/exceptions/prompt.exception.js';

@Injectable()
export class PromptRegistryService {
  constructor(
    @Inject(I_PROMPT_TEMPLATE_STORE)
    private readonly store: IPromptTemplateStore,
  ) {}

  async register(
    key: string,
    name: string,
    sections: TemplateSection[],
    variables: TemplateVariable[],
    description?: string,
    tags?: string[],
  ): Promise<PromptTemplate> {
    const existing = await this.store.findByKey(key);
    if (existing) {
      await this.store.delete(existing.id);
    }
    const template = PromptTemplate.create(key, name, sections, variables, description, tags);
    await this.store.save(template);
    return template;
  }

  async get(key: string): Promise<PromptTemplate> {
    const template = await this.store.findByKey(key);
    if (!template) {
      throw new PromptNotFoundException(key);
    }
    return template;
  }

  async getAll(tags?: string[]): Promise<PromptTemplate[]> {
    return this.store.findAll(tags);
  }

  async remove(id: string): Promise<void> {
    await this.store.delete(id);
  }
}
