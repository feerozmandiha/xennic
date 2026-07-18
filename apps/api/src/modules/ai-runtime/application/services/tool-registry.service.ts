import { Injectable } from '@nestjs/common';
import type { IToolRegistry } from '../../domain/interfaces/tool-registry.interface.js';
import { ToolResult } from '../../domain/types/tool.types.js';
import type { ToolDefinition, ToolCall } from '../../domain/types/tool.types.js';
import { ToolExecutionException } from '../../domain/exceptions/tool-execution.exception.js';

@Injectable()
export class ToolRegistryService implements IToolRegistry {
  private readonly _tools = new Map<string, ToolDefinition>();
  private readonly _handlers = new Map<
    string,
    (params: Record<string, unknown>) => Promise<unknown>
  >();

  register(tool: ToolDefinition): void {
    this._tools.set(tool.name, tool);
  }

  registerHandler(
    toolName: string,
    handler: (params: Record<string, unknown>) => Promise<unknown>,
  ): void {
    this._handlers.set(toolName, handler);
  }

  unregister(name: string): void {
    this._tools.delete(name);
    this._handlers.delete(name);
  }

  get(name: string): ToolDefinition | null {
    return this._tools.get(name) ?? null;
  }

  getAll(): ToolDefinition[] {
    return Array.from(this._tools.values());
  }

  async dispatch(call: ToolCall): Promise<ToolResult> {
    const tool = this._tools.get(call.toolName);
    if (!tool) {
      throw new ToolExecutionException(call.toolName, 'Tool not found');
    }

    if (tool.status === 'disabled') {
      throw new ToolExecutionException(call.toolName, 'Tool is disabled');
    }

    const handler = this._handlers.get(call.toolName);
    if (!handler) {
      throw new ToolExecutionException(call.toolName, 'No handler registered');
    }

    const start = Date.now();
    try {
      const output = await handler(call.parameters);
      return new ToolResult(
        call.callId,
        call.toolName,
        'success',
        output,
        null,
        Date.now() - start,
      );
    } catch (err) {
      return new ToolResult(
        call.callId,
        call.toolName,
        'error',
        null,
        (err as Error).message,
        Date.now() - start,
      );
    }
  }
}
