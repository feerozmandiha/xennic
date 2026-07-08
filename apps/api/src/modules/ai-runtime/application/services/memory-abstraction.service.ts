import { Injectable, Inject } from '@nestjs/common';
import type { IMemoryStore } from '../../domain/interfaces/memory-store.interface.js';
import { I_MEMORY_STORE } from '../../domain/interfaces/memory-store.interface.js';
import { MemoryEntry } from '../../domain/types/memory.types.js';
import type { MemoryType, MemoryQuery } from '../../domain/types/memory.types.js';

@Injectable()
export class MemoryAbstractionService {
  constructor(
    @Inject(I_MEMORY_STORE)
    private readonly store: IMemoryStore,
  ) {}

  async remember(
    sessionId: string,
    type: MemoryType,
    content: string,
    metadata?: Record<string, unknown>,
    score?: number,
  ): Promise<MemoryEntry> {
    const entry = new MemoryEntry(
      crypto.randomUUID(),
      sessionId,
      type,
      content,
      metadata ?? {},
      new Date(),
      score ?? 1.0,
    );
    await this.store.add(entry);
    return entry;
  }

  async recall(query: MemoryQuery): Promise<MemoryEntry[]> {
    return this.store.search(query);
  }

  async forget(id: string): Promise<void> {
    await this.store.delete(id);
  }

  async clearSession(sessionId: string): Promise<void> {
    await this.store.clear(sessionId);
  }

  async getConversationSummary(sessionId: string): Promise<string | null> {
    const summaries = await this.store.search({
      sessionId,
      types: ['summary'],
      limit: 1,
    });
    return summaries[0]?.content ?? null;
  }

  async storeConversationSummary(
    sessionId: string,
    summary: string,
  ): Promise<MemoryEntry> {
    return this.remember(sessionId, 'summary', summary, { auto: true }, 1.0);
  }
}
