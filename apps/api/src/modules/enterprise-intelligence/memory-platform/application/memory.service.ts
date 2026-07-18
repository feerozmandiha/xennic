import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ContextScope, PaginatedResult } from '../../shared/types/index.js';
import type { MemoryEntity, MemoryType } from '../domain/memory.entity.js';
import type { IMemoryStore } from '../domain/memory-store.interface.js';
import type { IMemoryIndex } from '../domain/memory-index.interface.js';

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(
    @Inject('IMemoryStore') private readonly memoryStore: IMemoryStore,
    @Inject('IMemoryIndex') private readonly memoryIndex: IMemoryIndex,
  ) {}

  async store(memory: MemoryEntity): Promise<MemoryEntity> {
    await this.memoryStore.save(memory);
    await this.memoryIndex.index(memory);
    this.logger.debug(`Stored memory ${memory.id} of type ${memory.type}`);
    return memory;
  }

  async get(id: string): Promise<MemoryEntity | null> {
    return this.memoryStore.findById(id);
  }

  async find(
    type: MemoryType,
    scope: ContextScope,
    scopeId: string,
  ): Promise<PaginatedResult<MemoryEntity>> {
    return this.memoryStore.findByType(type, scope, scopeId);
  }

  async search(
    query: string,
    type?: MemoryType,
    topK?: number,
  ): Promise<{ entity: MemoryEntity; score: number }[]> {
    if (type) {
      const typedResults = await this.memoryStore.findByType(type, 'global', '');
      const filtered = typedResults.items.filter(
        (e) =>
          e.key.toLowerCase().includes(query.toLowerCase()) ||
          JSON.stringify(e.value).toLowerCase().includes(query.toLowerCase()),
      );
      return filtered.slice(0, topK ?? filtered.length).map((e) => ({ entity: e, score: 1 }));
    }
    return this.memoryIndex.search(query, topK);
  }

  async tagSearch(
    tags: string[],
    scope?: ContextScope,
    scopeId?: string,
  ): Promise<PaginatedResult<MemoryEntity>> {
    return this.memoryStore.findByTags(tags, { scope, scopeId });
  }

  async delete(id: string): Promise<void> {
    await this.memoryStore.delete(id);
    await this.memoryIndex.remove(id);
    this.logger.debug(`Deleted memory ${id}`);
  }

  async getStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    expired: number;
  }> {
    const allTypes: MemoryType[] = [
      'working' as MemoryType,
      'session' as MemoryType,
      'short-term' as MemoryType,
      'long-term' as MemoryType,
      'semantic' as MemoryType,
      'episodic' as MemoryType,
      'procedural' as MemoryType,
    ];
    const byType: Record<string, number> = {};
    for (const t of allTypes) {
      byType[t] = await this.memoryStore.count(t);
    }
    const total = await this.memoryStore.count();

    const allEntities = await this.memoryStore.search('', { offset: 0, limit: 10000 });
    const expired = allEntities.items.filter((e) => e.expiresAt && e.expiresAt < new Date()).length;

    return { total, byType, expired };
  }
}
