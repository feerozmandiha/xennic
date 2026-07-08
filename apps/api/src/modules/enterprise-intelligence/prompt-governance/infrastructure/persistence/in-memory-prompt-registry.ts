import { Injectable, Logger } from '@nestjs/common';
import type { PaginatedResult } from '../../../shared/types/index.js';
import type { PromptEntity } from '../../domain/prompt.entity.js';
import type { IPromptRegistry, PromptFindOptions } from '../../domain/prompt-registry.interface.js';

@Injectable()
export class InMemoryPromptRegistry implements IPromptRegistry {
  private readonly logger = new Logger(InMemoryPromptRegistry.name);
  private readonly store = new Map<string, PromptEntity>();

  async register(entity: PromptEntity): Promise<void> {
    this.store.set(entity.id, entity);
    this.logger.debug(`Registered prompt ${entity.id}`);
  }

  async get(id: string): Promise<PromptEntity | null> {
    return this.store.get(id) ?? null;
  }

  async getByName(name: string, version?: number): Promise<PromptEntity | null> {
    const candidates = Array.from(this.store.values()).filter(e => e.name === name);
    if (candidates.length === 0) return null;
    if (version !== undefined) {
      return candidates.find(e => e.version === version) ?? null;
    }
    return candidates.reduce((a, b) => (a.version > b.version ? a : b));
  }

  async list(options?: PromptFindOptions): Promise<PaginatedResult<PromptEntity>> {
    let items = Array.from(this.store.values());
    if (options?.status) {
      items = items.filter(e => e.status === options.status);
    }
    return this.paginate(items, options);
  }

  async search(query: string, options?: PromptFindOptions): Promise<PaginatedResult<PromptEntity>> {
    const lower = query.toLowerCase();
    let items = Array.from(this.store.values()).filter(
      e =>
        e.name.toLowerCase().includes(lower) ||
        e.description.toLowerCase().includes(lower) ||
        e.content.toLowerCase().includes(lower) ||
        e.tags.some(t => t.toLowerCase().includes(lower)),
    );
    if (options?.status) {
      items = items.filter(e => e.status === options.status);
    }
    return this.paginate(items, options);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  private paginate(items: PromptEntity[], options?: PromptFindOptions): PaginatedResult<PromptEntity> {
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
