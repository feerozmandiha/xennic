import { randomUUID } from 'node:crypto';
import type { ContextScope } from '../../shared/types/index.js';

export class ContextEntity {
  public readonly id: string;
  public readonly scope: ContextScope;
  public readonly scopeId: string;
  public readonly source: string;
  public readonly key: string;
  public readonly value: Record<string, unknown>;
  public readonly version: number;
  public readonly createdAt: Date;
  public readonly createdBy: string;

  private constructor(
    id: string,
    scope: ContextScope,
    scopeId: string,
    source: string,
    key: string,
    value: Record<string, unknown>,
    version: number,
    createdAt: Date,
    createdBy: string,
  ) {
    this.id = id;
    this.scope = scope;
    this.scopeId = scopeId;
    this.source = source;
    this.key = key;
    this.value = value;
    this.version = version;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
  }

  static create(
    scope: ContextScope,
    scopeId: string,
    source: string,
    key: string,
    value: Record<string, unknown>,
    createdBy: string,
  ): ContextEntity {
    return new ContextEntity(
      randomUUID(),
      scope,
      scopeId,
      source,
      key,
      value,
      1,
      new Date(),
      createdBy,
    );
  }

  static reconstitute(
    id: string,
    scope: ContextScope,
    scopeId: string,
    source: string,
    key: string,
    value: Record<string, unknown>,
    version: number,
    createdAt: Date,
    createdBy: string,
  ): ContextEntity {
    return new ContextEntity(
      id,
      scope,
      scopeId,
      source,
      key,
      value,
      version,
      createdAt,
      createdBy,
    );
  }
}
