import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IJobScheduler } from '../../domain/interfaces/background-interfaces.js';
import type { Job, JobSchedule } from '../../domain/types/background.types.js';
import { JobStatus, JobPriority } from '../../domain/types/background.types.js';

@Injectable()
export class JobSchedulerService implements IJobScheduler {
  private readonly logger = new Logger(JobSchedulerService.name);
  private jobs = new Map<string, Job>();
  private schedules = new Map<string, JobSchedule>();

  async schedule(jobType: string, payload: Record<string, unknown>, priority?: JobPriority, delayMs?: number): Promise<string> {
    const id = randomUUID();
    const job: Job = {
      id, type: jobType, payload,
      priority: priority ?? JobPriority.NORMAL,
      status: JobStatus.PENDING,
      attempts: 0, maxAttempts: 3, retryDelay: delayMs ?? 1000,
      createdAt: new Date(),
    };
    this.jobs.set(id, job);
    this.logger.debug(`Job scheduled: ${id} (${jobType})`);
    return id;
  }

  async scheduleRecurring(name: string, jobType: string, cron: string, payload: Record<string, unknown>, priority?: JobPriority): Promise<string> {
    const id = randomUUID();
    const schedule: JobSchedule = {
      id, name, jobType, cron, payload,
      priority: priority ?? JobPriority.NORMAL, enabled: true,
      nextRun: new Date(Date.now() + 60000), createdAt: new Date(),
    };
    this.schedules.set(id, schedule);
    this.logger.debug(`Recurring job scheduled: ${id} (${name})`);
    return id;
  }

  async cancel(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);
    if (job.status === JobStatus.RUNNING) throw new Error(`Cannot cancel running job: ${jobId}`);
    job.status = JobStatus.CANCELLED;
    this.logger.log(`Job cancelled: ${jobId}`);
  }

  async getStatus(jobId: string): Promise<JobStatus | null> {
    return this.jobs.get(jobId)?.status ?? null;
  }

  async getJob(jobId: string): Promise<Job | null> {
    return this.jobs.get(jobId) ?? null;
  }

  async list(filters?: { status?: JobStatus; type?: string; page?: number; limit?: number }): Promise<{ items: Job[]; total: number }> {
    let items = Array.from(this.jobs.values());
    if (filters?.status) items = items.filter((j) => j.status === filters.status);
    if (filters?.type) items = items.filter((j) => j.type === filters.type);
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const total = items.length;
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const start = (page - 1) * limit;
    return { items: items.slice(start, start + limit), total };
  }

  async retry(jobId: string): Promise<void> {
    const original = this.jobs.get(jobId);
    if (!original) throw new Error(`Job not found: ${jobId}`);
    const retryJob: Job = {
      ...original,
      id: randomUUID(),
      status: JobStatus.PENDING,
      attempts: original.attempts + 1,
      createdAt: new Date(),
    };
    this.jobs.set(retryJob.id, retryJob);
    this.logger.log(`Job retry created: ${retryJob.id} (original: ${jobId})`);
  }
}
