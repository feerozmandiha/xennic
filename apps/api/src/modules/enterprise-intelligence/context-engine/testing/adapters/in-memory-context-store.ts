import { Logger } from '@nestjs/common';
import type { ContextScope } from '../../../shared/types/index.js';
import type { ContextEntity } from '../../domain/context.entity.js';
import type {
  IContextRepository,
  FindByScopeOptions,
} from '../../domain/context-repository.interface.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

export class InMemoryContextStore implements IContextRepository {
  private readonly logger = new Logger(InMemoryContextStore.name);
  private readonly store = new Map<string, ContextEntity>();

  async save(entity: ContextEntity): Promise<void> {
    this.store.set(entity.id, entity);
    this.logger.debug(`Saved context entity ${entity.id}`);
  }

  async findById(id: string): Promise<ContextEntity | null> {
    return this.store.get(id) ?? null;
  }

  async findByScope(
    scope: ContextScope,
    scopeId: string,
    options?: FindByScopeOptions,
  ): Promise<PaginatedResult<ContextEntity>> {
    const items = Array.from(this.store.values()).filter(
      (e) => e.scope === scope && e.scopeId === scopeId,
    );
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;
    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async findBySource(
    scope: ContextScope,
    scopeId: string,
    source: string,
  ): Promise<ContextEntity[]> {
    return Array.from(this.store.values()).filter(
      (e) => e.scope === scope && e.scopeId === scopeId && e.source === source,
    );
  }

  async findKeys(scope: ContextScope, scopeId: string, keys: string[]): Promise<ContextEntity[]> {
    const keySet = new Set(keys);
    return Array.from(this.store.values()).filter(
      (e) => e.scope === scope && e.scopeId === scopeId && keySet.has(e.key),
    );
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async deleteByScope(scope: ContextScope, scopeId: string): Promise<void> {
    for (const [id, entity] of this.store) {
      if (entity.scope === scope && entity.scopeId === scopeId) {
        this.store.delete(id);
      }
    }
  }
}
