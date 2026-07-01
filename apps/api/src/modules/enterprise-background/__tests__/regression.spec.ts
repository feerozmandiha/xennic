/**
 * Regression tests for background module
 */
import { JobSchedulerService } from '../application/services/job-scheduler.service.js';
import { CronService } from '../application/services/cron.service.js';

describe('Background - Regression contracts', () => {
  it('schedule returns a string', async () => {
    const service = new JobSchedulerService();
    const id = await service.schedule('test', {});
    expect(typeof id).toBe('string');
  });

  it('list returns correct shape', async () => {
    const service = new JobSchedulerService();
    const result = await service.list({});
    expect(result).toMatchObject({ items: expect.any(Array), total: expect.any(Number) });
  });

  it('cron list returns array', async () => {
    const service = new CronService();
    const jobs = await service.list();
    expect(Array.isArray(jobs)).toBe(true);
  });
});
