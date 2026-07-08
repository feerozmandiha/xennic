import { Injectable, Logger } from '@nestjs/common';
import type { ToolEntity } from '../../tool-registry/domain/tool.entity.js';
import type { ToolContract } from '../../tool-registry/domain/tool-executor.interface.js';
import type { ToolExecutionVO } from '../../tool-registry/domain/tool-execution.vo.js';
import { ToolRegistryService } from '../../tool-registry/application/tool-registry.service.js';
import { ToolExecutorService } from '../../tool-registry/application/tool-executor.service.js';

@Injectable()
export class ToolApi {
  private readonly logger = new Logger(ToolApi.name);

  constructor(
    private readonly registry: ToolRegistryService,
    private readonly executor: ToolExecutorService,
  ) {}

  async register(
    name: string,
    description: string,
    schema: Record<string, unknown>,
    permissions: string[] = [],
    endpoint?: string,
    metadata?: Record<string, unknown>,
  ): Promise<ToolEntity> {
    this.logger.debug(`register(name=${name})`);
    return this.registry.register(name, description, schema, permissions, endpoint, metadata);
  }

  async get(id: string): Promise<ToolEntity | null> {
    return this.registry.get(id);
  }

  async execute(
    toolId: string,
    input: Record<string, unknown>,
    context?: Record<string, unknown>,
  ): Promise<ToolExecutionVO> {
    this.logger.debug(`execute(toolId=${toolId})`);
    return this.executor.execute(toolId, input, context);
  }

  async findCapable(capability: string): Promise<ToolEntity[]> {
    return this.registry.findByCapability(capability);
  }

  async getContract(toolId: string): Promise<ToolContract> {
    return this.executor.getContract(toolId);
  }
}
