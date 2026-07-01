import type { ExecutionPlan, WorkflowExecution, WorkflowNodeState } from '../types/ei.types.js';

export interface IWorkflowEngine {
  start(plan: ExecutionPlan, sessionId: string): Promise<WorkflowExecution>;
  cancel(executionId: string): Promise<void>;
  pause(executionId: string): Promise<WorkflowExecution>;
  resume(executionId: string): Promise<WorkflowExecution>;
  getStatus(executionId: string): Promise<WorkflowExecution>;
  checkpoint(executionId: string): Promise<string>;
  recover(checkpointId: string): Promise<WorkflowExecution>;
  executeNode(execution: WorkflowExecution, nodeId: string): Promise<WorkflowNodeState>;
}
