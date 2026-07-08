import type { PaginatedResult } from '../../shared/types/index.js';
import type { ReasoningPlan, PlanStatus } from './reasoning-plan.entity.js';
import type { ExecutionGraph } from './execution-graph.entity.js';

export interface ListPlansOptions {
  offset?: number;
  limit?: number;
  status?: PlanStatus;
}

export interface IReasoningRepository {
  savePlan(plan: ReasoningPlan): Promise<void>;
  getPlan(id: string): Promise<ReasoningPlan | null>;
  listPlans(options?: ListPlansOptions): Promise<PaginatedResult<ReasoningPlan>>;
  saveGraph(graph: ExecutionGraph): Promise<void>;
  getGraph(planId: string): Promise<ExecutionGraph | null>;
  deletePlan(id: string): Promise<void>;
}
