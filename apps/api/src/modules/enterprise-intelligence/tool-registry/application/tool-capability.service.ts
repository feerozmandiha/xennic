import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IToolRegistry } from '../domain/tool-registry.interface.js';
import type { ToolEntity } from '../domain/tool.entity.js';

export interface CapabilityIndex {
  toolId: string;
  toolName: string;
  capabilities: string[];
}

@Injectable()
export class ToolCapabilityService {
  private readonly logger = new Logger(ToolCapabilityService.name);

  constructor(@Inject('IToolRegistry') private readonly registry: IToolRegistry) {}

  async discover(): Promise<CapabilityIndex[]> {
    const result = await this.registry.list();
    const indices: CapabilityIndex[] = [];

    for (const tool of result.items) {
      const capabilities = this.extractCapabilities(tool);
      if (capabilities.length > 0) {
        indices.push({
          toolId: tool.id,
          toolName: tool.name,
          capabilities,
        });
      }
    }

    this.logger.debug(`Discovered capabilities for ${indices.length} tools`);
    return indices;
  }

  async findByCapability(capability: string): Promise<ToolEntity[]> {
    return this.registry.findByCapability(capability);
  }

  async getCapabilities(toolId: string): Promise<string[]> {
    const tool = await this.registry.get(toolId);
    if (!tool) return [];
    return this.extractCapabilities(tool);
  }

  private extractCapabilities(tool: ToolEntity): string[] {
    const capabilities: string[] = [];
    const descKeywords = ['capability', 'capabilities', 'can', 'supports', 'provides'];
    const desc = (tool.description ?? '').toLowerCase();

    for (const keyword of descKeywords) {
      if (desc.includes(keyword)) {
        capabilities.push(keyword);
      }
    }

    if (tool.metadata?.capabilities) {
      const declared = tool.metadata.capabilities;
      if (Array.isArray(declared)) {
        capabilities.push(...declared.map(String));
      }
    }

    return [...new Set(capabilities)];
  }
}
