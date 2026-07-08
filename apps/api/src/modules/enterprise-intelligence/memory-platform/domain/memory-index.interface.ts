import type { MemoryEntity } from './memory.entity.js';

export interface SearchResult {
  entity: MemoryEntity;
  score: number;
}

export interface IMemoryIndex {
  index(entity: MemoryEntity): Promise<void>;
  search(query: string, topK?: number): Promise<SearchResult[]>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}
