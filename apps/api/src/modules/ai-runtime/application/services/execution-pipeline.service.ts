import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext, ExecutionResult } from '../../domain/types/execution.types.js';
import type { PipelineMiddleware, StageTiming } from '../../domain/types/execution.types.js';
import { ConversationContextManagerService } from './conversation-context-manager.service.js';
import { ToolDispatcherService } from './tool-dispatcher.service.js';
import { AgentStateManagerService } from './agent-state-manager.service.js';

@Injectable()
export class ExecutionPipelineService {
  private readonly logger = new Logger(ExecutionPipelineService.name);
  private readonly _middleware: PipelineMiddleware[] = [];

  constructor(
    private readonly contextManager: ConversationContextManagerService,
    private readonly toolDispatcher: ToolDispatcherService,
    private readonly stateManager: AgentStateManagerService,
  ) {}

  use(middleware: PipelineMiddleware): void {
    this._middleware.push(middleware);
  }

  async execute(
    input: ExecutionContext,
    history: { role: string; content: string }[],
    llmCall: (messages: { role: string; content: string }[]) => Promise<{ content: string }>,
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const stages: StageTiming[] = [];
    const context = input;

    try {
      // Phase 1: Context Build
      context.stage = 'context_build';
      await this._runMiddleware('before', context);
      this.contextManager.prepareExecutionContext(input.input, history, context);
      stages.push({ stage: 'context_build', durationMs: Date.now() - startTime });

      // Phase 2: Tool Resolution
      context.stage = 'tool_resolve';
      const toolStart = Date.now();
      context.resolvedTools = this.toolDispatcher.getAvailableTools();
      stages.push({ stage: 'tool_resolve', durationMs: Date.now() - toolStart });

      // Phase 3: LLM Call
      context.stage = 'llm_call';
      const llmStart = Date.now();
      const llmMessages = [
        ...context.contextMessages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: context.input },
      ];
      const response = await llmCall(llmMessages);
      context.llmResponse = response.content;
      stages.push({ stage: 'llm_call', durationMs: Date.now() - llmStart });

      // Phase 4: Response Process
      context.stage = 'response_process';
      const responseStart = Date.now();
      context.renderedPrompt = response.content;
      stages.push({ stage: 'response_process', durationMs: Date.now() - responseStart });

      const result = new ExecutionResult(
        true,
        response.content,
        null,
        stages,
        Date.now() - startTime,
        context,
      );

      await this._runMiddleware('after', context, result);
      return result;
    } catch (err) {
      const errorResult = new ExecutionResult(
        false,
        null,
        (err as Error).message,
        stages,
        Date.now() - startTime,
        context,
        { error: (err as Error).message },
      );
      this.logger.error(`Pipeline execution failed: ${(err as Error).message}`);
      return errorResult;
    }
  }

  private async _runMiddleware(
    phase: 'before' | 'after',
    context: ExecutionContext,
    result?: ExecutionResult,
  ): Promise<void> {
    for (const mw of this._middleware) {
      try {
        if (phase === 'before' && mw.before) {
          await mw.before(context);
        } else if (phase === 'after' && mw.after && result) {
          await mw.after(context, result);
        }
      } catch (err) {
        this.logger.warn(`Middleware ${phase} error: ${(err as Error).message}`);
      }
    }
  }
}
