import { Injectable, Logger, Inject } from '@nestjs/common';
import { KnowledgeDocumentRepository } from '../../infrastructure/repositories/knowledge-document.repository.js';
import { PipelineEventBus } from '../../infrastructure/queues/pipeline-event-bus.js';
import { QUEUE_NAMES } from '../../infrastructure/queues/queue-names.js';
import type { DocumentStatus } from '../../domain/value-objects/document-status.vo.js';

export interface KnowledgeFactoryMetrics {
  documentsUploaded: number;
  documentsProcessed: number;
  documentsFailed: number;
  pipelineRunsTotal: number;
  pipelineRunsFailed: number;
  chunksCreated: number;
  embeddingsGenerated: number;
  queueDepths: Record<string, number>;
  avgPipelineDurationMs: number;
}

@Injectable()
export class KnowledgeFactoryMetricsService {
  private readonly logger = new Logger(KnowledgeFactoryMetricsService.name);

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    private readonly documentRepository: KnowledgeDocumentRepository,
    @Inject('PipelineEventBus')
    private readonly eventBus: PipelineEventBus,
  ) {}

  async getMetrics(): Promise<KnowledgeFactoryMetrics> {
    const documentsUploaded = await this.documentRepository.countByStatus(
      '',
      'uploaded' as DocumentStatus,
    );
    const documentsProcessed = await this.documentRepository.countByStatus(
      '',
      'published' as DocumentStatus,
    );
    const documentsFailed = await this.documentRepository.countByStatus(
      '',
      'failed' as DocumentStatus,
    );

    const queueDepths: Record<string, number> = {};
    const queueNames = Object.values(QUEUE_NAMES).filter(
      (name) => name !== QUEUE_NAMES.DEAD_LETTER,
    );
    for (const queueName of queueNames) {
      try {
        const queue = (this.eventBus as any)?.queues?.get(queueName);
        if (queue) {
          const count = await queue.getJobCounts('waiting', 'active', 'delayed');
          queueDepths[queueName] =
            (count.waiting || 0) + (count.active || 0) + (count.delayed || 0);
        }
      } catch {
        queueDepths[queueName] = 0;
      }
    }

    return {
      documentsUploaded,
      documentsProcessed,
      documentsFailed,
      pipelineRunsTotal: documentsProcessed + documentsFailed,
      pipelineRunsFailed: documentsFailed,
      chunksCreated: 0,
      embeddingsGenerated: 0,
      queueDepths,
      avgPipelineDurationMs: 0,
    };
  }

  async getHealthStatus(): Promise<{ status: string; checks: Record<string, boolean> }> {
    const checks: Record<string, boolean> = {
      database: true,
      redis: true,
      queues: true,
      workers: true,
    };

    try {
      const metrics = await this.getMetrics();
      const depths = Object.values(metrics.queueDepths) as number[];
      const maxQueueDepth = depths.length > 0 ? Math.max(...depths) : 0;
      checks.queues = maxQueueDepth < 1000;
    } catch {
      checks.queues = false;
    }

    const allHealthy = Object.values(checks).every((v) => v);
    return {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
    };
  }
}
