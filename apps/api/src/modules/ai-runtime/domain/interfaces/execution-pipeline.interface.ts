import type {
  ExecutionContext,
  ExecutionResult,
  PipelineMiddleware,
} from '../types/execution.types.js';

export const I_EXECUTION_PIPELINE = 'IExecutionPipeline';

export interface IExecutionPipeline {
  use(middleware: PipelineMiddleware): void;
  execute(context: ExecutionContext): Promise<ExecutionResult>;
}
