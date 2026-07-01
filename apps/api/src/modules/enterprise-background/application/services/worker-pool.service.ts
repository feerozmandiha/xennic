import { Injectable, Logger } from '@nestjs/common';
import type { IWorkerPool } from '../../domain/interfaces/background-interfaces.js';
import type { WorkerPoolConfig, Job, DeadLetterRecord } from '../../domain/types/background.types.js';
import { JobStatus } from '../../domain/types/background.types.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class WorkerPoolService implements IWorkerPool {
  private readonly logger = new Logger(WorkerPoolService.name);
  private pools = new Map<string, { config: WorkerPoolConfig; running: number; queued: number; completed: number; failed: number }>();
  private queues = new Map<string, Job[]>();
  private deadLetters: DeadLetterRecord[] = [];

  async start(config: WorkerPoolConfig): Promise<void> {
    this.pools.set(config.name, { config, running: 0, queued: 0, completed: 0, failed: 0 });
    this.queues.set(config.name, []);
    this.logger.log(`Worker pool started: ${config.name}`);
  }

  async stop(name?: string): Promise<void> {
    if (name) { this.pools.delete(name); this.queues.delete(name); }
    else { this.pools.clear(); this.queues.clear(); }
  }

  async pause(name: string): Promise<void> {
    const pool = this.pools.get(name);
    if (!pool) throw new Error(`Pool not found: ${name}`);
    this.logger.log(`Worker pool paused: ${name}`);
  }

  async resume(name: string): Promise<void> {
    const pool = this.pools.get(name);
    if (!pool) throw new Error(`Pool not found: ${name}`);
    this.logger.log(`Worker pool resumed: ${name}`);
  }

  async getStatus(): Promise<Record<string, { running: number; queued: number; completed: number; failed: number }>> {
    const result: Record<string, { running: number; queued: number; completed: number; failed: number }> = {};
    for (const [name, pool] of this.pools) {
      result[name] = { running: pool.running, queued: pool.queued, completed: pool.completed, failed: pool.failed };
    }
    return result;
  }

  async getDeadLetters(): Promise<DeadLetterRecord[]> {
    return this.deadLetters;
  }

  async requeueDeadLetter(id: string): Promise<void> {
    const idx = this.deadLetters.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error(`Dead letter not found: ${id}`);
    const dl = this.deadLetters[idx]!;
    const job: Job = {
      id: randomUUID(), type: dl.jobType, payload: dl.payload,
      priority: 1, status: JobStatus.PENDING,
      attempts: 0, maxAttempts: 3, retryDelay: 1000, createdAt: new Date(),
    };
    this.queues.get(dl.jobType)?.push(job!);
    this.deadLetters.splice(idx, 1);
  }
}
