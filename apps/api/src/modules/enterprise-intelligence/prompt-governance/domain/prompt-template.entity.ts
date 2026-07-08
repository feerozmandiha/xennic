import { randomUUID } from 'node:crypto';
import type { Metadata, Versioned, Named } from '../../shared/types/index.js';

export interface VariableDef {
  name: string;
  type: string;
  required: boolean;
  default?: string;
}

export class PromptTemplateEntity implements Named, Versioned {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly content: string;
  public readonly variables: readonly VariableDef[];
  public readonly version: number;
  public readonly metadata: Metadata;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    description: string,
    content: string,
    variables: VariableDef[],
    version: number,
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
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    name: string,
    description: string,
    content: string,
    variables: VariableDef[],
    createdBy: string,
  ): PromptTemplateEntity {
    const now = new Date();
    return new PromptTemplateEntity(
      randomUUID(),
      name,
      description,
      content,
      variables,
      1,
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
    variables: VariableDef[],
    version: number,
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
  ): PromptTemplateEntity {
    return new PromptTemplateEntity(
      id,
      name,
      description,
      content,
      variables,
      version,
      metadata,
      createdAt,
      updatedAt,
    );
  }
}
