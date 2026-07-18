import type { ToolExecutionVO } from './tool-execution.vo.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ToolContract {
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  permissions: string[];
  timeout: number;
}

export interface IToolExecutor {
  execute(
    toolId: string,
    input: Record<string, unknown>,
    context?: Record<string, unknown>,
  ): Promise<ToolExecutionVO>;
  validate(toolId: string, input: Record<string, unknown>): Promise<ValidationResult>;
  getContract(toolId: string): Promise<ToolContract>;
}
