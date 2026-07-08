import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { PaginatedResult } from '../../shared/types/index.js';
import { ReviewTask } from '../domain/review-task.entity.js';
import type { IHitlRepository, FindReviewOptions } from '../domain/hitl-repository.interface.js';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @Inject('IHitlRepository')
    private readonly repository: IHitlRepository,
  ) {}

  async assign(
    executionId: string,
    stepId: string,
    userId: string,
    instructions: string,
    input: Record<string, unknown>,
  ): Promise<ReviewTask> {
    const entity = ReviewTask.create({
      executionId,
      stepId,
      assignedTo: userId,
      instructions,
      input,
    });

    await this.repository.saveReview(entity);
    this.logger.log(`Review task assigned: ${entity.id} to ${userId}`);
    return entity;
  }

  async complete(reviewId: string, output: Record<string, unknown>, feedback?: string): Promise<ReviewTask> {
    const entity = await this.getReviewOrThrow(reviewId);

    if (entity.status !== 'pending') {
      throw new BadRequestException(`Review ${reviewId} is not in pending state`);
    }

    entity.status = 'completed';
    entity.output = output;
    entity.feedback = feedback ?? null;

    await this.repository.saveReview(entity);
    this.logger.log(`Review ${reviewId} completed`);
    return entity;
  }

  async fail(reviewId: string, reason: string): Promise<ReviewTask> {
    if (!reason) {
      throw new BadRequestException('Reason is required for failure');
    }

    const entity = await this.getReviewOrThrow(reviewId);

    if (entity.status !== 'pending') {
      throw new BadRequestException(`Review ${reviewId} is not in pending state`);
    }

    entity.status = 'failed';
    entity.feedback = reason;

    await this.repository.saveReview(entity);
    this.logger.log(`Review ${reviewId} failed: ${reason}`);
    return entity;
  }

  async getPendingReviews(userId: string, options?: FindReviewOptions): Promise<PaginatedResult<ReviewTask>> {
    return this.repository.findPendingReviews(userId, options);
  }

  async getByExecution(executionId: string, options?: FindReviewOptions): Promise<PaginatedResult<ReviewTask>> {
    return this.repository.findReviews(executionId, options);
  }

  private async getReviewOrThrow(id: string): Promise<ReviewTask> {
    const entity = await this.repository.getReview(id);
    if (!entity) {
      throw new NotFoundException(`Review task ${id} not found`);
    }
    return entity;
  }
}
