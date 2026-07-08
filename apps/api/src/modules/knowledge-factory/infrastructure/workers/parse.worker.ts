import { Inject, Injectable } from '@nestjs/common';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';
import type { IExtractionRepository } from '../../domain/interfaces/extraction.repository.interface.js';
import { PipelineEventBus, type ParseJobData } from '../queues/pipeline-event-bus.js';
import { BasePipelineWorker, type WorkerContext } from './base-pipeline.worker.js';
import { QUEUE_NAMES } from '../queues/queue-names.js';
import { KnowledgeExtraction } from '../../domain/entities/knowledge-extraction.entity.js';

@Injectable()
export class ParseWorker extends BasePipelineWorker {
  get queueName(): string {
    return QUEUE_NAMES.PARSE;
  }
  getStageName(): string {
    return 'parse';
  }

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    documentRepository: IKnowledgeDocumentRepository,
    @Inject('IPipelineRunRepository')
    pipelineRunRepository: IPipelineRunRepository,
    eventBus: PipelineEventBus,
    @Inject('IExtractionRepository')
    private readonly extractionRepository: IExtractionRepository,
  ) {
    super(documentRepository, pipelineRunRepository, eventBus, QUEUE_NAMES.PARSE);
  }

  protected async execute(context: WorkerContext): Promise<{ method: string; text: string }> {
    const { documentId } = context;
    const job = context.job as any;
    const payload = job.data as ParseJobData;

    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    const extractedText = `[Extracted text for ${document.originalName}]`;

    await this.extractionRepository.create(
      KnowledgeExtraction.create({
        documentId,
        method: payload.method || 'textract',
        text: extractedText,
        confidence: 0.9,
        language: 'en',
        metadata: { parser: 'textract', parsedAt: new Date().toISOString() },
      }),
    );

    await this.eventBus.enqueueNormalize({
      documentId,
      workspaceId: payload.workspaceId,
      stage: 'normalize',
      sourceText: extractedText,
      language: 'en',
    });

    return { method: payload.method || 'textract', text: extractedText };
  }
}
