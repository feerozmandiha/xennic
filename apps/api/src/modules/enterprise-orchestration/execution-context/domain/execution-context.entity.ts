import { randomUUID } from 'node:crypto';
import type { Metadata, Versioned } from '../../shared/types/index.js';

export interface ExecutionContextOptions {
  executionId: string;
  variables?: Map<string, unknown>;
  state?: Record<string, unknown>;
  tags?: string[];
  metadata: Metadata;
}

export class ExecutionContext implements Versioned {
  public readonly id: string;
  public readonly executionId: string;
  private readonly variables: Map<string, unknown>;
  public readonly state: Record<string, unknown>;
  public readonly tags: string[];
  public readonly metadata: Metadata;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly version: number;

  private constructor(
    id: string,
    executionId: string,
    variables: Map<string, unknown>,
    state: Record<string, unknown>,
    tags: string[],
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
    version: number,
  ) {
    this.id = id;
    this.executionId = executionId;
    this.variables = variables;
    this.state = state;
    this.tags = tags;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.version = version;
  }

  static create(opts: ExecutionContextOptions): ExecutionContext {
    return new ExecutionContext(
      randomUUID(),
      opts.executionId,
      new Map(opts.variables ?? []),
      opts.state ?? {},
      opts.tags ?? [],
      opts.metadata,
      new Date(),
      new Date(),
      1,
    );
  }

  static reconstitute(
    id: string,
    executionId: string,
    variables: Map<string, unknown>,
    state: Record<string, unknown>,
    tags: string[],
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
    version: number,
  ): ExecutionContext {
    return new ExecutionContext(
      id,
      executionId,
      variables,
      state,
      tags,
      metadata,
      createdAt,
      updatedAt,
      version,
    );
  }

  get(key: string): unknown | undefined {
    return this.variables.get(key);
  }

  set(key: string, value: unknown): ExecutionContext {
    const next = new Map(this.variables);
    next.set(key, value);
    return new ExecutionContext(
      this.id,
      this.executionId,
      next,
      this.state,
      [...this.tags],
      { ...this.metadata, updatedAt: new Date() },
      this.createdAt,
      new Date(),
      this.version + 1,
    );
  }

  has(key: string): boolean {
    return this.variables.has(key);
  }

  delete(key: string): ExecutionContext {
    const next = new Map(this.variables);
    next.delete(key);
    return new ExecutionContext(
      this.id,
      this.executionId,
      next,
      this.state,
      [...this.tags],
      { ...this.metadata, updatedAt: new Date() },
      this.createdAt,
      new Date(),
      this.version + 1,
    );
  }

  clear(): ExecutionContext {
    return new ExecutionContext(
      this.id,
      this.executionId,
      new Map(),
      this.state,
      [...this.tags],
      { ...this.metadata, updatedAt: new Date() },
      this.createdAt,
      new Date(),
      this.version + 1,
    );
  }

  snapshot(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const [key, value] of this.variables) {
      obj[key] = value;
    }
    return Object.freeze({ ...obj });
  }
}
