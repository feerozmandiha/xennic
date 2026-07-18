import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { PaginatedResult } from '../../shared/types/index.js';
import { ApprovalRequest } from '../domain/approval-request.entity.js';
import type { IHitlRepository, FindApprovalOptions } from '../domain/hitl-repository.interface.js';

export interface RequestApprovalData {
  executionId: string;
  stepId: string;
  requestedBy: string;
  assignedTo: string[];
  title: string;
  description: string;
  context?: Record<string, unknown>;
  dueAt?: Date | null;
}

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(
    @Inject('IHitlRepository')
    private readonly repository: IHitlRepository,
  ) {}

  async request(data: RequestApprovalData): Promise<ApprovalRequest> {
    const entity = ApprovalRequest.create({
      executionId: data.executionId,
      stepId: data.stepId,
      requestedBy: data.requestedBy,
      assignedTo: data.assignedTo,
      title: data.title,
      description: data.description,
      context: data.context,
      dueAt: data.dueAt,
    });

    await this.repository.saveApproval(entity);
    this.logger.log(`Approval request created: ${entity.id}`);
    return entity;
  }

  async approve(id: string, userId: string, comment?: string): Promise<ApprovalRequest> {
    const entity = await this.getApprovalOrThrow(id);

    if (entity.status !== 'pending') {
      throw new BadRequestException(`Approval ${id} is not in pending state`);
    }

    entity.approve(userId, comment);
    await this.repository.saveApproval(entity);
    this.logger.log(`Approval ${id} approved by ${userId}`);
    return entity;
  }

  async reject(
    id: string,
    userId: string,
    reason: string,
    comment?: string,
  ): Promise<ApprovalRequest> {
    if (!reason) {
      throw new BadRequestException('Reason is required for rejection');
    }

    const entity = await this.getApprovalOrThrow(id);

    if (entity.status !== 'pending') {
      throw new BadRequestException(`Approval ${id} is not in pending state`);
    }

    entity.reject(userId, reason, comment);
    await this.repository.saveApproval(entity);
    this.logger.log(`Approval ${id} rejected by ${userId}: ${reason}`);
    return entity;
  }

  async escalate(id: string, reason: string): Promise<ApprovalRequest> {
    const entity = await this.getApprovalOrThrow(id);

    if (entity.status !== 'pending') {
      throw new BadRequestException(`Approval ${id} is not in pending state`);
    }

    entity.status = 'escalated';
    entity.escalatedAt = new Date();
    entity.escalationReason = reason;
    entity.updatedAt = new Date();

    await this.repository.saveApproval(entity);
    this.logger.log(`Approval ${id} escalated: ${reason}`);
    return entity;
  }

  async getStatus(id: string): Promise<ApprovalRequest> {
    return this.getApprovalOrThrow(id);
  }

  async getPendingApprovals(
    userId: string,
    options?: FindApprovalOptions,
  ): Promise<PaginatedResult<ApprovalRequest>> {
    return this.repository.findPendingApprovals(userId, options);
  }

  async checkAndRoute(
    executionId: string,
    stepId: string,
  ): Promise<'approved' | 'rejected' | 'pending' | 'escalated'> {
    const result = await this.repository.findApprovals(executionId, { status: undefined });

    const matching = result.items.find((a) => a.stepId === stepId && a.executionId === executionId);

    if (!matching) {
      return 'pending';
    }

    return matching.status;
  }

  private async getApprovalOrThrow(id: string): Promise<ApprovalRequest> {
    const entity = await this.repository.getApproval(id);
    if (!entity) {
      throw new NotFoundException(`Approval request ${id} not found`);
    }
    return entity;
  }
}
