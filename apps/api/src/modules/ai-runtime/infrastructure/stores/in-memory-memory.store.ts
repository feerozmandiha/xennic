import { Injectable } from '@nestjs/common';
import type { IMemoryStore } from '../../domain/interfaces/memory-store.interface.js';
import type { MemoryEntry, MemoryQuery } from '../../domain/types/memory.types.js';

@Injectable()
export class InMemoryMemoryStore implements IMemoryStore {
  private readonly _entries: MemoryEntry[] = [];

  async add(entry: MemoryEntry): Promise<void> {
    this._entries.push(entry);
  }

  async search(query: MemoryQuery): Promise<MemoryEntry[]> {
    let results = [...this._entries];

    if (query.sessionId) {
      results = results.filter(e => e.sessionId === query.sessionId);
    }

    if (query.types && query.types.length > 0) {
      results = results.filter(e => query.types!.includes(e.type));
    }

    if (query.minScore !== undefined) {
      results = results.filter(e => e.score >= query.minScore!);
    }

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const offset = query.offset ?? 0;
    const limit = query.limit ?? 50;
    return results.slice(offset, offset + limit);
  }

  async delete(id: string): Promise<void> {
    const idx = this._entries.findIndex(e => e.id === id);
    if (idx !== -1) {
      this._entries.splice(idx, 1);
    }
  }

  async clear(sessionId: string): Promise<void> {
    const filtered = this._entries.filter(e => e.sessionId !== sessionId);
    this._entries.length = 0;
    this._entries.push(...filtered);
  }
}
