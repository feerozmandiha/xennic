import type { WorkflowStatus } from '../../shared/types/index.js';
import type { PaginatedResult } from '../../shared/types/index.js';
import type { WorkflowDefinition } from './workflow-definition.entity.js';
import type { WorkflowTemplate } from './workflow-template.entity.js';

export interface ListWorkflowOptions {
  offset?: number;
  limit?: number;
  status?: WorkflowStatus;
}

export interface ListTemplateOptions {
  offset?: number;
  limit?: number;
  category?: string;
  tags?: string[];
}

export interface IWorkflowRepository {
  save(entity: WorkflowDefinition): Promise<void>;
  get(id: string): Promise<WorkflowDefinition | null>;
  getByName(name: string, version?: number): Promise<WorkflowDefinition | null>;
  list(options?: ListWorkflowOptions): Promise<PaginatedResult<WorkflowDefinition>>;
  findByTrigger(type: string): Promise<WorkflowDefinition[]>;
  saveTemplate(template: WorkflowTemplate): Promise<void>;
  findTemplates(options?: ListTemplateOptions): Promise<PaginatedResult<WorkflowTemplate>>;
  delete(id: string): Promise<void>;
}
