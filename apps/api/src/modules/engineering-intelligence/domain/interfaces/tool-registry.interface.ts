import type { ToolDefinition } from '../types/ei.types.js';

export interface IToolRegistry {
  register(tool: ToolDefinition): Promise<void>;
  get(toolId: string): Promise<ToolDefinition | null>;
  find(query: { capability?: string; domain?: string; safetyLevel?: string }): Promise<ToolDefinition[]>;
  list(): Promise<ToolDefinition[]>;
  validateInput(toolId: string, input: Record<string, unknown>): Promise<boolean>;
}
