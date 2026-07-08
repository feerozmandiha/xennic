import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { ExecutionContext } from '../../domain/execution-context.entity.js';
import type { SharedArtifact } from '../../domain/shared-artifact.entity.js';
import type { SharedMemory, MemoryEntry } from '../../domain/shared-memory.vo.js';
import type { IContextRepository } from '../../domain/context-repository.interface.js';

@Injectable()
export class PrismaContextRepository implements IContextRepository {
  private readonly logger = new Logger(PrismaContextRepository.name);

  async saveContext(context: ExecutionContext): Promise<void> {
    const variables = Object.fromEntries(context.snapshot() as any) as Record<string, unknown>;
    await prisma.execution_contexts.upsert({
      where: { execution_id: context.executionId },
      create: {
        id: context.id,
        execution_id: context.executionId,
        variables: variables as unknown as Record<string, unknown>,
      },
      update: {
        variables: variables as unknown as Record<string, unknown>,
      },
    });
    this.logger.debug(`Saved context ${context.executionId}`);
  }

  async getContext(executionId: string): Promise<ExecutionContext | null> {
    const row = await prisma.execution_contexts.findUnique({
      where: { execution_id: executionId },
    });
    if (!row) return null;

    const { ExecutionContext: Ctx } = await import('../../domain/execution-context.entity.js');
    const variables = new Map(Object.entries(row.variables as Record<string, unknown>));
    return Ctx.reconstitute(
      row.id,
      row.execution_id,
      variables,
      {} as any,
      [],
      {} as any,
      row.created_at,
      row.updated_at,
      1,
    ) as ExecutionContext;
  }

  async deleteContext(executionId: string): Promise<void> {
    await prisma.execution_contexts.deleteMany({
      where: { execution_id: executionId },
    });
    this.logger.debug(`Deleted context ${executionId}`);
  }

  async saveArtifact(artifact: SharedArtifact): Promise<void> {
    await prisma.execution_artifacts.upsert({
      where: { id: artifact.id },
      create: {
        id: artifact.id,
        execution_id: artifact.executionId,
        name: artifact.name,
        type: artifact.type,
        content: artifact.content as unknown as Record<string, unknown>,
        metadata: artifact.metadata as any,
      },
      update: {
        name: artifact.name,
        type: artifact.type,
        content: artifact.content as unknown as Record<string, unknown>,
        metadata: artifact.metadata as any,
      },
    });
    this.logger.debug(`Saved artifact ${artifact.id}`);
  }

  async getArtifact(id: string): Promise<SharedArtifact | null> {
    const row = await prisma.execution_artifacts.findUnique({ where: { id } });
    if (!row) return null;

    const { SharedArtifact: Art } = await import('../../domain/shared-artifact.entity.js');
    return Art.reconstitute(
      row.id,
      row.execution_id,
      row.name,
      row.type as any,
      row.content,
      null,
      null,
      (row.metadata as any) ?? {},
      row.created_at,
    ) as SharedArtifact;
  }

  async listArtifacts(executionId: string): Promise<SharedArtifact[]> {
    const rows = await prisma.execution_artifacts.findMany({
      where: { execution_id: executionId },
      orderBy: { created_at: 'asc' },
    });

    const { SharedArtifact: Art } = await import('../../domain/shared-artifact.entity.js');
    return rows.map(row =>
      Art.reconstitute(
        row.id,
        row.execution_id,
        row.name,
        row.type as any,
        row.content,
        null,
        null,
        (row.metadata as any) ?? {},
        row.created_at,
      ) as SharedArtifact,
    );
  }

  async deleteArtifact(id: string): Promise<void> {
    await prisma.execution_artifacts.delete({ where: { id } });
    this.logger.debug(`Deleted artifact ${id}`);
  }

  async saveMemory(memory: SharedMemory): Promise<void> {
    await prisma.execution_memories.upsert({
      where: { execution_id: memory.executionId },
      create: {
        id: memory.id,
        execution_id: memory.executionId,
        entries: memory.entries as unknown as Record<string, unknown>[],
      },
      update: {
        entries: memory.entries as unknown as Record<string, unknown>[],
      },
    });
    this.logger.debug(`Saved memory for execution ${memory.executionId}`);
  }

  async getMemory(executionId: string): Promise<SharedMemory | null> {
    const row = await prisma.execution_memories.findUnique({
      where: { execution_id: executionId },
    });
    if (!row) return null;

    const { SharedMemory: Mem } = await import('../../domain/shared-memory.vo.js');
    return Mem.reconstitute(
      row.id,
      row.execution_id,
      row.entries as unknown as MemoryEntry[],
      {} as any,
    ) as SharedMemory;
  }

  async addMemoryEntry(executionId: string, entry: MemoryEntry): Promise<void> {
    const existing = await prisma.execution_memories.findUnique({
      where: { execution_id: executionId },
    });
    if (!existing) {
      this.logger.warn(`No memory found for execution ${executionId}`);
      return;
    }

    const entries = [...(existing.entries as unknown as MemoryEntry[]), entry];
    await prisma.execution_memories.update({
      where: { execution_id: executionId },
      data: { entries: entries as unknown as Record<string, unknown>[] },
    });
    this.logger.debug(`Added memory entry ${entry.key} to execution ${executionId}`);
  }

  async clearMemory(executionId: string): Promise<void> {
    await prisma.execution_memories.deleteMany({
      where: { execution_id: executionId },
    });
    this.logger.debug(`Cleared memory for execution ${executionId}`);
  }
}
