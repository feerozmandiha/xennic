import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IToolRegistry } from '../../domain/interfaces/tool-registry.interface.js';
import type { ToolDefinition } from '../../domain/types/ei.types.js';

@Injectable()
export class ToolRegistry implements IToolRegistry {
  private readonly logger = new Logger(ToolRegistry.name);
  private readonly tools = new Map<string, ToolDefinition>();

  async register(tool: ToolDefinition): Promise<void> {
    const id = tool.id || randomUUID();
    this.tools.set(id, { ...tool, id });
    this.logger.debug(`Tool registered: ${id} (${tool.name})`);
  }

  async get(toolId: string): Promise<ToolDefinition | null> {
    return this.tools.get(toolId) ?? null;
  }

  async find(query: { capability?: string; domain?: string; safetyLevel?: string }): Promise<ToolDefinition[]> {
    return [...this.tools.values()].filter((tool) => {
      if (query.capability && !tool.capability.includes(query.capability)) return false;
      if (query.domain && !tool.supportedDomains.includes(query.domain)) return false;
      if (query.safetyLevel && tool.safetyLevel !== query.safetyLevel) return false;
      return true;
    });
  }

  async list(): Promise<ToolDefinition[]> {
    return [...this.tools.values()];
  }

  async validateInput(toolId: string, input: Record<string, unknown>): Promise<boolean> {
    const tool = this.tools.get(toolId);
    if (!tool) return false;
    const schema = tool.inputSchema as Record<string, unknown>;
    const required = (schema.required as string[]) ?? [];
    return required.every((field) => field in input);
  }
}
