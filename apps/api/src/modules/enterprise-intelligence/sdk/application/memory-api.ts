import { Injectable, Logger } from '@nestjs/common';
import type { ContextScope, PaginatedResult } from '../../shared/types/index.js';
import type { MemoryEntity, MemoryType } from '../../memory-platform/domain/memory.entity.js';
import { MemoryService } from '../../memory-platform/application/memory.service.js';

export interface StoreMemoryOptions {
  ttl?: number;
  tags?: string[];
}

export interface MemorySearchOptions {
  type?: MemoryType;
  topK?: number;
}

@Injectable()
export class MemoryApi {
  private readonly logger = new Logger(MemoryApi.name);

  constructor(private readonly memoryService: MemoryService) {}

  async store(
    type: MemoryType,
    key: string,
    value: Record<string, unknown>,
    options?: StoreMemoryOptions,
  ): Promise<MemoryEntity> {
    this.logger.debug(`store(type=${type}, key=${key})`);

    const memory = {
      type,
      key,
      value,
      ttl: options?.ttl,
      tags: options?.tags,
    } as unknown as MemoryEntity;

    return this.memoryService.store(memory);
  }

  async get(id: string): Promise<MemoryEntity | null> {
    return this.memoryService.get(id);
  }

  async find(
    type: MemoryType,
    scope: ContextScope,
    scopeId: string,
  ): Promise<PaginatedResult<MemoryEntity>> {
    return this.memoryService.find(type, scope, scopeId);
  }

  async search(
    query: string,
    options?: MemorySearchOptions,
  ): Promise<{ entity: MemoryEntity; score: number }[]> {
    return this.memoryService.search(query, options?.type, options?.topK);
  }

  async delete(id: string): Promise<void> {
    return this.memoryService.delete(id);
  }

  async getStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    expired: number;
  }> {
    return this.memoryService.getStats();
  }
}
