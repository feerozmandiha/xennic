import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import type { ExecutionStatus } from '../../shared/types/index.js';
import type { IExecutionRepository } from '../domain/execution-repository.interface.js';
import { CompensationService } from './compensation.service.js';

@Injectable()
export class LifecycleService {
  private readonly logger = new Logger(LifecycleService.name);

  constructor(
    @Inject('IExecutionRepository')
    private readonly repository: IExecutionRepository,
    private readonly compensation: CompensationService,
  ) {}

  async pause(executionId: string): Promise<void> {
    const execution = await this.repository.get(executionId);
    if (!execution) {
      throw new NotFoundException(`Execution ${executionId} not found`);
    }

    if (execution.status !== 'running') {
      throw new Error(`Cannot pause execution ${executionId} with status ${execution.status}`);
    }

    await this.repository.updateStatus(executionId, 'paused');
    execution.status = 'paused';
    this.logger.log(`Execution ${executionId} paused`);
  }

  async resume(executionId: string): Promise<void> {
    const execution = await this.repository.get(executionId);
    if (!execution) {
      throw new NotFoundException(`Execution ${executionId} not found`);
    }

    if (execution.status !== 'paused') {
      throw new Error(`Cannot resume execution ${executionId} with status ${execution.status}`);
    }

    await this.repository.updateStatus(executionId, 'running');
    this.logger.log(`Execution ${executionId} resumed`);
  }

  async cancel(executionId: string): Promise<void> {
    const execution = await this.repository.get(executionId);
    if (!execution) {
      throw new NotFoundException(`Execution ${executionId} not found`);
    }

    if (execution.status === 'completed' || execution.status === 'cancelled') {
      throw new Error(`Cannot cancel execution ${executionId} with status ${execution.status}`);
    }

    const oldStatus = execution.status;
    await this.repository.updateStatus(executionId, 'cancelled');
    execution.status = 'cancelled';
    this.logger.log(`Execution ${executionId} cancelled`);

    if (oldStatus === 'running') {
      const failedStep = execution.steps.find(s => s.status === 'running' || s.status === 'failed');
      await this.compensation.compensate(executionId, failedStep?.stepId ?? '');
    }
  }

  async getStatus(executionId: string): Promise<ExecutionStatus> {
    const execution = await this.repository.get(executionId);
    if (!execution) {
      throw new NotFoundException(`Execution ${executionId} not found`);
    }
    return execution.status;
  }
}
