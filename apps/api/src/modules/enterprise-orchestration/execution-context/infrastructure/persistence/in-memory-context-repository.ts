import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../domain/execution-context.entity.js';
import { SharedArtifact } from '../../domain/shared-artifact.entity.js';
import { SharedMemory, type MemoryEntry } from '../../domain/shared-memory.vo.js';
import type { IContextRepository } from '../../domain/context-repository.interface.js';

@Injectable()
export class InMemoryContextRepository implements IContextRepository {
  private readonly logger = new Logger(InMemoryContextRepository.name);
  private readonly contexts = new Map<string, ExecutionContext>();
  private readonly artifacts = new Map<string, SharedArtifact>();
  private readonly memories = new Map<string, SharedMemory>();

  async saveContext(context: ExecutionContext): Promise<void> {
    this.contexts.set(context.executionId, context);
    this.logger.debug(`Saved context ${context.executionId}`);
  }

  async getContext(executionId: string): Promise<ExecutionContext | null> {
    return this.contexts.get(executionId) ?? null;
  }

  async deleteContext(executionId: string): Promise<void> {
    this.contexts.delete(executionId);
    this.logger.debug(`Deleted context ${executionId}`);
  }

  async saveArtifact(artifact: SharedArtifact): Promise<void> {
    this.artifacts.set(artifact.id, artifact);
    this.logger.debug(`Saved artifact ${artifact.id}`);
  }

  async getArtifact(id: string): Promise<SharedArtifact | null> {
    return this.artifacts.get(id) ?? null;
  }

  async listArtifacts(executionId: string): Promise<SharedArtifact[]> {
    return Array.from(this.artifacts.values()).filter((a) => a.executionId === executionId);
  }

  async deleteArtifact(id: string): Promise<void> {
    this.artifacts.delete(id);
    this.logger.debug(`Deleted artifact ${id}`);
  }

  async saveMemory(memory: SharedMemory): Promise<void> {
    this.memories.set(memory.executionId, memory);
    this.logger.debug(`Saved memory for execution ${memory.executionId}`);
  }

  async getMemory(executionId: string): Promise<SharedMemory | null> {
    return this.memories.get(executionId) ?? null;
  }

  async addMemoryEntry(executionId: string, entry: MemoryEntry): Promise<void> {
    const existing = this.memories.get(executionId);
    if (!existing) {
      this.logger.warn(`No memory found for execution ${executionId}`);
      return;
    }

    const updated = SharedMemory.reconstitute(
      existing.id,
      existing.executionId,
      [...existing.entries, entry],
      existing.metadata,
    );

    this.memories.set(executionId, updated);
    this.logger.debug(`Added memory entry ${entry.key} to execution ${executionId}`);
  }

  async clearMemory(executionId: string): Promise<void> {
    this.memories.delete(executionId);
    this.logger.debug(`Cleared memory for execution ${executionId}`);
  }
}
