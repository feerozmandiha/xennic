import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';
import { PipelineEventBus } from '../../infrastructure/queues/pipeline-event-bus.js';

type PipelineStage = 'intake' | 'classify' | 'parse' | 'normalize' | 'chunk' | 'embed' | 'publish' | 'completed' | 'failed';

export interface PipelineResult {
  success: boolean;
  documentId: string;
  completedStages: PipelineStage[];
  failedAt?: PipelineStage;
  error?: string;
  durationMs: number;
}

@Injectable()
export class PipelineOrchestratorService {
  private readonly logger = new Logger(PipelineOrchestratorService.name);

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    private readonly documentRepository: IKnowledgeDocumentRepository,
    @Inject('IPipelineRunRepository')
    private readonly pipelineRunRepository: IPipelineRunRepository,
    private readonly eventBus: PipelineEventBus,
  ) {}

  async runPipeline(documentId: string): Promise<PipelineResult> {
    const startedAt = new Date();
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      return { success: false, documentId, completedStages: [], failedAt: 'intake', error: 'Document not found', durationMs: Date.now() - startedAt.getTime() };
    }

    this.eventBus.enqueueIntake({
      documentId: document.id,
      workspaceId: document.workspaceId,
      stage: 'intake',
      filename: document.filename,
      originalName: document.originalName,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      storagePath: document.storagePath || '',
      documentType: document.documentType,
      createdBy: document.createdBy,
    });

    return {
      success: true,
      documentId,
      completedStages: ['intake'],
      durationMs: Date.now() - startedAt.getTime(),
    };
  }

  async retryPipeline(documentId: string): Promise<PipelineResult> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    if (document.status !== 'failed') {
      throw new Error(`Document ${documentId} is not in failed state`);
    }

    document.retry();
    await this.documentRepository.update(document);

    return this.runPipeline(documentId);
  }

  async publishDocument(documentId: string, knowledgeId?: string): Promise<PipelineResult> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      return { success: false, documentId, completedStages: [], failedAt: 'publish', error: 'Document not found', durationMs: 0 };
    }

    await this.eventBus.enqueuePublish({
      documentId,
      workspaceId: document.workspaceId,
      stage: 'publish',
      knowledgeId: knowledgeId || `knowledge-${Date.now()}`,
    });

    return { success: true, documentId, completedStages: ['publish'], durationMs: 0 };
  }
}
