import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { PaginatedResult } from '../../../shared/types/index.js';
import { ApprovalRequest } from '../../domain/approval-request.entity.js';
import { ReviewTask } from '../../domain/review-task.entity.js';
import type {
  IHitlRepository,
  FindApprovalOptions,
  FindReviewOptions,
} from '../../domain/hitl-repository.interface.js';

@Injectable()
export class PrismaHitlRepository implements IHitlRepository {
  private readonly logger = new Logger(PrismaHitlRepository.name);

  async saveApproval(entity: ApprovalRequest): Promise<void> {
    const meta = entity.metadata as unknown as Record<string, unknown>;
    await prisma.approval_requests.upsert({
      where: { id: entity.id },
      create: {
        id: entity.id,
        execution_id: entity.executionId,
        step_id: entity.stepId,
        status: entity.status,
        requested_by: entity.requestedBy,
        assigned_to: entity.assignedTo.join(','),
        reason: null,
        metadata: {
          ...meta,
          title: entity.title,
          description: entity.description,
          context: entity.context,
          dueAt: entity.dueAt?.toISOString() ?? null,
          escalatedAt: entity.escalatedAt?.toISOString() ?? null,
          escalationReason: entity.escalationReason,
          assignedToList: entity.assignedTo,
        } as unknown as Record<string, unknown>,
      },
      update: {
        status: entity.status,
        assigned_to: entity.assignedTo.join(','),
        metadata: {
          ...meta,
          title: entity.title,
          description: entity.description,
          context: entity.context,
          dueAt: entity.dueAt?.toISOString() ?? null,
          escalatedAt: entity.escalatedAt?.toISOString() ?? null,
          escalationReason: entity.escalationReason,
          assignedToList: entity.assignedTo,
        } as unknown as Record<string, unknown>,
      },
    });
    this.logger.debug(`Saved approval ${entity.id}`);
  }

  async getApproval(id: string): Promise<ApprovalRequest | null> {
    const row = await prisma.approval_requests.findUnique({ where: { id } });
    if (!row) return null;
    return this.rowToApproval(row);
  }

  async findApprovals(executionId: string, options?: FindApprovalOptions): Promise<PaginatedResult<ApprovalRequest>> {
    const where: Record<string, unknown> = { execution_id: executionId };
    if (options?.status) {
      where.status = options.status;
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.approval_requests.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.approval_requests.count({ where: where as any }),
    ]);

    return {
      items: rows.map(row => this.rowToApproval(row)),
      total,
      offset,
      limit,
    };
  }

  async findPendingApprovals(userId: string, options?: FindApprovalOptions): Promise<PaginatedResult<ApprovalRequest>> {
    const where: Record<string, unknown> = {
      status: 'pending',
      assigned_to: { contains: userId },
    };
    if (options?.status) {
      where.status = options.status;
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.approval_requests.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.approval_requests.count({ where: where as any }),
    ]);

    return {
      items: rows.map(row => this.rowToApproval(row)),
      total,
      offset,
      limit,
    };
  }

  async saveReview(entity: ReviewTask): Promise<void> {
    const meta = entity.metadata as unknown as Record<string, unknown>;
    await prisma.review_tasks.upsert({
      where: { id: entity.id },
      create: {
        id: entity.id,
        execution_id: entity.executionId,
        step_id: entity.stepId,
        status: entity.status,
        reviewer_id: entity.assignedTo,
        feedback: entity.feedback,
        metadata: {
          ...meta,
          instructions: entity.instructions,
          input: entity.input,
          output: entity.output,
        } as unknown as Record<string, unknown>,
      },
      update: {
        status: entity.status,
        feedback: entity.feedback,
        metadata: {
          ...meta,
          instructions: entity.instructions,
          input: entity.input,
          output: entity.output,
        } as unknown as Record<string, unknown>,
      },
    });
    this.logger.debug(`Saved review ${entity.id}`);
  }

  async getReview(id: string): Promise<ReviewTask | null> {
    const row = await prisma.review_tasks.findUnique({ where: { id } });
    if (!row) return null;
    return this.rowToReview(row);
  }

  async findReviews(executionId: string, options?: FindReviewOptions): Promise<PaginatedResult<ReviewTask>> {
    const where: Record<string, unknown> = { execution_id: executionId };
    if (options?.status) {
      where.status = options.status;
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.review_tasks.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.review_tasks.count({ where: where as any }),
    ]);

    return {
      items: rows.map(row => this.rowToReview(row)),
      total,
      offset,
      limit,
    };
  }

  async findPendingReviews(userId: string, options?: FindReviewOptions): Promise<PaginatedResult<ReviewTask>> {
    const where: Record<string, unknown> = {
      status: 'pending',
      reviewer_id: userId,
    };
    if (options?.status) {
      where.status = options.status;
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.review_tasks.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.review_tasks.count({ where: where as any }),
    ]);

    return {
      items: rows.map(row => this.rowToReview(row)),
      total,
      offset,
      limit,
    };
  }

  async countPending(userId: string): Promise<number> {
    const [approvalCount, reviewCount] = await Promise.all([
      prisma.approval_requests.count({
        where: {
          status: 'pending',
          assigned_to: { contains: userId },
        } as any,
      }),
      prisma.review_tasks.count({
        where: {
          status: 'pending',
          reviewer_id: userId,
        },
      }),
    ]);
    return approvalCount + reviewCount;
  }

  private rowToApproval(row: any): ApprovalRequest {
    const meta = (row.metadata as Record<string, unknown>) ?? {};
    const assignedToList = (meta.assignedToList as string[]) ?? (row.assigned_to ? row.assigned_to.split(',') : []);
    const dueAt = meta.dueAt ? new Date(meta.dueAt as string) : null;
    const escalatedAt = meta.escalatedAt ? new Date(meta.escalatedAt as string) : null;

    const baseMetadata = { ...meta };
    delete baseMetadata.title;
    delete baseMetadata.description;
    delete baseMetadata.context;
    delete baseMetadata.dueAt;
    delete baseMetadata.escalatedAt;
    delete baseMetadata.escalationReason;
    delete baseMetadata.assignedToList;

    return ApprovalRequest.reconstitute(
      row.id,
      row.execution_id,
      row.step_id,
      row.status as any,
      row.requested_by,
      assignedToList,
      (meta.title as string) ?? '',
      (meta.description as string) ?? '',
      (meta.context as Record<string, unknown>) ?? {},
      dueAt,
      escalatedAt,
      (meta.escalationReason as string | null) ?? null,
      baseMetadata as any,
      row.created_at,
      row.updated_at,
    );
  }

  private rowToReview(row: any): ReviewTask {
    const meta = (row.metadata as Record<string, unknown>) ?? {};
    const baseMetadata = { ...meta };
    delete baseMetadata.instructions;
    delete baseMetadata.input;
    delete baseMetadata.output;

    return ReviewTask.reconstitute(
      row.id,
      row.execution_id,
      row.step_id,
      row.status as any,
      row.reviewer_id,
      (meta.instructions as string) ?? '',
      (meta.input as Record<string, unknown>) ?? {},
      (meta.output as Record<string, unknown> | null) ?? null,
      row.feedback,
      baseMetadata as any,
      row.created_at,
    );
  }
}
