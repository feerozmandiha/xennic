import type { ExecutionStatus, PaginatedResult } from '../../shared/types/index.js';
import type { PlanEntity } from './plan.entity.js';

export interface ListPlanOptions {
  offset?: number;
  limit?: number;
  status?: ExecutionStatus;
}

export interface IPlannerRepository {
  savePlan(plan: PlanEntity): Promise<void>;
  getPlan(id: string): Promise<PlanEntity | null>;
  updatePlan(id: string, updates: Partial<PlanEntity>): Promise<PlanEntity | null>;
  listPlans(options?: ListPlanOptions): Promise<PaginatedResult<PlanEntity>>;
  deletePlan(id: string): Promise<void>;
}
