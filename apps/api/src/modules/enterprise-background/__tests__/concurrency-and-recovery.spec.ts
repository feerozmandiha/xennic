import { JobSchedulerService } from '../application/services/job-scheduler.service.js';
import { WorkerPoolService } from '../application/services/worker-pool.service.js';
import { CronService } from '../application/services/cron.service.js';
import { JobPriority, JobStatus } from '../domain/types/background.types.js';

describe('Background - Concurrency & Recovery', () => {
  describe('JobSchedulerService concurrency', () => {
    let service: JobSchedulerService;

    beforeEach(() => { service = new JobSchedulerService(); });

    it('handles many concurrent schedules', async () => {
      const ids = await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          service.schedule(`type-${i % 5}`, { index: i }),
        ),
      );
      expect(ids).toHaveLength(50);
      ids.forEach((id) => expect(id).toBeDefined());
    });

    it('handles concurrent cancel and retry', async () => {
      const id = await service.schedule('test', {});
      await Promise.all([
        service.cancel(id).catch(() => {}),
        service.retry(id).catch(() => {}),
      ]);
      const status = await service.getStatus(id);
      expect([JobStatus.CANCELLED, JobStatus.PENDING]).toContain(status);
    });

    it('lists jobs across many types', async () => {
      await Promise.all(
        Array.from({ length: 20 }, (_, i) =>
          service.schedule(`type-${i % 4}`, { i }),
        ),
      );
      const result = await service.list({ type: 'type-0' });
      expect(result.total).toBeGreaterThanOrEqual(4);
    });

    it('handles high priority jobs correctly', async () => {
      const ids = await Promise.all([
        service.schedule('low', {}, JobPriority.LOW),
        service.schedule('high', {}, JobPriority.HIGH),
        service.schedule('critical', {}, JobPriority.CRITICAL),
      ]);
      expect(ids).toHaveLength(3);
      const jobs = await Promise.all(ids.map((id) => service.getJob(id)));
      expect(jobs[0]!.priority).toBe(JobPriority.LOW);
      expect(jobs[1]!.priority).toBe(JobPriority.HIGH);
      expect(jobs[2]!.priority).toBe(JobPriority.CRITICAL);
    });
  });

  describe('WorkerPoolService edge cases', () => {
    let service: WorkerPoolService;

    beforeEach(() => { service = new WorkerPoolService(); });

    it('handles multiple pools concurrently', async () => {
      await Promise.all([
        service.start({ name: 'pool-1', concurrency: 2, jobTypes: ['a'], maxRetries: 3, retryDelay: 1000, deadLetterExchange: 'dlx1', prefetch: 1 }),
        service.start({ name: 'pool-2', concurrency: 4, jobTypes: ['b'], maxRetries: 2, retryDelay: 500, deadLetterExchange: 'dlx2', prefetch: 2 }),
      ]);
      const status = await service.getStatus();
      expect(Object.keys(status)).toHaveLength(2);
    });

    it('stop on non-existent pool is harmless', async () => {
      await expect(service.stop('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('CronService edge cases', () => {
    let service: CronService;

    beforeEach(() => { service = new CronService(); });

    it('register without starting does not crash', async () => {
      const id = 'cron-edge';
      await service.register({ id, name: 'test', expression: '5 * * * *', handler: 'H', enabled: true, timezone: 'UTC', nextExecution: new Date() });
      const jobs = await service.list();
      expect(jobs).toHaveLength(1);
    });

    it('stop without start does not crash', async () => {
      await expect(service.stop()).resolves.not.toThrow();
    });

    it('start and stop with registered jobs', async () => {
      await service.register({ id: 'cj1', name: 'job1', expression: '* * * * *', handler: 'H1', enabled: true, timezone: 'UTC', nextExecution: new Date() });
      await service.start();
      await service.stop();
      const jobs = await service.list();
      expect(jobs).toHaveLength(1);
    });
  });
});
