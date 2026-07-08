import { randomUUID } from 'node:crypto';
import type { Versioned, Named } from '../../shared/types/index.js';

export enum SkillStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
}

export interface SkillDependency {
  skillId: string;
  version?: number;
  optional: boolean;
}

export interface SkillIO {
  name: string;
  type: string;
  description: string;
  required: boolean;
  schema: Record<string, unknown>;
}

export class SkillEntity implements Versioned, Named {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly version: number;
  public readonly dependencies: SkillDependency[];
  public readonly inputs: SkillIO[];
  public readonly outputs: SkillIO[];
  public readonly policies: string[];
  public readonly tags: string[];
  public readonly status: SkillStatus;
  public readonly metadata: Record<string, unknown>;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    description: string,
    version: number,
    dependencies: SkillDependency[],
    inputs: SkillIO[],
    outputs: SkillIO[],
    policies: string[],
    tags: string[],
    status: SkillStatus,
    metadata: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.version = version;
    this.dependencies = dependencies;
    this.inputs = inputs;
    this.outputs = outputs;
    this.policies = policies;
    this.tags = tags;
    this.status = status;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    name: string,
    description: string,
    dependencies: SkillDependency[],
    inputs: SkillIO[],
    outputs: SkillIO[],
    policies: string[],
    tags: string[],
    metadata?: Record<string, unknown>,
  ): SkillEntity {
    const now = new Date();
    return new SkillEntity(
      randomUUID(),
      name,
      description,
      1,
      dependencies,
      inputs,
      outputs,
      policies,
      tags,
      SkillStatus.DRAFT,
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
    dependencies: SkillDependency[],
    inputs: SkillIO[],
    outputs: SkillIO[],
    policies: string[],
    tags: string[],
    status: SkillStatus,
    metadata: Record<string, unknown>,
    createdAt: Date,
    updatedAt: Date,
  ): SkillEntity {
    return new SkillEntity(
      id,
      name,
      description,
      version,
      dependencies,
      inputs,
      outputs,
      policies,
      tags,
      status,
      metadata,
      createdAt,
      updatedAt,
    );
  }
}
