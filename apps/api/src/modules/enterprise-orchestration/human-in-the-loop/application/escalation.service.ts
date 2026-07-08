import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import type { IHitlRepository } from '../domain/hitl-repository.interface.js';

export interface EscalationEntry {
  id: string;
  executionId: string;
  stepId: string;
  reason: string;
  escalatedTo: string[];
  escalatedAt: Date;
  resolved: boolean;
}

@Injectable()
export class EscalationService {
  private readonly logger = new Logger(EscalationService.name);
  private readonly escalations = new Map<string, EscalationEntry[]>();

  constructor(
    @Inject('IHitlRepository')
    private readonly repository: IHitlRepository,
  ) {}

  async escalate(
    executionId: string,
    stepId: string,
    reason: string,
    to?: string[],
  ): Promise<EscalationEntry> {
    const entry: EscalationEntry = {
      id: `${executionId}:${stepId}:${Date.now()}`,
      executionId,
      stepId,
      reason,
      escalatedTo: to ?? [],
      escalatedAt: new Date(),
      resolved: false,
    };

    const key = `${executionId}:${stepId}`;
    const existing = this.escalations.get(key) ?? [];
    existing.push(entry);
    this.escalations.set(key, existing);

    this.logger.log(`Escalation raised for ${executionId}/${stepId}: ${reason}`);
    return entry;
  }

  async getEscalationPath(executionId: string): Promise<EscalationEntry[]> {
    const results: EscalationEntry[] = [];

    for (const [, entries] of this.escalations) {
      for (const entry of entries) {
        if (entry.executionId === executionId) {
          results.push(entry);
        }
      }
    }

    return results.sort((a, b) => a.escalatedAt.getTime() - b.escalatedAt.getTime());
  }

  async processEscalation(approvalId: string): Promise<'approved' | 'notified'> {
    const approval = await this.repository.getApproval(approvalId);

    if (!approval) {
      throw new NotFoundException(`Approval ${approvalId} not found`);
    }

    this.logger.log(`Processing escalation for approval ${approvalId}`);

    if (approval.dueAt && approval.dueAt < new Date()) {
      approval.status = 'approved';
      approval.updatedAt = new Date();
      await this.repository.saveApproval(approval);
      this.logger.log(`Approval ${approvalId} auto-approved due to deadline`);
      return 'approved';
    }

    return 'notified';
  }
}
