import { randomUUID } from 'node:crypto';
import type { Metadata } from '../../shared/types/index.js';

export type ArtifactType = 'file' | 'data' | 'reference';

export interface SharedArtifactOptions {
  executionId: string;
  name: string;
  type: ArtifactType;
  content: unknown;
  mimeType?: string | null;
  size?: number | null;
  metadata: Metadata;
}

export class SharedArtifact {
  public readonly id: string;
  public readonly executionId: string;
  public readonly name: string;
  public readonly type: ArtifactType;
  public readonly content: unknown;
  public readonly mimeType: string | null;
  public readonly size: number | null;
  public readonly metadata: Metadata;
  public readonly createdAt: Date;

  private constructor(
    id: string,
    executionId: string,
    name: string,
    type: ArtifactType,
    content: unknown,
    mimeType: string | null,
    size: number | null,
    metadata: Metadata,
    createdAt: Date,
  ) {
    this.id = id;
    this.executionId = executionId;
    this.name = name;
    this.type = type;
    this.content = content;
    this.mimeType = mimeType;
    this.size = size;
    this.metadata = metadata;
    this.createdAt = createdAt;
  }

  static create(opts: SharedArtifactOptions): SharedArtifact {
    return new SharedArtifact(
      randomUUID(),
      opts.executionId,
      opts.name,
      opts.type,
      opts.content,
      opts.mimeType ?? null,
      opts.size ?? null,
      opts.metadata,
      new Date(),
    );
  }

  static reconstitute(
    id: string,
    executionId: string,
    name: string,
    type: ArtifactType,
    content: unknown,
    mimeType: string | null,
    size: number | null,
    metadata: Metadata,
    createdAt: Date,
  ): SharedArtifact {
    return new SharedArtifact(
      id,
      executionId,
      name,
      type,
      content,
      mimeType,
      size,
      metadata,
      createdAt,
    );
  }
}
