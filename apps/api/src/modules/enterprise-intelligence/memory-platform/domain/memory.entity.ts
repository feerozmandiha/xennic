import { randomUUID } from 'node:crypto';
import type { ContextScope, Metadata, Versioned } from '../../shared/types/index.js';

export enum MemoryType {
  WORKING = 'working',
  SESSION = 'session',
  SHORT_TERM = 'short-term',
  LONG_TERM = 'long-term',
  SEMANTIC = 'semantic',
  EPISODIC = 'episodic',
  PROCEDURAL = 'procedural',
}

export class MemoryEntity implements Versioned {
  public readonly id: string;
  public readonly type: MemoryType;
  public readonly scope: ContextScope;
  public readonly scopeId: string;
  public readonly key: string;
  public readonly value: Record<string, unknown>;
  public readonly tags: string[];
  public readonly embedding: number[] | null;
  public readonly version: number;
  public readonly metadata: Metadata;
  public readonly expiresAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    type: MemoryType,
    scope: ContextScope,
    scopeId: string,
    key: string,
    value: Record<string, unknown>,
    tags: string[],
    embedding: number[] | null,
    version: number,
    metadata: Metadata,
    expiresAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.type = type;
    this.scope = scope;
    this.scopeId = scopeId;
    this.key = key;
    this.value = value;
    this.tags = tags;
    this.embedding = embedding;
    this.version = version;
    this.metadata = metadata;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    type: MemoryType,
    scope: ContextScope,
    scopeId: string,
    key: string,
    value: Record<string, unknown>,
    createdBy: string,
    tags: string[] = [],
    embedding: number[] | null = null,
    expiresAt: Date | null = null,
  ): MemoryEntity {
    const now = new Date();
    return new MemoryEntity(
      randomUUID(),
      type,
      scope,
      scopeId,
      key,
      value,
      tags,
      embedding,
      1,
      {
        createdAt: now,
        updatedAt: now,
        createdBy,
        updatedBy: null,
      },
      expiresAt,
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    type: MemoryType,
    scope: ContextScope,
    scopeId: string,
    key: string,
    value: Record<string, unknown>,
    tags: string[],
    embedding: number[] | null,
    version: number,
    metadata: Metadata,
    expiresAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
  ): MemoryEntity {
    return new MemoryEntity(
      id,
      type,
      scope,
      scopeId,
      key,
      value,
      tags,
      embedding,
      version,
      metadata,
      expiresAt,
      createdAt,
      updatedAt,
    );
  }
}
