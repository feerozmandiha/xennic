import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Queue, Job } from 'bullmq';
import { QUEUE_NAMES } from './queue-names.js';

export interface PipelineJobData {
  documentId: string;
  workspaceId: string;
  stage: string;
  attempts?: number;
  metadata?: Record<string, unknown>;
}

export interface IntakeJobData extends PipelineJobData {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  documentType: string;
  createdBy?: string | null;
}

export interface ClassifyJobData extends PipelineJobData {
  text?: string;
  method?: string;
}

export interface ParseJobData extends PipelineJobData {
  method?: string;
  options?: Record<string, unknown>;
}

export interface NormalizeJobData extends PipelineJobData {
  sourceText?: string;
  language?: string;
}

export interface ChunkJobData extends PipelineJobData {
  chunkSize?: number;
  overlap?: number;
}

export interface EmbedJobData extends PipelineJobData {
  chunkIds?: string[];
}

export interface PublishJobData extends PipelineJobData {
  knowledgeId?: string;
}

@Injectable()
export class PipelineEventBus implements OnModuleInit, OnModuleDestroy {
  private queues: Map<string, Queue> = new Map();
  private queueSchedulers: Map<string, any> = new Map();

  constructor(private readonly moduleRef: ModuleRef) {}

  async onModuleInit() {
    const values = Object.values(QUEUE_NAMES).filter((name) => name !== QUEUE_NAMES.DEAD_LETTER);
    for (const name of values) {
      const bullmq = await import('bullmq');
      const Queue = bullmq.Queue;
      const ioredis = await import('ioredis');
      const Redis = ioredis.Redis;
      const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      const queue = new Queue(name, { connection: redis as any });
      this.queues.set(name, queue);
    }
  }

  onModuleDestroy() {
    for (const [, scheduler] of this.queueSchedulers) {
      void scheduler.close();
    }
    this.queues.clear();
    this.queueSchedulers.clear();
  }

  async enqueueIntake(data: IntakeJobData): Promise<Job<IntakeJobData>> {
    return this.queues.get(QUEUE_NAMES.INTAKE)!.add('intake', data, {
      jobId: `intake-${data.documentId}`,
      removeOnComplete: { count: 100, age: 86400 },
      removeOnFail: { count: 50, age: 604800 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  async enqueueClassify(data: ClassifyJobData): Promise<Job<ClassifyJobData>> {
    return this.queues.get(QUEUE_NAMES.CLASSIFY)!.add('classify', data, {
      jobId: `classify-${data.documentId}`,
      removeOnComplete: { count: 100, age: 86400 },
      removeOnFail: { count: 50, age: 604800 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async enqueueParse(data: ParseJobData): Promise<Job<ParseJobData>> {
    return this.queues.get(QUEUE_NAMES.PARSE)!.add('parse', data, {
      jobId: `parse-${data.documentId}`,
      removeOnComplete: { count: 100, age: 86400 },
      removeOnFail: { count: 50, age: 604800 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  async enqueueNormalize(data: NormalizeJobData): Promise<Job<NormalizeJobData>> {
    return this.queues.get(QUEUE_NAMES.NORMALIZE)!.add('normalize', data, {
      jobId: `normalize-${data.documentId}`,
      removeOnComplete: { count: 100, age: 86400 },
      removeOnFail: { count: 50, age: 604800 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async enqueueChunk(data: ChunkJobData): Promise<Job<ChunkJobData>> {
    return this.queues.get(QUEUE_NAMES.CHUNK)!.add('chunk', data, {
      jobId: `chunk-${data.documentId}`,
      removeOnComplete: { count: 100, age: 86400 },
      removeOnFail: { count: 50, age: 604800 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async enqueueEmbed(data: EmbedJobData): Promise<Job<EmbedJobData>> {
    return this.queues.get(QUEUE_NAMES.EMBED)!.add('embed', data, {
      jobId: `embed-${data.documentId}`,
      removeOnComplete: { count: 100, age: 86400 },
      removeOnFail: { count: 50, age: 604800 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  async enqueuePublish(data: PublishJobData): Promise<Job<PublishJobData>> {
    return this.queues.get(QUEUE_NAMES.PUBLISH)!.add('publish', data, {
      jobId: `publish-${data.documentId}`,
      removeOnComplete: { count: 100, age: 86400 },
      removeOnFail: { count: 50, age: 604800 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async moveToDeadLetter(queueName: string, jobId: string, reason: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) return;
    const job = await queue.getJob(jobId);
    if (!job) return;
    const dlq = this.queues.get(QUEUE_NAMES.DEAD_LETTER);
    if (!dlq) return;
    await dlq.add(
      'dlq',
      { ...job.data, deadLetterReason: reason, originalQueue: queueName, originalJobId: jobId },
      {
        jobId: `dlq-${queueName}-${jobId}`,
        removeOnComplete: false,
        removeOnFail: false,
      },
    );
  }
}
