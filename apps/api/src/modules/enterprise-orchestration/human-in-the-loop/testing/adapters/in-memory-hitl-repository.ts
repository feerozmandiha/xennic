import { Logger } from '@nestjs/common';
import type { PaginatedResult } from '../../../shared/types/index.js';
import { ApprovalRequest } from '../../domain/approval-request.entity.js';
import { ReviewTask } from '../../domain/review-task.entity.js';
import type {
  IHitlRepository,
  FindApprovalOptions,
  FindReviewOptions,
} from '../../domain/hitl-repository.interface.js';

export class InMemoryHitlRepository implements IHitlRepository {
  private readonly logger = new Logger(InMemoryHitlRepository.name);
  private readonly approvals = new Map<string, ApprovalRequest>();
  private readonly reviews = new Map<string, ReviewTask>();

  async saveApproval(entity: ApprovalRequest): Promise<void> {
    this.approvals.set(entity.id, entity);
    this.logger.debug(`Saved approval ${entity.id}`);
  }

  async getApproval(id: string): Promise<ApprovalRequest | null> {
    return this.approvals.get(id) ?? null;
  }

  async findApprovals(
    executionId: string,
    options?: FindApprovalOptions,
  ): Promise<PaginatedResult<ApprovalRequest>> {
    let items = Array.from(this.approvals.values())
      .filter(a => a.executionId === executionId);

    if (options?.status) {
      items = items.filter(a => a.status === options.status);
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async findPendingApprovals(
    userId: string,
    options?: FindApprovalOptions,
  ): Promise<PaginatedResult<ApprovalRequest>> {
    const items = Array.from(this.approvals.values())
      .filter(a => a.status === 'pending' && a.assignedTo.includes(userId));

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async saveReview(entity: ReviewTask): Promise<void> {
    this.reviews.set(entity.id, entity);
    this.logger.debug(`Saved review ${entity.id}`);
  }

  async getReview(id: string): Promise<ReviewTask | null> {
    return this.reviews.get(id) ?? null;
  }

  async findReviews(
    executionId: string,
    options?: FindReviewOptions,
  ): Promise<PaginatedResult<ReviewTask>> {
    let items = Array.from(this.reviews.values())
      .filter(r => r.executionId === executionId);

    if (options?.status) {
      items = items.filter(r => r.status === options.status);
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async findPendingReviews(
    userId: string,
    options?: FindReviewOptions,
  ): Promise<PaginatedResult<ReviewTask>> {
    const items = Array.from(this.reviews.values())
      .filter(r => r.status === 'pending' && r.assignedTo === userId);

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async countPending(userId: string): Promise<number> {
    let count = 0;

    for (const approval of this.approvals.values()) {
      if (approval.status === 'pending' && approval.assignedTo.includes(userId)) {
        count++;
      }
    }

    for (const review of this.reviews.values()) {
      if (review.status === 'pending' && review.assignedTo === userId) {
        count++;
      }
    }

    return count;
  }
}
