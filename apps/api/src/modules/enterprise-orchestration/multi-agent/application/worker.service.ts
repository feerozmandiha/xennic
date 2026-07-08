import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import type { ICoordinationRepository } from '../domain/coordination-repository.interface.js';
import type { ExecutionStatus } from '../../shared/types/index.js';

export interface ExecutionResult {
  taskId: string;
  success: boolean;
  output: Record<string, unknown>;
  duration: number;
}

@Injectable()
export class WorkerService {
  private readonly logger = new Logger(WorkerService.name);

  constructor(
    @Inject('ICoordinationRepository')
    private readonly repository: ICoordinationRepository,
  ) {}

  async execute(taskId: string, input: Record<string, unknown>): Promise<ExecutionResult> {
    const task = await this.repository.updateTask(taskId, { status: 'running' });
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }

    const start = Date.now();
    this.logger.log(`Executing task ${taskId}`);

    const output: Record<string, unknown> = {
      processed: true,
      input,
      executedAt: new Date().toISOString(),
      result: `Simulated execution of ${task.description}`,
    };

    const duration = Date.now() - start;

    await this.repository.updateTask(taskId, {
      status: 'completed',
      output,
    });

    this.logger.log(`Task ${taskId} completed in ${duration}ms`);
    return { taskId, success: true, output, duration };
  }

  async reportProgress(
    taskId: string,
    status: ExecutionStatus,
    result?: Record<string, unknown>,
  ): Promise<void> {
    const updates: Partial<Record<string, unknown>> & { status?: ExecutionStatus; output?: Record<string, unknown> } = {
      status,
    };
    if (result) {
      updates.output = result;
    }
    const task = await this.repository.updateTask(taskId, updates);
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }
    this.logger.log(`Task ${taskId} progress: ${status}`);
  }

  async fail(taskId: string, error: string): Promise<void> {
    const task = await this.repository.updateTask(taskId, {
      status: 'failed',
      output: { error },
    });
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }
    this.logger.warn(`Task ${taskId} failed: ${error}`);
  }
}
