import type { AgentQuery, AgentDefinition, OrchestrationPlan, AgentStepResult, ToolExecutionResult, AgentTask } from '../types/agent.types.js';

export interface IMultiAgentOrchestrator {
  createPlan(query: AgentQuery, agents: AgentDefinition[]): OrchestrationPlan;
  executePlan(plan: OrchestrationPlan): Promise<{ stepResults: AgentStepResult[]; toolsUsed: ToolExecutionResult[] }>;
  delegateTask(task: AgentTask): Promise<AgentTask>;
  getPlan(planId: string): OrchestrationPlan | null;
}
