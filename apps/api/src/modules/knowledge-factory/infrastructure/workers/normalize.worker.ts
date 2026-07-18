import { Inject, Injectable } from '@nestjs/common';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';
import { PipelineEventBus, type NormalizeJobData } from '../queues/pipeline-event-bus.js';
import { BasePipelineWorker, type WorkerContext } from './base-pipeline.worker.js';
import { QUEUE_NAMES } from '../queues/queue-names.js';

@Injectable()
export class NormalizeWorker extends BasePipelineWorker {
  get queueName(): string {
    return QUEUE_NAMES.NORMALIZE;
  }
  getStageName(): string {
    return 'normalize';
  }

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    documentRepository: IKnowledgeDocumentRepository,
    @Inject('IPipelineRunRepository')
    pipelineRunRepository: IPipelineRunRepository,
    eventBus: PipelineEventBus,
  ) {
    super(documentRepository, pipelineRunRepository, eventBus, QUEUE_NAMES.NORMALIZE);
  }

  protected async execute(
    context: WorkerContext,
  ): Promise<{ normalized: boolean; chunksPreview: string[] }> {
    const { documentId } = context;
    const job = context.job as any;
    const payload = job.data as NormalizeJobData;

    const sourceText = payload.sourceText || '';
    const normalized = this.normalizeText(sourceText);
    const chunksPreview = this.splitIntoChunks(normalized)
      .slice(0, 3)
      .map((c) => c.text.slice(0, 100));

    await this.eventBus.enqueueChunk({
      documentId,
      workspaceId: payload.workspaceId,
      stage: 'chunk',
    });

    return { normalized: true, chunksPreview };
  }

  private normalizeText(text: string): string {
    return text
      .replace(/[^\S\n]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private splitIntoChunks(text: string): Array<{ text: string }> {
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    return paragraphs.map((p) => ({ text: p.trim() }));
  }
}
