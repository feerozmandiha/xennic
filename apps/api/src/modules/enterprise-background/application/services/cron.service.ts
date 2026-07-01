import { Injectable, Logger } from '@nestjs/common';
import type { ICronService } from '../../domain/interfaces/background-interfaces.js';
import type { CronJob, JobSchedule } from '../../domain/types/background.types.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class CronService implements ICronService {
  private readonly logger = new Logger(CronService.name);
  private cronJobs = new Map<string, CronJob>();
  private intervals = new Map<string, NodeJS.Timeout>();
  private running = false;

  async start(): Promise<void> {
    this.running = true;
    for (const job of this.cronJobs.values()) {
      if (job.enabled) this.scheduleCronJob(job);
    }
    this.logger.log('Cron service started');
  }

  async stop(): Promise<void> {
    this.running = false;
    for (const interval of this.intervals.values()) clearInterval(interval);
    this.intervals.clear();
    this.logger.log('Cron service stopped');
  }

  async register(job: CronJob): Promise<void> {
    const id = job.id || randomUUID();
    const cronJob: CronJob = { ...job, id, nextExecution: new Date(Date.now() + 60000) };
    this.cronJobs.set(id, cronJob);
    if (this.running && job.enabled) this.scheduleCronJob(cronJob);
  }

  async unregister(id: string): Promise<void> {
    const interval = this.intervals.get(id);
    if (interval) { clearInterval(interval); this.intervals.delete(id); }
    this.cronJobs.delete(id);
  }

  async list(): Promise<CronJob[]> {
    return Array.from(this.cronJobs.values());
  }

  async getScheduledJobs(): Promise<JobSchedule[]> {
    return [];
  }

  private scheduleCronJob(job: CronJob): void {
    const ms = this.cronToMs(job.expression);
    const interval = setInterval(() => {
      job.lastExecution = new Date();
      this.logger.debug(`Cron job executed: ${job.id} (${job.name})`);
    }, ms);
    this.intervals.set(job.id, interval);
  }

  private cronToMs(expression: string): number {
    const parts = expression.split(/\s+/);
    if (parts.length < 5) return 60000;
    const minute = parts[0] ?? '*';
    if (minute === '*') return 60000;
    const m = parseInt(minute, 10);
    return isNaN(m) ? 60000 : m * 60000;
  }
}
