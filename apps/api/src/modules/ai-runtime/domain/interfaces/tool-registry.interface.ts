import type { ToolDefinition, ToolCall, ToolResult } from '../types/tool.types.js';

export const I_TOOL_REGISTRY = 'IToolRegistry';

export interface IToolRegistry {
  register(tool: ToolDefinition): void;
  unregister(name: string): void;
  get(name: string): ToolDefinition | null;
  getAll(): ToolDefinition[];
  dispatch(call: ToolCall): Promise<ToolResult>;
}
