import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IAuditEngine } from '../../domain/interfaces/audit-engine.interface.js';
import type { AuditRecord, WorkflowExecution, ReasoningStep, CalculationResult, EngineeringDecision, AuditTiming } from '../../domain/types/ei.types.js';

@Injectable()
export class AuditEngine implements IAuditEngine {
  private readonly logger = new Logger(AuditEngine.name);
  private readonly records = new Map<string, AuditRecord>();
  private readonly auditLog: string[] = [];

  async create(executionId: string, traceId: string): Promise<AuditRecord> {
    const record: AuditRecord = {
      executionId, traceId,
      workflowGraph: {} as WorkflowExecution,
      reasoningLog: [], calculationLog: [],
      timing: { totalDuration: 0, perStep: {}, retrievalTime: 0, calculationTime: 0, decisionTime: 0 },
      decisionHistory: [],
      validationStatus: 'pending',
      timestamp: Date.now(),
    };
    this.records.set(executionId, record);
    this.appendLog(`Audit created for execution ${executionId}`);
    return record;
  }

  async logStep(executionId: string, step: ReasoningStep): Promise<void> {
    const record = this.records.get(executionId);
    if (!record) throw new Error(`Audit record ${executionId} not found`);
    record.reasoningLog.push({ ...step });
    record.timing.perStep[step.id] = step.trace.duration;
    this.appendLog(`Step ${step.id} (${step.type}) logged for ${executionId}`);
  }

  async logCalculation(executionId: string, calc: CalculationResult): Promise<void> {
    const record = this.records.get(executionId);
    if (!record) throw new Error(`Audit record ${executionId} not found`);
    record.calculationLog.push({ ...calc });
    record.timing.calculationTime += calc.duration;
    this.appendLog(`Calculation ${calc.id} logged for ${executionId}`);
  }

  async logDecision(executionId: string, decision: EngineeringDecision): Promise<void> {
    const record = this.records.get(executionId);
    if (!record) throw new Error(`Audit record ${executionId} not found`);
    record.decisionHistory.push({ ...decision });
    this.appendLog(`Decision ${decision.id} logged for ${executionId}`);
  }

  async finalize(executionId: string, workflow: WorkflowExecution, status: 'passed' | 'failed'): Promise<AuditRecord> {
    const record = this.records.get(executionId);
    if (!record) throw new Error(`Audit record ${executionId} not found`);
    record.workflowGraph = { ...workflow };
    record.validationStatus = status;
    record.timing.totalDuration = (workflow.endTime ?? Date.now()) - workflow.startTime;
    this.appendLog(`Audit ${executionId} finalized: ${status}`);
    return record;
  }

  async getRecord(executionId: string): Promise<AuditRecord | null> {
    return this.records.get(executionId) ?? null;
  }

  verifyImmutability(record: AuditRecord): boolean {
    return record.timestamp > 0 && record.executionId.length > 0;
  }

  getAuditLog(): string[] {
    return [...this.auditLog];
  }

  private appendLog(message: string): void {
    this.auditLog.push(`[${new Date().toISOString()}] ${message}`);
  }
}
