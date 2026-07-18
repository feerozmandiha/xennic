import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IToolRegistry } from '../domain/tool-registry.interface.js';
import type {
  IToolExecutor,
  ValidationResult,
  ToolContract,
} from '../domain/tool-executor.interface.js';
import { ToolExecutionVO } from '../domain/tool-execution.vo.js';

@Injectable()
export class ToolExecutorService implements IToolExecutor {
  private readonly logger = new Logger(ToolExecutorService.name);

  constructor(@Inject('IToolRegistry') private readonly registry: IToolRegistry) {}

  async execute(
    toolId: string,
    input: Record<string, unknown>,
    _context?: Record<string, unknown>,
  ): Promise<ToolExecutionVO> {
    const start = Date.now();
    const validation = await this.validate(toolId, input);
    if (!validation.valid) {
      return ToolExecutionVO.create(
        toolId,
        input,
        null,
        false,
        Date.now() - start,
        `Validation failed: ${validation.errors.join('; ')}`,
      );
    }

    try {
      const contract = await this.getContract(toolId);
      const output = await this.runTool(contract, input);
      return ToolExecutionVO.create(toolId, input, output, true, Date.now() - start, null);
    } catch (err) {
      return ToolExecutionVO.create(
        toolId,
        input,
        null,
        false,
        Date.now() - start,
        err instanceof Error ? err.message : 'Unknown error',
      );
    }
  }

  async validate(toolId: string, input: Record<string, unknown>): Promise<ValidationResult> {
    const tool = await this.registry.get(toolId);
    if (!tool) {
      return { valid: false, errors: [`Tool ${toolId} not found`] };
    }
    return this.validateAgainstSchema(tool.schema, input);
  }

  async getContract(toolId: string): Promise<ToolContract> {
    const tool = await this.registry.get(toolId);
    if (!tool) {
      throw new Error(`Tool ${toolId} not found`);
    }
    const schema = tool.schema as Record<string, unknown>;
    const inputSchema = (schema.input ?? {}) as Record<string, unknown>;
    const outputSchema = (schema.output ?? {}) as Record<string, unknown>;
    return {
      inputSchema,
      outputSchema,
      permissions: tool.permissions,
      timeout: (tool.metadata?.timeout as number) ?? 30000,
    };
  }

  private validateAgainstSchema(
    schema: Record<string, unknown>,
    input: Record<string, unknown>,
  ): ValidationResult {
    const errors: string[] = [];
    const inputSchema = (schema.input ?? {}) as Record<string, unknown>;
    const properties = (inputSchema.properties ?? {}) as Record<string, unknown>;
    const required = (inputSchema.required ?? []) as string[];

    for (const key of required) {
      if (!(key in input)) {
        errors.push(`Missing required field: ${key}`);
      }
    }

    for (const [key, value] of Object.entries(input)) {
      const propSchema = properties[key] as Record<string, unknown> | undefined;
      if (propSchema?.type && typeof value !== propSchema.type) {
        errors.push(`Field "${key}" expected type ${String(propSchema.type)}, got ${typeof value}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private async runTool(
    _contract: ToolContract,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return { executed: true, input };
  }
}
