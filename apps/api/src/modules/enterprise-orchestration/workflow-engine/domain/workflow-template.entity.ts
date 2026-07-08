import { randomUUID } from 'node:crypto';
import type { Metadata } from '../../shared/types/index.js';
import type { WorkflowStep, WorkflowTrigger } from './workflow-definition.entity.js';

export interface VariableDef {
  name: string;
  type: string;
  required: boolean;
  default?: unknown;
}

export interface WorkflowTemplateOptions {
  name: string;
  description: string;
  definition: {
    steps: WorkflowStep[];
    triggers: WorkflowTrigger[];
    timeout: number | null;
  };
  variables: VariableDef[];
  category: string;
  tags: string[];
  metadata: Metadata;
}

export class WorkflowTemplate {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly version: number;
  public readonly definition: {
    steps: WorkflowStep[];
    triggers: WorkflowTrigger[];
    timeout: number | null;
  };
  public readonly variables: VariableDef[];
  public readonly category: string;
  public readonly tags: string[];
  public readonly metadata: Metadata;

  private constructor(
    id: string,
    name: string,
    description: string,
    version: number,
    definition: { steps: WorkflowStep[]; triggers: WorkflowTrigger[]; timeout: number | null },
    variables: VariableDef[],
    category: string,
    tags: string[],
    metadata: Metadata,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.version = version;
    this.definition = definition;
    this.variables = variables;
    this.category = category;
    this.tags = tags;
    this.metadata = metadata;
  }

  static create(opts: WorkflowTemplateOptions): WorkflowTemplate {
    return new WorkflowTemplate(
      randomUUID(),
      opts.name,
      opts.description,
      1,
      opts.definition,
      opts.variables,
      opts.category,
      opts.tags,
      opts.metadata,
    );
  }

  static reconstitute(
    id: string,
    name: string,
    description: string,
    version: number,
    definition: { steps: WorkflowStep[]; triggers: WorkflowTrigger[]; timeout: number | null },
    variables: VariableDef[],
    category: string,
    tags: string[],
    metadata: Metadata,
  ): WorkflowTemplate {
    return new WorkflowTemplate(
      id,
      name,
      description,
      version,
      definition,
      variables,
      category,
      tags,
      metadata,
    );
  }
}
