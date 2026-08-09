import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IMemoryStore } from '../../domain/interfaces/memory-store.interface.js';
import { MemoryEntry } from '../../domain/types/memory.types.js';
import type { MemoryQuery, MemoryType } from '../../domain/types/memory.types.js';

interface MemoryRow {
  id: string;
  session_id: string;
  workspace_id: string | null;
  key: string;
  value: unknown;
  created_at: Date;
}

interface PrismaMemoryValue {
  content?: string;
  metadata?: Record<string, unknown>;
  score?: number;
}

@Injectable()
export class PrismaMemoryStore implements IMemoryStore {
  async add(entry: MemoryEntry): Promise<void> {
    await prisma.agent_runtime_memories.create({
      data: {
        id: entry.id,
        session_id: entry.sessionId,
        workspace_id: null,
        key: entry.type,
        value: {
          content: entry.content,
          metadata: entry.metadata,
          score: entry.score,
        } as unknown as Record<string, unknown>,
        created_at: entry.createdAt,
      },
    });
  }

  async search(query: MemoryQuery): Promise<MemoryEntry[]> {
    const where: Record<string, unknown> = {};

    if (query.sessionId) {
      where.session_id = query.sessionId;
    }

    if (query.types && query.types.length > 0) {
      where.key = { in: query.types };
    }

    const rows = (await prisma.agent_runtime_memories.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: query.offset ?? 0,
      take: query.limit ?? 50,
    })) as unknown as MemoryRow[];

    let results = rows.map((row: MemoryRow) => {
      const val = (row.value as PrismaMemoryValue) ?? ({} as PrismaMemoryValue);
      return new MemoryEntry(
        row.id,
        row.session_id,
        row.key as MemoryType,
        (val as any)?.content ?? '',
        (val as any)?.metadata ?? {},
        row.created_at,
        (val as any)?.score ?? 1.0,
      );
    });

    if (query.minScore !== undefined) {
      results = results.filter((e: MemoryEntry) => e.score >= query.minScore!);
    }

    return results;
  }

  async delete(id: string): Promise<void> {
    await prisma.agent_runtime_memories.delete({ where: { id } });
  }

  async clear(sessionId: string): Promise<void> {
    await prisma.agent_runtime_memories.deleteMany({
      where: { session_id: sessionId },
    });
  }
}
