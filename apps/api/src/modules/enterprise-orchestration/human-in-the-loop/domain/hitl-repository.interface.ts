import type { PaginatedResult } from '../../shared/types/index.js';
import type { ApprovalRequest } from './approval-request.entity.js';
import type { ReviewTask } from './review-task.entity.js';

export interface FindApprovalOptions {
  offset?: number;
  limit?: number;
  status?: string;
}

export interface FindReviewOptions {
  offset?: number;
  limit?: number;
  status?: string;
}

export interface IHitlRepository {
  saveApproval(entity: ApprovalRequest): Promise<void>;
  getApproval(id: string): Promise<ApprovalRequest | null>;
  findApprovals(
    executionId: string,
    options?: FindApprovalOptions,
  ): Promise<PaginatedResult<ApprovalRequest>>;
  findPendingApprovals(
    userId: string,
    options?: FindApprovalOptions,
  ): Promise<PaginatedResult<ApprovalRequest>>;
  saveReview(entity: ReviewTask): Promise<void>;
  getReview(id: string): Promise<ReviewTask | null>;
  findReviews(
    executionId: string,
    options?: FindReviewOptions,
  ): Promise<PaginatedResult<ReviewTask>>;
  findPendingReviews(
    userId: string,
    options?: FindReviewOptions,
  ): Promise<PaginatedResult<ReviewTask>>;
  countPending(userId: string): Promise<number>;
}
