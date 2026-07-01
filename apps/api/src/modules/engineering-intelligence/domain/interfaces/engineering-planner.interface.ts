import type { ReasoningGoal, ExecutionPlan, PlanNodeType } from '../types/ei.types.js';

export interface IEngineeringPlanner {
  createPlan(goal: ReasoningGoal): Promise<ExecutionPlan>;
  validatePlan(plan: ExecutionPlan): Promise<boolean>;
  getPlan(planId: string): Promise<ExecutionPlan | null>;
  getSupportedPlanTypes(): PlanNodeType[];
}
