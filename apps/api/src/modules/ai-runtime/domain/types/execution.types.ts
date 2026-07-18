export type PipelineStage =
  | 'context_build'
  | 'tool_resolve'
  | 'prompt_render'
  | 'llm_call'
  | 'response_process';

export class ExecutionContext {
  constructor(
    public readonly conversationId: string,
    public readonly workspaceId: string,
    public readonly userId: string,
    public readonly agentId: string,
    public readonly input: string,
    public readonly metadata: Record<string, unknown> = {},
    public readonly startTime: Date = new Date(),
    public stage: PipelineStage = 'context_build',
    public contextMessages: { role: string; content: string }[] = [],
    public resolvedTools: string[] = [],
    public renderedPrompt: string | null = null,
    public llmResponse: string | null = null,
  ) {}
}

export interface StageTiming {
  stage: PipelineStage;
  durationMs: number;
}

export class ExecutionResult<T = unknown> {
  constructor(
    public readonly success: boolean,
    public readonly output: T | null,
    public readonly error: string | null,
    public readonly stages: StageTiming[],
    public readonly totalDurationMs: number,
    public readonly context: ExecutionContext,
    public readonly metadata: Record<string, unknown> = {},
  ) {}
}

export interface PipelineMiddleware {
  before?(context: ExecutionContext): Promise<ExecutionContext>;
  after?(context: ExecutionContext, result: ExecutionResult): Promise<ExecutionResult>;
}
