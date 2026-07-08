import { randomUUID } from 'node:crypto';
import type { Metadata, Named } from '../../shared/types/index.js';

export interface PolicyRule {
  resource: string;
  action: string;
  condition: Record<string, unknown> | null;
}

export type PolicyEffect = 'allow' | 'deny';

export class PromptPolicyEntity implements Named {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly rules: readonly PolicyRule[];
  public readonly effect: PolicyEffect;
  public readonly priority: number;
  public readonly metadata: Metadata;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    description: string,
    rules: PolicyRule[],
    effect: PolicyEffect,
    priority: number,
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.rules = rules;
    this.effect = effect;
    this.priority = priority;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    name: string,
    description: string,
    rules: PolicyRule[],
    effect: PolicyEffect,
    priority: number,
    createdBy: string,
  ): PromptPolicyEntity {
    const now = new Date();
    return new PromptPolicyEntity(
      randomUUID(),
      name,
      description,
      rules,
      effect,
      priority,
      { createdAt: now, updatedAt: now, createdBy, updatedBy: null },
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    name: string,
    description: string,
    rules: PolicyRule[],
    effect: PolicyEffect,
    priority: number,
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
  ): PromptPolicyEntity {
    return new PromptPolicyEntity(
      id,
      name,
      description,
      rules,
      effect,
      priority,
      metadata,
      createdAt,
      updatedAt,
    );
  }
}
