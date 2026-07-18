import { AiRuntimeException } from './ai-runtime.exception.js';

export class ToolExecutionException extends AiRuntimeException {
  constructor(
    public readonly toolName: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(`Tool "${toolName}" execution failed: ${message}`, 'TOOL_EXECUTION_ERROR', details);
    this.name = 'ToolExecutionException';
  }
}
