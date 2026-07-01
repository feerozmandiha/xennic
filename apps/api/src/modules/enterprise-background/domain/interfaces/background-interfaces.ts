import type { Job, JobSchedule, JobPriority, JobStatus, CronJob, WorkerPoolConfig, JobResult, DeadLetterRecord } from '../types/background.types.js';

export interface IJobScheduler {
  schedule(jobType: string, payload: Record<string, unknown>, priority?: JobPriority, delayMs?: number): Promise<string>;
  scheduleRecurring(name: string, jobType: string, cron: string, payload: Record<string, unknown>, priority?: JobPriority): Promise<string>;
  cancel(jobId: string): Promise<void>;
  getStatus(jobId: string): Promise<JobStatus | null>;
  getJob(jobId: string): Promise<Job | null>;
  list(filters?: { status?: JobStatus; type?: string; page?: number; limit?: number }): Promise<{ items: Job[]; total: number }>;
  retry(jobId: string): Promise<void>;
}

export interface ICronService {
  start(): Promise<void>;
  stop(): Promise<void>;
  register(job: CronJob): Promise<void>;
  unregister(id: string): Promise<void>;
  list(): Promise<CronJob[]>;
  getScheduledJobs(): Promise<JobSchedule[]>;
}

export interface IWorkerPool {
  start(config: WorkerPoolConfig): Promise<void>;
  stop(name?: string): Promise<void>;
  pause(name: string): Promise<void>;
  resume(name: string): Promise<void>;
  getStatus(): Promise<Record<string, { running: number; queued: number; completed: number; failed: number }>>;
  getDeadLetters(): Promise<DeadLetterRecord[]>;
  requeueDeadLetter(id: string): Promise<void>;
}

export interface IJobHandler {
  canHandle(jobType: string): boolean;
  execute(job: Job): Promise<JobResult>;
}
