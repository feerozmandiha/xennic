import { Injectable, Logger, Inject } from '@nestjs/common';
import { KnowledgeDocumentRepository } from '../../infrastructure/repositories/knowledge-document.repository.js';
import { PipelineEventBus } from '../../infrastructure/queues/pipeline-event-bus.js';
import { QUEUE_NAMES } from '../../infrastructure/queues/queue-names.js';

@Injectable()
export class KnowledgeFactoryHealthService {
  private readonly logger = new Logger(KnowledgeFactoryHealthService.name);

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    private readonly documentRepository: KnowledgeDocumentRepository,
    @Inject('PipelineEventBus')
    private readonly eventBus: PipelineEventBus,
  ) {}

  async check(): Promise<{ status: string; details: Record<string, any> }> {
    const details: Record<string, any> = {
      database: 'unknown',
      redis: 'unknown',
      queues: {},
      workers: 'active',
    };

    try {
      await this.documentRepository.findByWorkspace('', 0, 1);
    } catch {
      details.database = 'error';
    }

    const queueNames = Object.values(QUEUE_NAMES).filter(name => name !== QUEUE_NAMES.DEAD_LETTER);
    for (const queueName of queueNames) {
      try {
        const queue = (this.eventBus as any)?.queues?.get(queueName);
        if (queue) {
          const counts = await queue.getJobCounts('waiting', 'active', 'delayed');
          details.queues[queueName] = {
            waiting: counts.waiting || 0,
            active: counts.active || 0,
            delayed: counts.delayed || 0,
          };
        } else {
          details.queues[queueName] = 'unavailable';
        }
      } catch {
        details.queues[queueName] = 'error';
      }
    }

    const allQueuesOk = Object.values(details.queues).every((q: any) => q === 'unavailable' || (q && q.waiting !== undefined && q.waiting < 1000));
    
    return {
      status: details.database === 'connected' && allQueuesOk ? 'ok' : 'degraded',
      details,
    };
  }
}
