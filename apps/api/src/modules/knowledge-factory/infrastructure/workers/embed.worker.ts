import { Injectable, Inject } from '@nestjs/common';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IKnowledgeChunkRepository } from '../../domain/interfaces/knowledge-chunk.repository.interface.js';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';
import type { EmbeddingGateway } from '../../domain/interfaces/embedding-gateway.interface.js';
import { PipelineEventBus, type EmbedJobData } from '../queues/pipeline-event-bus.js';
import { BasePipelineWorker, type WorkerContext } from './base-pipeline.worker.js';
import { QUEUE_NAMES } from '../queues/queue-names.js';

@Injectable()
export class EmbedWorker extends BasePipelineWorker {
  get queueName(): string {
    return QUEUE_NAMES.EMBED;
  }
  getStageName(): string {
    return 'embed';
  }

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    documentRepository: IKnowledgeDocumentRepository,
    @Inject('IPipelineRunRepository')
    pipelineRunRepository: IPipelineRunRepository,
    eventBus: PipelineEventBus,
    @Inject('IKnowledgeChunkRepository')
    private readonly chunkRepository: IKnowledgeChunkRepository,
    @Inject('EmbeddingGateway')
    private readonly embeddingGateway: EmbeddingGateway,
  ) {
    super(documentRepository, pipelineRunRepository, eventBus, QUEUE_NAMES.EMBED);
  }

  protected async execute(context: WorkerContext): Promise<{ embedded: number }> {
    const { documentId, workspaceId } = context;
    const job = context.job as any;
    const payload = job.data as EmbedJobData;

    const chunks = await this.chunkRepository.findByDocument(documentId);
    const texts = chunks.map((c) => c.text);

    if (texts.length > 0) {
      try {
        const embeddings = await this.embeddingGateway.embedBatch(texts);
        for (let i = 0; i < chunks.length; i++) {
          const embedding = embeddings[i];
          const chunk = chunks[i];
          if (embedding && chunk) {
            await this.chunkRepository.linkEmbedding(
              chunk.id,
              String((embedding as number[]).length),
            );
          }
        }
      } catch (error) {
        this.logger.warn(
          `Embedding generation failed for document ${documentId}: ${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }

    await this.eventBus.enqueuePublish({
      documentId,
      workspaceId: workspaceId || payload.workspaceId || '',
      stage: 'publish',
    });

    return { embedded: chunks.length };
  }
}
