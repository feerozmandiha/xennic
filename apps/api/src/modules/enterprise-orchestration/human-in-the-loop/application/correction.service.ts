import { Injectable, Logger } from '@nestjs/common';

export interface CorrectionRecord {
  id: string;
  executionId: string;
  stepId: string;
  issue: string;
  suggestedFix: string;
  correction?: string;
  appliedAt?: Date;
  createdAt: Date;
}

@Injectable()
export class CorrectionService {
  private readonly logger = new Logger(CorrectionService.name);
  private readonly corrections = new Map<string, CorrectionRecord[]>();

  async requestCorrection(
    executionId: string,
    stepId: string,
    issue: string,
    suggestedFix: string,
  ): Promise<CorrectionRecord> {
    const record: CorrectionRecord = {
      id: `${executionId}:${stepId}:${Date.now()}`,
      executionId,
      stepId,
      issue,
      suggestedFix,
      createdAt: new Date(),
    };

    const key = `${executionId}:${stepId}`;
    const existing = this.corrections.get(key) ?? [];
    existing.push(record);
    this.corrections.set(key, existing);

    this.logger.log(`Correction requested for ${executionId}/${stepId}: ${issue}`);
    return record;
  }

  async applyCorrection(
    executionId: string,
    stepId: string,
    correction: string,
  ): Promise<CorrectionRecord | null> {
    const key = `${executionId}:${stepId}`;
    const records = this.corrections.get(key);

    if (!records || records.length === 0) {
      this.logger.warn(`No pending correction for ${executionId}/${stepId}`);
      return null;
    }

    const latest = records[records.length - 1]!;
    latest.correction = correction;
    latest.appliedAt = new Date();

    this.logger.log(`Correction applied for ${executionId}/${stepId}: ${correction}`);
    return latest;
  }

  async getCorrections(executionId: string): Promise<CorrectionRecord[]> {
    const results: CorrectionRecord[] = [];

    for (const [, records] of this.corrections) {
      for (const record of records) {
        if (record.executionId === executionId) {
          results.push(record);
        }
      }
    }

    return results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}
