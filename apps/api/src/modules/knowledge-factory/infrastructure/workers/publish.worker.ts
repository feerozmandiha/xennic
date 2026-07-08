import { Inject, Injectable, Optional } from '@nestjs/common';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IKnowledgeChunkRepository } from '../../domain/interfaces/knowledge-chunk.repository.interface.js';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';
import { PipelineEventBus, type PublishJobData } from '../queues/pipeline-event-bus.js';
import { BasePipelineWorker, type WorkerContext } from './base-pipeline.worker.js';
import { QUEUE_NAMES } from '../queues/queue-names.js';
import { DomainEventPublisher } from '../../../semantic-integration/application/services/domain-event-publisher.service.js';
import { createDomainEvent, EventType } from '../../../semantic-integration/domain/events/domain-event.types.js';

@Injectable()
export class PublishWorker extends BasePipelineWorker {
  get queueName(): string {
    return QUEUE_NAMES.PUBLISH;
  }
  getStageName(): string {
    return 'publish';
  }

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    documentRepository: IKnowledgeDocumentRepository,
    @Inject('IPipelineRunRepository')
    pipelineRunRepository: IPipelineRunRepository,
    eventBus: PipelineEventBus,
    @Inject('IKnowledgeChunkRepository')
    private readonly chunkRepository: IKnowledgeChunkRepository,
    @Optional() private readonly eventPublisher?: DomainEventPublisher,
  ) {
    super(documentRepository, pipelineRunRepository, eventBus, QUEUE_NAMES.PUBLISH);
  }

  protected async execute(context: WorkerContext): Promise<{ published: boolean; knowledgeId: string }> {
    const { documentId } = context;
    const job = context.job as any;
    const payload = job.data as PublishJobData;

    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    const chunks = await this.chunkRepository.findByDocument(documentId);
    const knowledgeId = payload.knowledgeId || `knowledge-${Date.now()}`;

    document.publish(knowledgeId);
    await this.documentRepository.update(document);

    await this._emitDocumentPublished(document, chunks.length, knowledgeId);

    return { published: true, knowledgeId };
  }

  private async _emitDocumentPublished(
    document: any,
    chunkCount: number,
    knowledgeId: string,
  ): Promise<void> {
    if (!this.eventPublisher) return;

    const event = createDomainEvent(
      EventType.DocumentPublished,
      {
        documentId: document.id,
        workspaceId: document.workspaceId,
        knowledgeId,
        filename: document.filename,
        originalName: document.originalName,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        documentType: document.documentType,
        classification: document.classification ?? {},
        chunkCount,
        createdBy: document.createdBy,
      },
      { workspaceId: document.workspaceId, retryCount: 0 },
    );

    await this.eventPublisher.publish(event);
  }
}
