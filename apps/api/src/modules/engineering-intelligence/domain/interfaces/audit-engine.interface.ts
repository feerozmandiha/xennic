import type { AuditRecord, WorkflowExecution, ReasoningStep, CalculationResult, EngineeringDecision } from '../types/ei.types.js';

export interface IAuditEngine {
  create(executionId: string, traceId: string): Promise<AuditRecord>;
  logStep(executionId: string, step: ReasoningStep): Promise<void>;
  logCalculation(executionId: string, calc: CalculationResult): Promise<void>;
  logDecision(executionId: string, decision: EngineeringDecision): Promise<void>;
  finalize(executionId: string, workflow: WorkflowExecution, status: 'passed' | 'failed'): Promise<AuditRecord>;
  getRecord(executionId: string): Promise<AuditRecord | null>;
  verifyImmutability(record: AuditRecord): boolean;
}
