import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import type { ICoordinationRepository } from '../domain/coordination-repository.interface.js';

export interface ReviewResult {
  taskId: string;
  approved: boolean;
  feedback: string | null;
}

export interface ReviewCriteria {
  quality?: boolean;
  completeness?: boolean;
  accuracy?: boolean;
  custom?: string[];
}

@Injectable()
export class ReviewerService {
  private readonly logger = new Logger(ReviewerService.name);

  constructor(
    @Inject('ICoordinationRepository')
    private readonly repository: ICoordinationRepository,
  ) {}

  async review(
    taskId: string,
    output: Record<string, unknown>,
    criteria?: ReviewCriteria,
  ): Promise<ReviewResult> {
    const task = await this.repository.updateTask(taskId, { status: 'running' });
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }

    this.logger.log(`Reviewing task ${taskId}`);

    if (!criteria) {
      criteria = { quality: true, completeness: true, accuracy: true };
    }

    const issues: string[] = [];
    if (criteria.quality && !output.quality) {
      issues.push('Quality metric missing from output');
    }
    if (criteria.completeness && !output.completed) {
      issues.push('Completeness not confirmed');
    }
    if (criteria.accuracy && output.error) {
      issues.push(`Output contains error: ${output.error}`);
    }

    const approved = issues.length === 0;
    const feedback = issues.length > 0 ? issues.join('; ') : null;

    await this.repository.updateTask(taskId, { status: approved ? 'completed' : 'running' });
    this.logger.log(
      `Task ${taskId} ${approved ? 'approved' : 'rejected'}${feedback ? `: ${feedback}` : ''}`,
    );

    return { taskId, approved, feedback };
  }

  async requestChanges(taskId: string, feedback: string): Promise<void> {
    const task = await this.repository.updateTask(taskId, {
      status: 'pending',
      output: { feedback, requiresChanges: true },
    });
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }
    this.logger.log(`Requested changes for task ${taskId}: ${feedback}`);
  }

  async approve(taskId: string): Promise<void> {
    const task = await this.repository.updateTask(taskId, { status: 'completed' });
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }
    this.logger.log(`Task ${taskId} approved`);
  }
}
