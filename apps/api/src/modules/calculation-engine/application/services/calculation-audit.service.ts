import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { ICalculationAudit } from '../../domain/interfaces/calculation-audit.interface.js';
import type { AuditRecord } from '../../domain/types/calculation.types.js';

@Injectable()
export class CalculationAudit implements ICalculationAudit {
  private readonly logger = new Logger(CalculationAudit.name);
  private records = new Map<string, AuditRecord>();
  private pending = new Map<string, Partial<AuditRecord>>();

  async create(executionId: string): Promise<void> {
    this.pending.set(executionId, { executionId, timestamp: Date.now(), unitConversions: [], executionTrace: [], intermediates: [] });
  }

  async append(executionId: string, record: Partial<AuditRecord>): Promise<void> {
    const existing = this.pending.get(executionId);
    if (!existing) {
      this.logger.warn(`No pending audit for ${executionId}, creating new`);
      this.pending.set(executionId, { executionId, timestamp: Date.now(), ...record });
      return;
    }
    Object.assign(existing, record);
    if (record.intermediates) {
      existing.intermediates = [...(existing.intermediates ?? []), ...record.intermediates];
    }
    if (record.executionTrace) {
      existing.executionTrace = [...(existing.executionTrace ?? []), ...record.executionTrace];
    }
    if (record.unitConversions) {
      existing.unitConversions = [...(existing.unitConversions ?? []), ...record.unitConversions];
    }
  }

  async finalize(executionId: string, record: AuditRecord): Promise<AuditRecord> {
    const pending = this.pending.get(executionId);
    const merged: AuditRecord = {
      ...record,
      intermediates: [...(pending?.intermediates ?? []), ...(record.intermediates ?? [])],
      executionTrace: [...(pending?.executionTrace ?? []), ...(record.executionTrace ?? [])],
      unitConversions: [...(pending?.unitConversions ?? []), ...(record.unitConversions ?? [])],
    };

    const checksum = createHash('sha256')
      .update(JSON.stringify({ formulaId: record.formulaId, inputs: record.inputs, outputs: record.outputs, timestamp: record.timestamp }))
      .digest('hex')
      .slice(0, 16);

    const finalized: AuditRecord = { ...merged, checksum, duration: Date.now() - record.timestamp };
    this.records.set(executionId, finalized);
    this.pending.delete(executionId);
    this.logger.debug(`Audit finalized for ${executionId}: ${finalized.checksum}`);
    return finalized;
  }

  async getRecord(executionId: string): Promise<AuditRecord | null> {
    return this.records.get(executionId) ?? null;
  }

  async listByFormula(formulaId: string): Promise<AuditRecord[]> {
    return Array.from(this.records.values()).filter((r) => r.formulaId === formulaId);
  }
}
