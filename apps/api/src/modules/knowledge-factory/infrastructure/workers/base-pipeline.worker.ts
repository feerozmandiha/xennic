import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { KnowledgePipelineRun } from '../../domain/entities/knowledge-pipeline-run.entity.js';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';
import {
  PipelineEventBus,
  type PipelineJobData,
} from '../../infrastructure/queues/pipeline-event-bus.js';

export interface WorkerContext {
  documentId: string;
  workspaceId: string;
  stage: string;
  job: Job<PipelineJobData>;
}

@Injectable()
@Processor('')
export abstract class BasePipelineWorker extends WorkerHost {
  protected readonly logger: Logger;

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    protected readonly documentRepository: IKnowledgeDocumentRepository,
    @Inject('IPipelineRunRepository')
    protected readonly pipelineRunRepository: IPipelineRunRepository,
    protected readonly eventBus: PipelineEventBus,
    queueName: string,
  ) {
    super();
    this.logger = new Logger(`${queueName.split(':').pop()?.toUpperCase()}_WORKER`);
  }

  abstract get queueName(): string;
  abstract getStageName(): string;

  async process(
    job: Job<PipelineJobData>,
  ): Promise<{ success: boolean; output?: unknown; error?: string }> {
    const { documentId, workspaceId, stage } = job.data;
    const context: WorkerContext = { documentId, workspaceId, stage, job };

    this.logger.log(`Processing job ${job.id} for document ${documentId}`);
    await job.updateProgress(0);

    let pipelineRun: KnowledgePipelineRun | null = null;

    try {
      pipelineRun = KnowledgePipelineRun.create({
        documentId,
        stage: this.getStageName(),
        input: job.data.metadata || {},
      });
      pipelineRun = await this.pipelineRunRepository.create(pipelineRun);

      await job.updateProgress(10);
      const result = await this.execute(context);

      await job.updateProgress(90);
      if (pipelineRun) {
        pipelineRun.success(result);
        await this.pipelineRunRepository.update(pipelineRun);
      }
      await this.onSuccess(context, result);
      await job.updateProgress(100);

      return { success: true, output: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Job ${job.id} failed: ${message}`);

      if (pipelineRun) {
        pipelineRun.fail(message);
        await this.pipelineRunRepository.update(pipelineRun);
      }

      await this.onFailure(context, message);
      return { success: false, error: message };
    }
  }

  protected abstract execute(context: WorkerContext): Promise<unknown>;

  protected async onSuccess(_context: WorkerContext, _result: unknown): Promise<void> {}

  protected async onFailure(context: WorkerContext, error: string): Promise<void> {
    const document = await this.documentRepository.findById(context.documentId);
    if (document) {
      document.fail(error);
      await this.documentRepository.update(document);
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<PipelineJobData>, err: Error) {
    this.logger.error(`Worker failed for job ${job.id}: ${err.message}`);
    await this.eventBus.moveToDeadLetter(
      this.queueName,
      job.id!,
      `Max retries exceeded: ${err.message}`,
    );
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<PipelineJobData>) {
    this.logger.log(`Worker completed job ${job.id}`);
  }
}
