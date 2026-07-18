import { Logger } from '@nestjs/common';
import type { ContextScope, PaginatedResult } from '../../../shared/types/index.js';
import type { MemoryEntity, MemoryType } from '../../domain/memory.entity.js';
import type { IMemoryStore, FindOptions } from '../../domain/memory-store.interface.js';

export class InMemoryMemoryStore implements IMemoryStore {
  private readonly logger = new Logger(InMemoryMemoryStore.name);
  private readonly store = new Map<string, MemoryEntity>();

  async save(entity: MemoryEntity): Promise<void> {
    this.store.set(entity.id, entity);
    this.logger.debug(`Saved memory ${entity.id}`);
  }

  async findById(id: string): Promise<MemoryEntity | null> {
    return this.store.get(id) ?? null;
  }

  async findByType(
    type: MemoryType,
    scope: ContextScope,
    scopeId: string,
    options?: FindOptions,
  ): Promise<PaginatedResult<MemoryEntity>> {
    const items = Array.from(this.store.values()).filter(
      (e) => e.type === type && e.scope === scope && e.scopeId === scopeId,
    );
    return this.paginate(items, options);
  }

  async findByScope(
    scope: ContextScope,
    scopeId: string,
    options?: FindOptions,
  ): Promise<PaginatedResult<MemoryEntity>> {
    const items = Array.from(this.store.values()).filter(
      (e) => e.scope === scope && e.scopeId === scopeId,
    );
    return this.paginate(items, options);
  }

  async search(query: string, options?: FindOptions): Promise<PaginatedResult<MemoryEntity>> {
    const lower = query.toLowerCase();
    const items = Array.from(this.store.values()).filter(
      (e) =>
        e.key.toLowerCase().includes(lower) ||
        e.tags.some((t) => t.toLowerCase().includes(lower)) ||
        JSON.stringify(e.value).toLowerCase().includes(lower),
    );
    return this.paginate(items, options);
  }

  async findByTags(
    tags: string[],
    options?: FindOptions & { scope?: ContextScope; scopeId?: string },
  ): Promise<PaginatedResult<MemoryEntity>> {
    const tagSet = new Set(tags.map((t) => t.toLowerCase()));
    let items = Array.from(this.store.values()).filter((e) =>
      e.tags.some((t) => tagSet.has(t.toLowerCase())),
    );
    if (options?.scope) {
      items = items.filter(
        (e) => e.scope === options.scope && e.scopeId === (options.scopeId ?? e.scopeId),
      );
    }
    return this.paginate(items, options);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();
    let count = 0;
    for (const [id, entity] of this.store) {
      if (entity.expiresAt && entity.expiresAt <= now) {
        this.store.delete(id);
        count++;
      }
    }
    if (count > 0) {
      this.logger.log(`Deleted ${count} expired memory entries`);
    }
    return count;
  }

  async count(type?: MemoryType, scope?: ContextScope, scopeId?: string): Promise<number> {
    let items = Array.from(this.store.values());
    if (type) items = items.filter((e) => e.type === type);
    if (scope) items = items.filter((e) => e.scope === scope);
    if (scopeId) items = items.filter((e) => e.scopeId === scopeId);
    return items.length;
  }

  private paginate(items: MemoryEntity[], options?: FindOptions): PaginatedResult<MemoryEntity> {
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
