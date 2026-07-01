import { Injectable } from '@nestjs/common';
import { BaseCacheService } from './base-cache.service.js';
import type { ISemanticCache } from '../../domain/interfaces/cache-interfaces.js';
import type { SemanticCacheEntry } from '../../domain/types/cache.types.js';

@Injectable()
export class SemanticCacheService extends BaseCacheService implements ISemanticCache {
  protected namespace = 'semantic';

  async findBySimilarity(query: string, embedding: number[], minSimilarity: number): Promise<SemanticCacheEntry | null> {
    for (const entry of this._store.values()) {
      const cached = entry.value as SemanticCacheEntry | undefined;
      if (!cached?.embedding || cached.embedding.length !== embedding.length) continue;
      const sim = this.cosineSimilarity(embedding, cached.embedding);
      if (sim >= minSimilarity) { this.hits++; return cached; }
    }
    this.misses++;
    return null;
  }

  async store(entry: SemanticCacheEntry): Promise<void> {
    await this.set(entry.query, entry, entry.ttl);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i]! * b[i]!; na += a[i]! * a[i]!; nb += b[i]! * b[i]!; }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom === 0 ? 0 : dot / denom;
  }
}
