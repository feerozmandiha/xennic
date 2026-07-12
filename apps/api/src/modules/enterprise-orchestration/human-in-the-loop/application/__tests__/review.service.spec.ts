import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from '../review.service.js';
import { InMemoryHitlRepository } from '../../testing/adapters/in-memory-hitl-repository.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReviewService', () => {
  let service: ReviewService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewService, { provide: 'IHitlRepository', useClass: InMemoryHitlRepository }],
    }).compile();

    service = module.get(ReviewService);
  });

  describe('assign', () => {
    it('should assign a review task', async () => {
      const task = await service.assign(
        'exec-1',
        'step-1',
        'reviewer-1',
        'Review the output carefully',
        { data: 'test input' },
      );

      expect(task.id).toBeDefined();
      expect(task.status).toBe('pending');
      expect(task.assignedTo).toBe('reviewer-1');
      expect(task.instructions).toBe('Review the output carefully');
      expect(task.input).toEqual({ data: 'test input' });
    });
  });

  describe('complete', () => {
    it('should complete a review task', async () => {
      const task = await service.assign('exec-1', 'step-1', 'reviewer-1', 'Review output', {
        data: 'test',
      });

      const completed = await service.complete(task.id, { approved: true }, 'Looks good');
      expect(completed.status).toBe('completed');
      expect(completed.output).toEqual({ approved: true });
      expect(completed.feedback).toBe('Looks good');
    });

    it('should complete without feedback', async () => {
      const task = await service.assign('exec-1', 'step-1', 'reviewer-1', 'Review output', {
        data: 'test',
      });

      const completed = await service.complete(task.id, { approved: true });
      expect(completed.status).toBe('completed');
      expect(completed.feedback).toBeNull();
    });

    it('should throw when completing a non-pending review', async () => {
      const task = await service.assign('exec-1', 'step-1', 'reviewer-1', 'Review output', {
        data: 'test',
      });

      await service.complete(task.id, { approved: true });
      await expect(service.complete(task.id, { approved: false })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw when review not found', async () => {
      await expect(service.complete('nonexistent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('fail', () => {
    it('should fail a review task', async () => {
      const task = await service.assign('exec-1', 'step-1', 'reviewer-1', 'Review output', {
        data: 'test',
      });

      const failed = await service.fail(task.id, 'Quality standards not met');
      expect(failed.status).toBe('failed');
      expect(failed.feedback).toBe('Quality standards not met');
    });

    it('should throw when reason is empty', async () => {
      const task = await service.assign('exec-1', 'step-1', 'reviewer-1', 'Review output', {
        data: 'test',
      });

      await expect(service.fail(task.id, '')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPendingReviews', () => {
    it('should return pending reviews for a user', async () => {
      await service.assign('exec-1', 'step-1', 'reviewer-1', 'Review 1', {});
      await service.assign('exec-2', 'step-1', 'reviewer-1', 'Review 2', {});

      const pending = await service.getPendingReviews('reviewer-1');
      expect(pending.total).toBe(2);
    });

    it('should not return completed reviews', async () => {
      const task = await service.assign('exec-1', 'step-1', 'reviewer-1', 'Review 1', {});
      await service.complete(task.id, {});

      const pending = await service.getPendingReviews('reviewer-1');
      expect(pending.total).toBe(0);
    });
  });

  describe('getByExecution', () => {
    it('should return all reviews for an execution', async () => {
      await service.assign('exec-1', 'step-1', 'reviewer-1', 'Review 1', {});
      await service.assign('exec-1', 'step-2', 'reviewer-2', 'Review 2', {});
      await service.assign('exec-2', 'step-1', 'reviewer-1', 'Review 3', {});

      const reviews = await service.getByExecution('exec-1');
      expect(reviews.total).toBe(2);
    });
  });
});
