import type { ToolExecutionRequest, ToolExecutionResult, ToolConfig } from '../types/agent.types.js';

export interface IToolExecutor {
  execute(request: ToolExecutionRequest): Promise<ToolExecutionResult>;
  batchExecute(requests: ToolExecutionRequest[]): Promise<ToolExecutionResult[]>;
  getTool(toolId: string): ToolConfig | null;
  listTools(): ToolConfig[];
}
