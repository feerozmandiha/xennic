import { Inject, Injectable } from '@nestjs/common';
import { Processor } from '@nestjs/bullmq';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';
import { PipelineEventBus, type IntakeJobData } from '../queues/pipeline-event-bus.js';
import { BasePipelineWorker, type WorkerContext } from './base-pipeline.worker.js';
import { QUEUE_NAMES } from '../queues/queue-names.js';
import { PipelineOrchestratorService } from '../../application/services/pipeline-orchestrator.service.js';

@Injectable()
@Processor(QUEUE_NAMES.INTAKE)
export class IntakeWorker extends BasePipelineWorker {
  get queueName(): string {
    return QUEUE_NAMES.INTAKE;
  }
  getStageName(): string {
    return 'intake';
  }

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    documentRepository: IKnowledgeDocumentRepository,
    @Inject('IPipelineRunRepository')
    pipelineRunRepository: IPipelineRunRepository,
    eventBus: PipelineEventBus,
    private readonly orchestrator: PipelineOrchestratorService,
  ) {
    super(documentRepository, pipelineRunRepository, eventBus, QUEUE_NAMES.INTAKE);
  }

  protected async execute(context: WorkerContext): Promise<{ status: string }> {
    const { documentId } = context;
    const job = context.job as any;
    const payload = job.data as IntakeJobData;

    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    document.classify({ domain: 'general', standard: '', equipmentType: '', confidence: 0.5 });
    await this.documentRepository.update(document);

    await this.eventBus.enqueueClassify({
      documentId,
      workspaceId: payload.workspaceId,
      stage: 'classify',
      text: document.metadata as string,
    });

    return { status: 'intake_completed' };
  }
}
