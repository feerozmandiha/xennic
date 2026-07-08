import { randomUUID } from 'node:crypto';
import type { Versioned, Named } from '../../shared/types/index.js';

export enum ToolStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
}

export enum ToolHealth {
  UNKNOWN = 'unknown',
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

export interface ToolMetadata {
  createdAt: Date;
  updatedAt: Date;
}

export class ToolEntity implements Versioned, Named {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly version: number;
  public readonly schema: Record<string, unknown>;
  public readonly permissions: string[];
  public readonly status: ToolStatus;
  public readonly health: ToolHealth;
  public readonly endpoint: string | undefined;
  public readonly metadata: Record<string, unknown>;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    description: string,
    version: number,
    schema: Record<string, unknown>,
    permissions: string[],
    status: ToolStatus,
    health: ToolHealth,
    endpoint: string | undefined,
    metadata: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.version = version;
    this.schema = schema;
    this.permissions = permissions;
    this.status = status;
    this.health = health;
    this.endpoint = endpoint;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    name: string,
    description: string,
    schema: Record<string, unknown>,
    permissions: string[],
    endpoint?: string,
    metadata?: Record<string, unknown>,
  ): ToolEntity {
    const now = new Date();
    return new ToolEntity(
      randomUUID(),
      name,
      description,
      1,
      schema,
      permissions,
      ToolStatus.ACTIVE,
      ToolHealth.UNKNOWN,
      endpoint,
      metadata ?? {},
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    name: string,
    description: string,
    version: number,
    schema: Record<string, unknown>,
    permissions: string[],
    status: ToolStatus,
    health: ToolHealth,
    endpoint: string | undefined,
    metadata: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
  ): ToolEntity {
    return new ToolEntity(
      id,
      name,
      description,
      version,
      schema,
      permissions,
      status,
      health,
      endpoint,
      metadata,
      createdAt,
      updatedAt,
    );
  }
}
