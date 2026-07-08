import { randomUUID } from 'node:crypto';
import type { Metadata, Versioned, Named } from '../../shared/types/index.js';

export enum PromptStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export class PromptEntity implements Named, Versioned {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly content: string;
  public readonly variables: readonly string[];
  public readonly version: number;
  public readonly status: PromptStatus;
  public readonly tags: readonly string[];
  public readonly metadata: Metadata;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    description: string,
    content: string,
    variables: string[],
    version: number,
    status: PromptStatus,
    tags: string[],
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.content = content;
    this.variables = variables;
    this.version = version;
    this.status = status;
    this.tags = tags;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    name: string,
    description: string,
    content: string,
    variables: string[],
    createdBy: string,
    tags: string[] = [],
  ): PromptEntity {
    const now = new Date();
    return new PromptEntity(
      randomUUID(),
      name,
      description,
      content,
      variables,
      1,
      PromptStatus.DRAFT,
      tags,
      { createdAt: now, updatedAt: now, createdBy, updatedBy: null },
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    name: string,
    description: string,
    content: string,
    variables: string[],
    version: number,
    status: PromptStatus,
    tags: string[],
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
  ): PromptEntity {
    return new PromptEntity(
      id,
      name,
      description,
      content,
      variables,
      version,
      status,
      tags,
      metadata,
      createdAt,
      updatedAt,
    );
  }

  withNewVersion(content: string, updatedBy: string): PromptEntity {
    return new PromptEntity(
      randomUUID(),
      this.name,
      this.description,
      content,
      [...this.variables],
      this.version + 1,
      PromptStatus.DRAFT,
      [...this.tags],
      {
        createdAt: this.metadata.createdAt,
        updatedAt: new Date(),
        createdBy: this.metadata.createdBy,
        updatedBy,
      },
      this.createdAt,
      new Date(),
    );
  }

  withStatus(status: PromptStatus, updatedBy: string): PromptEntity {
    return new PromptEntity(
      this.id,
      this.name,
      this.description,
      this.content,
      [...this.variables],
      this.version,
      status,
      [...this.tags],
      {
        createdAt: this.metadata.createdAt,
        updatedAt: new Date(),
        createdBy: this.metadata.createdBy,
        updatedBy,
      },
      this.createdAt,
      new Date(),
    );
  }
}
