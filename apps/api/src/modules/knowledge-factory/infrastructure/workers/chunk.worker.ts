import { Inject, Injectable } from '@nestjs/common';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IKnowledgeChunkRepository } from '../../domain/interfaces/knowledge-chunk.repository.interface.js';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';
import { PipelineEventBus, type ChunkJobData } from '../queues/pipeline-event-bus.js';
import { BasePipelineWorker, type WorkerContext } from './base-pipeline.worker.js';
import { QUEUE_NAMES } from '../queues/queue-names.js';
import { KnowledgeDocumentChunk } from '../../domain/entities/knowledge-document-chunk.entity.js';

@Injectable()
export class ChunkWorker extends BasePipelineWorker {
  get queueName(): string {
    return QUEUE_NAMES.CHUNK;
  }
  getStageName(): string {
    return 'chunk';
  }

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    documentRepository: IKnowledgeDocumentRepository,
    @Inject('IPipelineRunRepository')
    pipelineRunRepository: IPipelineRunRepository,
    eventBus: PipelineEventBus,
    @Inject('IKnowledgeChunkRepository')
    private readonly chunkRepository: IKnowledgeChunkRepository,
  ) {
    super(documentRepository, pipelineRunRepository, eventBus, QUEUE_NAMES.CHUNK);
  }

  protected async execute(context: WorkerContext): Promise<{ chunkCount: number }> {
    const { documentId } = context;
    const job = context.job as any;
    const payload = job.data as ChunkJobData;

    const rawText = `Normalized text for document ${documentId}`;
    const paragraphs = rawText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const chunks = paragraphs.map((text, idx) => ({
      text,
      tokenCount: Math.max(1, Math.round(text.length / 4)),
      pageNumber: idx + 1,
      section: `Section ${idx + 1}`,
    }));

    if (chunks.length > 0) {
      const chunkEntities = chunks.map((c, idx) =>
        KnowledgeDocumentChunk.create({
          documentId,
          chunkIndex: idx,
          text: c.text,
          tokenCount: c.tokenCount,
          pageNumber: c.pageNumber,
          section: c.section,
          metadata: {},
        }),
      );
      await this.chunkRepository.createBatch(chunkEntities);
    }

    await this.eventBus.enqueueEmbed({
      documentId,
      workspaceId: payload.workspaceId,
      stage: 'embed',
      chunkIds: [],
    });

    return { chunkCount: chunks.length };
  }
}
