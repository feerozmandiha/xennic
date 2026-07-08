export type ToolStatus = 'available' | 'disabled';

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
}

export class ToolDefinition {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly parameters: ToolParameter[],
    public readonly handler: string,
    public readonly status: ToolStatus = 'available',
    public readonly tags: string[] = [],
  ) {}
}

export interface ToolCall {
  toolName: string;
  parameters: Record<string, unknown>;
  callId: string;
}

export type ToolResultStatus = 'success' | 'error';

export class ToolResult {
  constructor(
    public readonly callId: string,
    public readonly toolName: string,
    public readonly status: ToolResultStatus,
    public readonly output: unknown,
    public readonly error: string | null = null,
    public readonly durationMs: number = 0,
  ) {}
}
