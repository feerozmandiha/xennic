import { randomUUID } from 'node:crypto';
import type { ContextScope, Metadata } from '../../shared/types/index.js';

export const PolicyEffect = {
  ALLOW: 'allow',
  DENY: 'deny',
} as const;

export type PolicyEffect = (typeof PolicyEffect)[keyof typeof PolicyEffect];

export const PolicyAction = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  EXECUTE: 'execute',
  MANAGE: 'manage',
  ADMIN: 'admin',
} as const;

export type PolicyAction = (typeof PolicyAction)[keyof typeof PolicyAction];

export class PolicyEntity {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly scope: ContextScope;
  public readonly scopeId: string | null;
  public readonly resource: string;
  public readonly action: string;
  public readonly effect: PolicyEffect;
  public readonly priority: number;
  public readonly conditions: Record<string, unknown> | null;
  public readonly metadata: Metadata;
  public readonly enabled: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    description: string,
    scope: ContextScope,
    scopeId: string | null,
    resource: string,
    action: string,
    effect: PolicyEffect,
    priority: number,
    conditions: Record<string, unknown> | null,
    metadata: Metadata,
    enabled: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.scope = scope;
    this.scopeId = scopeId;
    this.resource = resource;
    this.action = action;
    this.effect = effect;
    this.priority = priority;
    this.conditions = conditions;
    this.metadata = metadata;
    this.enabled = enabled;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(data: {
    name: string;
    description: string;
    scope: ContextScope;
    scopeId?: string;
    resource: string;
    action: string;
    effect: PolicyEffect;
    priority: number;
    conditions?: Record<string, unknown> | null;
    createdBy: string;
    enabled?: boolean;
  }): PolicyEntity {
    const now = new Date();
    return new PolicyEntity(
      randomUUID(),
      data.name,
      data.description,
      data.scope,
      data.scopeId ?? '*',
      data.resource,
      data.action,
      data.effect,
      data.priority,
      data.conditions ?? null,
      { createdAt: now, updatedAt: now, createdBy: data.createdBy, updatedBy: null },
      data.enabled ?? true,
      now,
      now,
    );
  }

  static reconstitute(data: {
    id: string;
    name: string;
    description: string;
    scope: ContextScope;
    scopeId: string | null;
    resource: string;
    action: string;
    effect: PolicyEffect;
    priority: number;
    conditions: Record<string, unknown> | null;
    metadata: Metadata;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PolicyEntity {
    return new PolicyEntity(
      data.id,
      data.name,
      data.description,
      data.scope,
      data.scopeId,
      data.resource,
      data.action,
      data.effect,
      data.priority,
      data.conditions,
      data.metadata,
      data.enabled,
      data.createdAt,
      data.updatedAt,
    );
  }
}
