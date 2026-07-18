export const PIPELINE_STAGE_STATUSES = {
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export type PipelineStageStatus =
  (typeof PIPELINE_STAGE_STATUSES)[keyof typeof PIPELINE_STAGE_STATUSES];
