import { Injectable } from '@nestjs/common';
import type { IRetentionService } from '../../domain/interfaces/backup-interfaces.js';
import type { RetentionRule } from '../../domain/types/backup.types.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RetentionService implements IRetentionService {
  private rules = new Map<string, RetentionRule>();

  async getRules(): Promise<RetentionRule[]> {
    return Array.from(this.rules.values());
  }

  async setRule(rule: Omit<RetentionRule, 'id'>): Promise<string> {
    const id = randomUUID();
    this.rules.set(id, { ...rule, id });
    return id;
  }

  async deleteRule(ruleId: string): Promise<void> {
    this.rules.delete(ruleId);
  }

  async apply(): Promise<{ deleted: number; freed: number }> {
    return { deleted: 0, freed: 0 };
  }
}
