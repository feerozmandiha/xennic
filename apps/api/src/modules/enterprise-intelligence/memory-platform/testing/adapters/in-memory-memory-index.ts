import type { MemoryEntity } from '../../domain/memory.entity.js';
import type { IMemoryIndex, SearchResult } from '../../domain/memory-index.interface.js';

export class InMemoryMemoryIndex implements IMemoryIndex {
  private readonly entries = new Map<string, MemoryEntity>();

  async index(entity: MemoryEntity): Promise<void> {
    this.entries.set(entity.id, entity);
  }

  async search(query: string, topK: number = 10): Promise<SearchResult[]> {
    const lower = query.toLowerCase();
    const scored: SearchResult[] = [];

    for (const entity of this.entries.values()) {
      let score = 0;
      if (entity.key.toLowerCase().includes(lower)) {
        score += entity.key.toLowerCase().split(lower).length - 1;
      }
      for (const tag of entity.tags) {
        if (tag.toLowerCase().includes(lower)) {
          score += 0.5;
        }
      }
      const valueStr = JSON.stringify(entity.value).toLowerCase();
      if (valueStr.includes(lower)) {
        const matches = valueStr.split(lower).length - 1;
        score += matches * 0.3;
      }
      if (score > 0) {
        scored.push({ entity, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  async remove(id: string): Promise<void> {
    this.entries.delete(id);
  }

  async clear(): Promise<void> {
    this.entries.clear();
  }
}
