import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { MemoryEntity } from '../../domain/memory.entity.js';
import type { IMemoryIndex, SearchResult } from '../../domain/memory-index.interface.js';

@Injectable()
export class PrismaMemoryIndex implements IMemoryIndex {
  async index(entity: MemoryEntity): Promise<void> {
    await prisma.memory_indexes.upsert({
      where: { id: entity.id },
      update: {
        memory_id: entity.id,
        entity_id: entity.id,
        content: `${entity.key} ${entity.tags.join(' ')} ${JSON.stringify(entity.value)}`,
        embedding: entity.embedding ?? [],
      },
      create: {
        id: entity.id,
        memory_id: entity.id,
        entity_id: entity.id,
        content: `${entity.key} ${entity.tags.join(' ')} ${JSON.stringify(entity.value)}`,
        embedding: entity.embedding ?? [],
      },
    });
  }

  async search(query: string, topK: number = 10): Promise<SearchResult[]> {
    const rows = await prisma.memory_indexes.findMany({
      where: { content: { contains: query } },
      take: topK,
    });
    return rows
      .map((r) => ({
        entity: null as unknown as MemoryEntity,
        score: this.computeScore(r.content, query),
      }))
      .filter((r) => r.score > 0);
  }

  async remove(id: string): Promise<void> {
    await prisma.memory_indexes.delete({ where: { id } }).catch(() => {});
  }

  async clear(): Promise<void> {
    await prisma.memory_indexes.deleteMany({});
  }

  private computeScore(content: string, query: string): number {
    const lower = content.toLowerCase();
    const q = query.toLowerCase();
    let score = 0;
    const matches = lower.split(q).length - 1;
    score += matches;
    return score;
  }
}
