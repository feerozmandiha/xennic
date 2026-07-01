import { Injectable, Logger } from '@nestjs/common';
import type { IDisasterRecoveryService } from '../../domain/interfaces/backup-interfaces.js';
import type { DisasterRecoveryPlan } from '../../domain/types/backup.types.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class DisasterRecoveryService implements IDisasterRecoveryService {
  private readonly logger = new Logger(DisasterRecoveryService.name);
  private plans = new Map<string, DisasterRecoveryPlan>();
  private executions = new Map<string, { step: number; status: string; error?: string }>();

  async getPlans(): Promise<DisasterRecoveryPlan[]> {
    return Array.from(this.plans.values());
  }

  async execute(planId: string): Promise<string> {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`DR plan not found: ${planId}`);
    const executionId = randomUUID();
    this.executions.set(executionId, { step: 0, status: 'running' });
    this.logger.log(`DR plan executed: ${planId} (execution: ${executionId})`);

    void this.simulateExecution(executionId, plan);
    return executionId;
  }

  async test(planId: string): Promise<{ passed: boolean; issues: string[] }> {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`DR plan not found: ${planId}`);
    return { passed: true, issues: [] };
  }

  async getStatus(executionId: string): Promise<{ step: number; status: string; error?: string }> {
    return this.executions.get(executionId) ?? { step: 0, status: 'unknown' };
  }

  private async simulateExecution(executionId: string, plan: DisasterRecoveryPlan): Promise<void> {
    for (let i = 0; i < plan.steps.length; i++) {
      await new Promise((r) => setTimeout(r, 100));
      this.executions.set(executionId, { step: i + 1, status: 'running' });
    }
    this.executions.set(executionId, { step: plan.steps.length, status: 'completed' });
  }
}
