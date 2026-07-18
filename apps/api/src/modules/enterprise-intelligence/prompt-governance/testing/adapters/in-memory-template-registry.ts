import { Logger } from '@nestjs/common';
import type { PaginatedResult } from '../../../shared/types/index.js';
import type { PromptTemplateEntity } from '../../domain/prompt-template.entity.js';
import type {
  ITemplateRegistry,
  TemplateFindOptions,
} from '../../domain/prompt-template-registry.interface.js';

export class InMemoryTemplateRegistry implements ITemplateRegistry {
  private readonly logger = new Logger(InMemoryTemplateRegistry.name);
  private readonly store = new Map<string, PromptTemplateEntity>();

  async register(entity: PromptTemplateEntity): Promise<void> {
    this.store.set(entity.id, entity);
    this.logger.debug(`Registered template ${entity.id}`);
  }

  async get(id: string): Promise<PromptTemplateEntity | null> {
    return this.store.get(id) ?? null;
  }

  async getByName(name: string, version?: number): Promise<PromptTemplateEntity | null> {
    const candidates = Array.from(this.store.values()).filter((e) => e.name === name);
    if (candidates.length === 0) return null;
    if (version !== undefined) {
      return candidates.find((e) => e.version === version) ?? null;
    }
    return candidates.reduce((a, b) => (a.version > b.version ? a : b));
  }

  async list(options?: TemplateFindOptions): Promise<PaginatedResult<PromptTemplateEntity>> {
    const items = Array.from(this.store.values());
    return this.paginate(items, options);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  private paginate(
    items: PromptTemplateEntity[],
    options?: TemplateFindOptions,
  ): PaginatedResult<PromptTemplateEntity> {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;
    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }
}
