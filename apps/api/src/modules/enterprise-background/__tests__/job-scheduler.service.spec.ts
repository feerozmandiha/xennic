import { JobSchedulerService } from '../application/services/job-scheduler.service.js';
import { JobStatus, JobPriority } from '../domain/types/background.types.js';

describe('JobSchedulerService', () => {
  let service: JobSchedulerService;

  beforeEach(() => {
    service = new JobSchedulerService();
  });

  it('schedules a job and returns id', async () => {
    const id = await service.schedule('send-email', { to: 'user@test.com' });
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('returns pending status for new job', async () => {
    const id = await service.schedule('compute', { x: 1 });
    const status = await service.getStatus(id);
    expect(status).toBe(JobStatus.PENDING);
  });

  it('cancels a pending job', async () => {
    const id = await service.schedule('task', {});
    await service.cancel(id);
    expect(await service.getStatus(id)).toBe(JobStatus.CANCELLED);
  });

  it('throws on cancelling running job', async () => {
    const id = await service.schedule('task', {});
    // Manually set to running
    const job = await service.getJob(id);
    if (job) Object.assign(job, { status: JobStatus.RUNNING });
    await expect(service.cancel(id)).rejects.toThrow('Cannot cancel running job');
  });

  it('throws on cancelling unknown job', async () => {
    await expect(service.cancel('nonexistent')).rejects.toThrow('Job not found');
  });

  it('returns null for unknown job status', async () => {
    expect(await service.getStatus('unknown')).toBeNull();
  });

  it('returns null for unknown job', async () => {
    expect(await service.getJob('unknown')).toBeNull();
  });

  it('gets a specific job', async () => {
    const id = await service.schedule('test', { data: 42 });
    const job = await service.getJob(id);
    expect(job).not.toBeNull();
    expect(job!.type).toBe('test');
    expect(job!.payload).toEqual({ data: 42 });
  });

  it('lists jobs with filters', async () => {
    await service.schedule('type-a', {});
    await service.schedule('type-b', {});
    const result = await service.list({ type: 'type-a' });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('lists jobs with status filter', async () => {
    const id = await service.schedule('task', {});
    await service.cancel(id);
    const result = await service.list({ status: JobStatus.CANCELLED });
    expect(result.items).toHaveLength(1);
  });

  it('lists jobs with pagination', async () => {
    for (let i = 0; i < 5; i++) await service.schedule('task', { i });
    const result = await service.list({ page: 1, limit: 2 });
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(5);
  });

  it('retries a failed job', async () => {
    const id = await service.schedule('task', {});
    await service.retry(id);
    const list = await service.list({});
    expect(list.items.length).toBeGreaterThanOrEqual(2);
  });

  it('uses default priority NORMAL', async () => {
    const id = await service.schedule('task', {});
    const job = await service.getJob(id);
    expect(job!.priority).toBe(JobPriority.NORMAL);
  });

  it('accepts custom priority', async () => {
    const id = await service.schedule('urgent', {}, JobPriority.CRITICAL);
    const job = await service.getJob(id);
    expect(job!.priority).toBe(JobPriority.CRITICAL);
  });

  it('schedules recurring job', async () => {
    const id = await service.scheduleRecurring('daily-report', 'report-gen', '0 6 * * *', { format: 'pdf' });
    expect(id).toBeDefined();
  });

  it('lists jobs returns empty array when none', async () => {
    const result = await service.list({});
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
