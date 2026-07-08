export type WorkflowStatus =
  | 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'archived';

export type ExecutionStatus =
  | 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'awaiting_approval';

export type StepType =
  | 'task' | 'parallel' | 'conditional' | 'approval' | 'wait' | 'subworkflow';

export interface Metadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string | null;
}

export interface Versioned {
  version: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}
