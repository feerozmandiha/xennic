import type { ReasoningGoal, ReasoningStep, EngineeringAssumption, Constraint } from '../types/ei.types.js';

export interface IReasoningKernel {
  decompose(goal: ReasoningGoal): Promise<ReasoningStep[]>;
  execute(step: ReasoningStep, context: Record<string, unknown>): Promise<ReasoningStep>;
  propagateConstraints(goal: ReasoningGoal, steps: ReasoningStep[]): Promise<Constraint[]>;
  getDecisionTrace(goalId: string): Promise<ReasoningStep[]>;
}
