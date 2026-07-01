import { WorkerPoolService } from '../application/services/worker-pool.service.js';
import type { WorkerPoolConfig } from '../domain/types/background.types.js';

describe('WorkerPoolService', () => {
  let service: WorkerPoolService;

  const makeConfig = (name = 'default'): WorkerPoolConfig => ({
    name, concurrency: 2, jobTypes: ['email', 'report'],
    maxRetries: 3, retryDelay: 1000, deadLetterExchange: 'dlx',
    prefetch: 1,
  });

  beforeEach(() => {
    service = new WorkerPoolService();
  });

  it('starts a worker pool', async () => {
    await expect(service.start(makeConfig())).resolves.not.toThrow();
  });

  it('returns status after start', async () => {
    await service.start(makeConfig('pool-1'));
    const status = await service.getStatus();
    expect(status['pool-1']).toBeDefined();
    expect(status['pool-1'].running).toBe(0);
    expect(status['pool-1'].queued).toBe(0);
  });

  it('stops a named pool', async () => {
    await service.start(makeConfig('pool-a'));
    await service.stop('pool-a');
    const status = await service.getStatus();
    expect(status['pool-a']).toBeUndefined();
  });

  it('stops all pools', async () => {
    await service.start(makeConfig('x'));
    await service.start(makeConfig('y'));
    await service.stop();
    expect(await service.getStatus()).toEqual({});
  });

  it('pauses and resumes a pool', async () => {
    await service.start(makeConfig('pool'));
    await expect(service.pause('pool')).resolves.not.toThrow();
    await expect(service.resume('pool')).resolves.not.toThrow();
  });

  it('throws on pause for unknown pool', async () => {
    await expect(service.pause('unknown')).rejects.toThrow('Pool not found');
  });

  it('returns empty dead letters initially', async () => {
    expect(await service.getDeadLetters()).toEqual([]);
  });

  it('throws requeue for unknown dead letter', async () => {
    await expect(service.requeueDeadLetter('unknown')).rejects.toThrow('Dead letter not found');
  });

  it('handles requeue of dead letter', async () => {
    await service.start(makeConfig('pool-dlq'));
    // Simulate by adding to dead letters directly via type assertion
    const dl = { id: 'dl-1', originalJobId: 'job-1', jobType: 'email', payload: {}, error: 'timeout', attempts: 3, failedAt: new Date(), reason: 'timeout' };
    (service as any).deadLetters.push(dl);
    await service.requeueDeadLetter('dl-1');
    expect((await service.getDeadLetters())).toHaveLength(0);
  });
});
