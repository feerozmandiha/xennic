import { Injectable, Inject } from '@nestjs/common';
import type { IToolRegistry } from '../../domain/interfaces/tool-registry.interface.js';
import { I_TOOL_REGISTRY } from '../../domain/interfaces/tool-registry.interface.js';
import type { ToolCall, ToolResult, ToolDefinition } from '../../domain/types/tool.types.js';
import { ToolInputValidator } from '../validators/tool-input.validator.js';
import { ToolExecutionException } from '../../domain/exceptions/tool-execution.exception.js';

export interface DispatchedToolResult extends ToolResult {
  definition: ToolDefinition | null;
}

@Injectable()
export class ToolDispatcherService {
  private readonly _validator = new ToolInputValidator();

  constructor(
    @Inject(I_TOOL_REGISTRY)
    private readonly registry: IToolRegistry,
  ) {}

  async dispatch(call: ToolCall): Promise<DispatchedToolResult> {
    const definition = this.registry.get(call.toolName);
    if (!definition) {
      throw new ToolExecutionException(call.toolName, 'Tool not found in registry');
    }

    const errors = this._validator.validate(call, definition.parameters);
    if (errors.length > 0) {
      throw new ToolExecutionException(call.toolName, `Validation failed: ${errors.join('; ')}`, {
        errors,
      });
    }

    const result = await this.registry.dispatch(call);
    return { ...result, definition };
  }

  async dispatchBatch(calls: ToolCall[]): Promise<DispatchedToolResult[]> {
    return Promise.all(calls.map((call) => this.dispatch(call)));
  }

  getAvailableTools(): string[] {
    return this.registry.getAll().map((t) => t.name);
  }
}
