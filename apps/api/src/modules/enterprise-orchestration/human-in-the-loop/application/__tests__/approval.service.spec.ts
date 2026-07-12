import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalService } from '../approval.service.js';
import { InMemoryHitlRepository } from '../../testing/adapters/in-memory-hitl-repository.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ApprovalService', () => {
  let service: ApprovalService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalService,
        { provide: 'IHitlRepository', useClass: InMemoryHitlRepository },
      ],
    }).compile();

    service = module.get(ApprovalService);
  });

  describe('request', () => {
    it('should create an approval request', async () => {
      const result = await service.request({
        executionId: 'exec-1',
        stepId: 'step-1',
        requestedBy: 'user-1',
        assignedTo: ['approver-1', 'approver-2'],
        title: 'Approve deployment',
        description: 'Please approve the production deployment',
      });

      expect(result.id).toBeDefined();
      expect(result.status).toBe('pending');
      expect(result.executionId).toBe('exec-1');
      expect(result.assignedTo).toEqual(['approver-1', 'approver-2']);
    });
  });

  describe('approve', () => {
    it('should approve a pending request', async () => {
      const req = await service.request({
        executionId: 'exec-1',
        stepId: 'step-1',
        requestedBy: 'user-1',
        assignedTo: ['approver-1'],
        title: 'Approve',
        description: 'Test',
      });

      const approved = await service.approve(req.id, 'approver-1');
      expect(approved.status).toBe('approved');
    });

    it('should throw when approving a non-pending request', async () => {
      const req = await service.request({
        executionId: 'exec-1',
        stepId: 'step-1',
        requestedBy: 'user-1',
        assignedTo: ['approver-1'],
        title: 'Approve',
        description: 'Test',
      });

      await service.approve(req.id, 'approver-1');
      await expect(service.approve(req.id, 'approver-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw when approval not found', async () => {
      await expect(service.approve('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('reject', () => {
    it('should reject a pending request', async () => {
      const req = await service.request({
        executionId: 'exec-1',
        stepId: 'step-1',
        requestedBy: 'user-1',
        assignedTo: ['approver-1'],
        title: 'Reject test',
        description: 'Test',
      });

      const rejected = await service.reject(req.id, 'approver-1', 'Not ready');
      expect(rejected.status).toBe('rejected');
    });

    it('should throw when reason is empty', async () => {
      const req = await service.request({
        executionId: 'exec-1',
        stepId: 'step-1',
        requestedBy: 'user-1',
        assignedTo: ['approver-1'],
        title: 'Reject test',
        description: 'Test',
      });

      await expect(service.reject(req.id, 'approver-1', '')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPendingApprovals', () => {
    it('should return pending approvals for a user', async () => {
      await service.request({
        executionId: 'exec-1',
        stepId: 'step-1',
        requestedBy: 'user-1',
        assignedTo: ['approver-1'],
        title: 'First',
        description: 'Test',
      });

      await service.request({
        executionId: 'exec-2',
        stepId: 'step-1',
        requestedBy: 'user-2',
        assignedTo: ['approver-1'],
        title: 'Second',
        description: 'Test',
      });

      const pending = await service.getPendingApprovals('approver-1');
      expect(pending.total).toBe(2);
      expect(pending.items).toHaveLength(2);
    });

    it('should not return approved requests', async () => {
      const req = await service.request({
        executionId: 'exec-1',
        stepId: 'step-1',
        requestedBy: 'user-1',
        assignedTo: ['approver-1'],
        title: 'Test',
        description: 'Test',
      });

      await service.approve(req.id, 'approver-1');
      const pending = await service.getPendingApprovals('approver-1');
      expect(pending.total).toBe(0);
    });
  });

  describe('escalate', () => {
    it('should escalate a pending request', async () => {
      const req = await service.request({
        executionId: 'exec-1',
        stepId: 'step-1',
        requestedBy: 'user-1',
        assignedTo: ['approver-1'],
        title: 'Escalate test',
        description: 'Test',
      });

      const escalated = await service.escalate(req.id, 'Approver unreachable');
      expect(escalated.status).toBe('escalated');
      expect(escalated.escalationReason).toBe('Approver unreachable');
      expect(escalated.escalatedAt).toBeInstanceOf(Date);
    });

    it('should throw when escalating a non-pending request', async () => {
      const req = await service.request({
        executionId: 'exec-1',
        stepId: 'step-1',
        requestedBy: 'user-1',
        assignedTo: ['approver-1'],
        title: 'Test',
        description: 'Test',
      });

      await service.approve(req.id, 'approver-1');
      await expect(service.escalate(req.id, 'Too late')).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkAndRoute', () => {
    it('should return pending when no matching approval exists', async () => {
      const status = await service.checkAndRoute('exec-1', 'step-1');
      expect(status).toBe('pending');
    });

    it('should return the approval status for matching step', async () => {
      const req = await service.request({
        executionId: 'exec-1',
        stepId: 'step-1',
        requestedBy: 'user-1',
        assignedTo: ['approver-1'],
        title: 'Test',
        description: 'Test',
      });

      await service.approve(req.id, 'approver-1');
      const status = await service.checkAndRoute('exec-1', 'step-1');
      expect(status).toBe('approved');
    });
  });
});
