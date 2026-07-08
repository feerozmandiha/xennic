import type { MemoryEntry, MemoryQuery } from '../types/memory.types.js';

export const I_MEMORY_STORE = 'IMemoryStore';

export interface IMemoryStore {
  add(entry: MemoryEntry): Promise<void>;
  search(query: MemoryQuery): Promise<MemoryEntry[]>;
  delete(id: string): Promise<void>;
  clear(sessionId: string): Promise<void>;
}
