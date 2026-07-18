import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IExecutionRepository } from '../domain/execution-repository.interface.js';
import { CompensationEntry } from '../domain/compensation.entity.js';

@Injectable()
export class CompensationService {
  private readonly logger = new Logger(CompensationService.name);

  constructor(
    @Inject('IExecutionRepository')
    private readonly repository: IExecutionRepository,
  ) {}

  async compensate(executionId: string, failedStepId: string): Promise<void> {
    this.logger.log(
      `Starting compensation for execution ${executionId} due to failure at step ${failedStepId}`,
    );

    const completedSteps = await this.getCompletedSteps(executionId);
    const reversed = completedSteps.reverse();

    for (const step of reversed) {
      if (step.stepId === failedStepId) continue;

      try {
        const entry = CompensationEntry.create({
          executionId,
          stepId: step.stepId,
          action: `compensate:${step.stepId}`,
        });

        entry.status = 'completed';
        await this.repository.saveCompensation(entry);
        this.logger.debug(`Compensated step ${step.stepId}`);
      } catch (error) {
        const entry = CompensationEntry.create({
          executionId,
          stepId: step.stepId,
          action: `compensate:${step.stepId}`,
        });

        entry.status = 'failed';
        entry.error = error instanceof Error ? error.message : String(error);
        await this.repository.saveCompensation(entry);
        this.logger.error(`Failed to compensate step ${step.stepId}`);
      }
    }

    this.logger.log(`Compensation completed for execution ${executionId}`);
  }

  async registerCompensation(executionId: string, stepId: string, action: string): Promise<void> {
    const entry = CompensationEntry.create({ executionId, stepId, action });
    await this.repository.saveCompensation(entry);
    this.logger.debug(`Registered compensation for step ${stepId}: ${action}`);
  }

  async getCompensationPlan(executionId: string): Promise<CompensationEntry[]> {
    const entries = await this.repository.getCompensations(executionId);
    return entries.reverse();
  }

  private async getCompletedSteps(executionId: string): Promise<{ stepId: string }[]> {
    const execution = await this.repository.get(executionId);
    if (!execution) return [];
    return execution.steps
      .filter((s) => s.status === 'completed')
      .map((s) => ({ stepId: s.stepId }));
  }
}
