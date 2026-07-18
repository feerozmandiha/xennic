import { Inject, Injectable } from '@nestjs/common';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';
import { PipelineEventBus, type ClassifyJobData } from '../queues/pipeline-event-bus.js';
import { BasePipelineWorker, type WorkerContext } from './base-pipeline.worker.js';
import { QUEUE_NAMES } from '../queues/queue-names.js';

@Injectable()
export class ClassifyWorker extends BasePipelineWorker {
  get queueName(): string {
    return QUEUE_NAMES.CLASSIFY;
  }
  getStageName(): string {
    return 'classify';
  }

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    documentRepository: IKnowledgeDocumentRepository,
    @Inject('IPipelineRunRepository')
    pipelineRunRepository: IPipelineRunRepository,
    eventBus: PipelineEventBus,
  ) {
    super(documentRepository, pipelineRunRepository, eventBus, QUEUE_NAMES.CLASSIFY);
  }

  protected async execute(
    context: WorkerContext,
  ): Promise<{ domain: string; standard: string; confidence: number }> {
    const { documentId } = context;
    const job = context.job as any;
    const payload = job.data as ClassifyJobData;

    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    await this.documentRepository.update(document);

    await this.eventBus.enqueueParse({
      documentId,
      workspaceId: payload.workspaceId,
      stage: 'parse',
      method: 'textract',
    });

    return { domain: 'electrical-engineering', standard: 'IEEE', confidence: 0.85 };
  }
}
