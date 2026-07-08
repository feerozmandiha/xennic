import type { PaginatedResult } from '../../shared/types/index.js';
import type { CoordinationPlan, CoordinationTask } from './coordination-plan.entity.js';
import type { AgentRole } from './agent-role.enum.js';
import type { ExecutionStatus } from '../../shared/types/index.js';

export interface ListPlanOptions {
  offset?: number;
  limit?: number;
  status?: ExecutionStatus;
}

export interface ICoordinationRepository {
  savePlan(plan: CoordinationPlan): Promise<void>;
  getPlan(id: string): Promise<CoordinationPlan | null>;
  findPlanByExecution(executionId: string): Promise<CoordinationPlan | null>;
  saveTask(task: CoordinationTask): Promise<void>;
  updateTask(taskId: string, updates: Partial<CoordinationTask>): Promise<CoordinationTask | null>;
  getPendingTasks(role?: AgentRole): Promise<CoordinationTask[]>;
  listPlans(options?: ListPlanOptions): Promise<PaginatedResult<CoordinationPlan>>;
}
