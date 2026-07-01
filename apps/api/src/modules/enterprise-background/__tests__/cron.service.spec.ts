import { CronService } from '../application/services/cron.service.js';
import type { CronJob } from '../domain/types/background.types.js';

describe('CronService', () => {
  let service: CronService;

  beforeEach(() => {
    service = new CronService();
  });

  const makeJob = (overrides: Partial<CronJob> = {}): CronJob => ({
    id: 'test-cron-1',
    name: 'test-job',
    expression: '* * * * *',
    handler: 'TestHandler',
    enabled: true,
    timezone: 'UTC',
    nextExecution: new Date(Date.now() + 60000),
    ...overrides,
  });

  it('registers a cron job', async () => {
    await service.register(makeJob());
    const jobs = await service.list();
    expect(jobs).toHaveLength(1);
  });

  it('unregisters a cron job', async () => {
    await service.register(makeJob({ id: 'remove-me' }));
    await service.unregister('remove-me');
    const jobs = await service.list();
    expect(jobs).toHaveLength(0);
  });

  it('starts and stops without error', async () => {
    await expect(service.start()).resolves.not.toThrow();
    await expect(service.stop()).resolves.not.toThrow();
  });

  it('registers job with auto-generated id when not provided', async () => {
    const job = makeJob({ id: '' });
    await service.register({ ...job, id: '' });
    const jobs = await service.list();
    expect(jobs).toHaveLength(1);
  });

  it('returns empty list initially', async () => {
    const jobs = await service.list();
    expect(jobs).toEqual([]);
  });

  it('returns scheduled jobs', async () => {
    const scheduled = await service.getScheduledJobs();
    expect(scheduled).toEqual([]);
  });

  it('handles double stop gracefully', async () => {
    await service.start();
    await service.stop();
    await service.stop();
    const jobs = await service.list();
    expect(jobs).toEqual([]);
  });
});
