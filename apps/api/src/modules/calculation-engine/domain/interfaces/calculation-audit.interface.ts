import type { AuditRecord } from '../types/calculation.types.js';

export interface ICalculationAudit {
  create(executionId: string): Promise<void>;
  append(executionId: string, record: Partial<AuditRecord>): Promise<void>;
  finalize(executionId: string, record: AuditRecord): Promise<AuditRecord>;
  getRecord(executionId: string): Promise<AuditRecord | null>;
  listByFormula(formulaId: string): Promise<AuditRecord[]>;
}
