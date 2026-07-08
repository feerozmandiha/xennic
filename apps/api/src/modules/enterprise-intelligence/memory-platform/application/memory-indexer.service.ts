import { Injectable, Inject, Logger } from '@nestjs/common';
import type { MemoryEntity, MemoryType } from '../domain/memory.entity.js';
import type { IMemoryIndex, SearchResult } from '../domain/memory-index.interface.js';
import type { IMemoryStore } from '../domain/memory-store.interface.js';

@Injectable()
export class MemoryIndexerService {
  private readonly logger = new Logger(MemoryIndexerService.name);

  constructor(
    @Inject('IMemoryIndex') private readonly memoryIndex: IMemoryIndex,
    @Inject('IMemoryStore') private readonly memoryStore: IMemoryStore,
  ) {}

  async index(entity: MemoryEntity): Promise<void> {
    await this.memoryIndex.index(entity);
    this.logger.debug(`Indexed memory ${entity.id}`);
  }

  async reindex(type?: MemoryType): Promise<void> {
    this.logger.log(`Reindexing ${type ?? 'all'} memories`);
    await this.memoryIndex.clear();

    const allResults = await this.memoryStore.search('', { offset: 0, limit: 10000 });
    const entities = type
      ? allResults.items.filter(e => e.type === type)
      : allResults.items;

    for (const entity of entities) {
      await this.memoryIndex.index(entity);
    }

    this.logger.log(`Reindexed ${entities.length} memories`);
  }

  async searchEmbeddings(vector: number[], topK: number = 10): Promise<SearchResult[]> {
    const allResults = await this.memoryStore.search('', { offset: 0, limit: 10000 });
    const withEmbedding: { entity: MemoryEntity; embedding: number[] }[] = [];

    for (const entity of allResults.items) {
      if (entity.embedding !== null) {
        withEmbedding.push({ entity, embedding: entity.embedding });
      }
    }

    if (withEmbedding.length === 0) return [];

    const scored = withEmbedding.map(({ entity, embedding }) => {
      const score = this.cosineSimilarity(vector, embedding);
      return { entity, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      const ai = a[i]!;
      const bi = b[i]!;
      dot += ai * bi;
      normA += ai * ai;
      normB += bi * bi;
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }
}
