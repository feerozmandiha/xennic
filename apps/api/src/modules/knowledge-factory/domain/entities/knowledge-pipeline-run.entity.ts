import {
  type PipelineStageStatus,
  PIPELINE_STAGE_STATUSES,
} from '../value-objects/pipeline-stage-status.vo.js';

export class KnowledgePipelineRun {
  constructor(
    public readonly id: string,
    public readonly documentId: string,
    public readonly stage: string,
    public _status: PipelineStageStatus,
    public input: unknown,
    public output: unknown | null,
    public _error: string | null,
    public readonly startedAt: Date,
    public finishedAt: Date | null,
    public durationMs: number | null,
  ) {}

  static create(data: { documentId: string; stage: string; input: unknown }): KnowledgePipelineRun {
    const now = new Date();
    return new KnowledgePipelineRun(
      crypto.randomUUID(),
      data.documentId,
      data.stage,
      PIPELINE_STAGE_STATUSES.RUNNING,
      data.input,
      null,
      null,
      now,
      null,
      null,
    );
  }

  static reconstitute(data: {
    id: string;
    documentId: string;
    stage: string;
    status: string;
    input: unknown;
    output: unknown | null;
    error: string | null;
    startedAt: Date;
    finishedAt: Date | null;
    durationMs: number | null;
  }): KnowledgePipelineRun {
    return new KnowledgePipelineRun(
      data.id,
      data.documentId,
      data.stage,
      data.status as PipelineStageStatus,
      data.input,
      data.output,
      data.error,
      data.startedAt,
      data.finishedAt,
      data.durationMs,
    );
  }

  success(output: unknown): void {
    this._status = PIPELINE_STAGE_STATUSES.SUCCESS;
    this.output = output;
    this.finishedAt = new Date();
    this.durationMs = this.finishedAt.getTime() - this.startedAt.getTime();
  }

  fail(error: string): void {
    this._status = PIPELINE_STAGE_STATUSES.FAILED;
    this._error = error;
    this.finishedAt = new Date();
    this.durationMs = this.finishedAt.getTime() - this.startedAt.getTime();
  }

  get status(): PipelineStageStatus {
    return this._status;
  }
  get error(): string | null {
    return this._error;
  }

  isRunning(): boolean {
    return this._status === PIPELINE_STAGE_STATUSES.RUNNING;
  }
  isSuccess(): boolean {
    return this._status === PIPELINE_STAGE_STATUSES.SUCCESS;
  }
  isFailed(): boolean {
    return this._status === PIPELINE_STAGE_STATUSES.FAILED;
  }
}
