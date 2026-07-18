import type { ExecutionStatus, PaginatedResult } from '../../shared/types/index.js';
import type { WorkflowExecution } from './workflow-execution.entity.js';
import type { CompensationEntry } from './compensation.entity.js';

export interface ListExecutionOptions {
  offset?: number;
  limit?: number;
  status?: ExecutionStatus;
  workflowId?: string;
}

export interface IExecutionRepository {
  save(execution: WorkflowExecution): Promise<void>;
  get(id: string): Promise<WorkflowExecution | null>;
  findByWorkflow(
    workflowId: string,
    options?: ListExecutionOptions,
  ): Promise<PaginatedResult<WorkflowExecution>>;
  list(options?: ListExecutionOptions): Promise<PaginatedResult<WorkflowExecution>>;
  updateStatus(id: string, status: ExecutionStatus): Promise<void>;
  saveCompensation(entry: CompensationEntry): Promise<void>;
  getCompensations(executionId: string): Promise<CompensationEntry[]>;
}
