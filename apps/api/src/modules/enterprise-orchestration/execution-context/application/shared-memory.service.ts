import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import type { MemoryEntry } from '../domain/shared-memory.vo.js';
import { SharedMemory } from '../domain/shared-memory.vo.js';
import type { IContextRepository } from '../domain/context-repository.interface.js';
import type { Metadata } from '../../shared/types/index.js';

@Injectable()
export class SharedMemoryService {
  private readonly logger = new Logger(SharedMemoryService.name);

  constructor(
    @Inject('IContextRepository')
    private readonly repository: IContextRepository,
  ) {}

  async getMemory(executionId: string): Promise<SharedMemory> {
    const memory = await this.repository.getMemory(executionId);
    if (!memory) {
      throw new NotFoundException(`SharedMemory for execution ${executionId} not found`);
    }
    return memory;
  }

  async addEntry(
    executionId: string,
    key: string,
    value: unknown,
    source: string,
    scope: string,
  ): Promise<MemoryEntry> {
    const entry: MemoryEntry = {
      key,
      value,
      source,
      scope,
      timestamp: new Date(),
    };

    const existing = await this.repository.getMemory(executionId);

    if (!existing) {
      const metadata: Metadata = {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: source,
        updatedBy: null,
      };

      const memory = SharedMemory.create({
        executionId,
        entries: [entry],
        metadata,
      });

      await this.repository.saveMemory(memory);
    } else {
      await this.repository.addMemoryEntry(executionId, entry);
    }

    this.logger.debug(`Added memory entry ${key} (scope: ${scope}) to execution ${executionId}`);
    return entry;
  }

  async findByScope(executionId: string, scope: string): Promise<MemoryEntry[]> {
    const memory = await this.repository.getMemory(executionId);
    if (!memory) {
      return [];
    }
    return memory.entries.filter((e) => e.scope === scope);
  }

  async search(executionId: string, query: string): Promise<MemoryEntry[]> {
    const memory = await this.repository.getMemory(executionId);
    if (!memory) {
      return [];
    }
    const lower = query.toLowerCase();
    return memory.entries.filter(
      (e) =>
        e.key.toLowerCase().includes(lower) ||
        String(e.value).toLowerCase().includes(lower) ||
        e.source.toLowerCase().includes(lower),
    );
  }

  async clear(executionId: string): Promise<void> {
    await this.repository.clearMemory(executionId);
    this.logger.log(`Cleared memory for execution ${executionId}`);
  }
}
