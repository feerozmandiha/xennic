import { randomUUID } from 'node:crypto';
import type { Metadata } from '../../shared/types/index.js';

export interface MemoryEntry {
  key: string;
  value: unknown;
  source: string;
  scope: string;
  timestamp: Date;
}

export interface SharedMemoryOptions {
  executionId: string;
  entries?: MemoryEntry[];
  metadata: Metadata;
}

export class SharedMemory {
  public readonly id: string;
  public readonly executionId: string;
  public readonly entries: MemoryEntry[];
  public readonly metadata: Metadata;

  private constructor(id: string, executionId: string, entries: MemoryEntry[], metadata: Metadata) {
    this.id = id;
    this.executionId = executionId;
    this.entries = entries;
    this.metadata = metadata;
  }

  static create(opts: SharedMemoryOptions): SharedMemory {
    return new SharedMemory(randomUUID(), opts.executionId, opts.entries ?? [], opts.metadata);
  }

  static reconstitute(
    id: string,
    executionId: string,
    entries: MemoryEntry[],
    metadata: Metadata,
  ): SharedMemory {
    return new SharedMemory(id, executionId, entries, metadata);
  }
}
