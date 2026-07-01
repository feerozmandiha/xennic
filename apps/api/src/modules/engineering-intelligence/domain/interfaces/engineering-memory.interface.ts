import type { ExecutionMemory, WorkflowNodeState, CalculationResult } from '../types/ei.types.js';

export interface IEngineeringMemory {
  createSession(sessionId: string, workflowId: string, context?: Record<string, unknown>): Promise<ExecutionMemory>;
  getSession(sessionId: string): Promise<ExecutionMemory | null>;
  updateStep(sessionId: string, nodeId: string, state: WorkflowNodeState): Promise<void>;
  cacheCalculation(sessionId: string, calcId: string, result: CalculationResult): Promise<void>;
  getCachedCalculation(sessionId: string, calcId: string): Promise<CalculationResult | null>;
  getEvidenceCache(sessionId: string): Promise<unknown[]>;
  clearSession(sessionId: string): Promise<void>;
}
