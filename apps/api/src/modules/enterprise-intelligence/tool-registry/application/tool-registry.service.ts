import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IToolRegistry, ListOptions } from '../domain/tool-registry.interface.js';
import { ToolEntity, ToolHealth, ToolStatus } from '../domain/tool.entity.js';
import type { PaginatedResult } from '../../shared/types/index.js';

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);

  constructor(@Inject('IToolRegistry') private readonly registry: IToolRegistry) {}

  async register(
    name: string,
    description: string,
    schema: Record<string, unknown>,
    permissions: string[],
    endpoint?: string,
    metadata?: Record<string, unknown>,
  ): Promise<ToolEntity> {
    const entity = ToolEntity.create(name, description, schema, permissions, endpoint, metadata);
    await this.registry.register(entity);
    this.logger.log(`Registered tool "${name}" (${entity.id}) v${entity.version}`);
    return entity;
  }

  async get(id: string): Promise<ToolEntity | null> {
    return this.registry.get(id);
  }

  async getByName(name: string, version?: number): Promise<ToolEntity | null> {
    return this.registry.getByName(name, version);
  }

  async list(options?: ListOptions): Promise<PaginatedResult<ToolEntity>> {
    return this.registry.list(options);
  }

  async findByCapability(capability: string): Promise<ToolEntity[]> {
    return this.registry.findByCapability(capability);
  }

  async updateSchema(id: string, schema: Record<string, unknown>): Promise<ToolEntity | null> {
    const entity = await this.registry.get(id);
    if (!entity) return null;
    return this.registry.update(id, {
      schema,
      version: entity.version + 1,
    } as Partial<ToolEntity>);
  }

  async updateHealth(id: string, health: ToolHealth): Promise<ToolEntity | null> {
    return this.registry.update(id, { health } as Partial<ToolEntity>);
  }

  async delete(id: string): Promise<void> {
    await this.registry.delete(id);
    this.logger.log(`Deleted tool ${id}`);
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    deprecated: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  }> {
    const all = await this.registry.list();
    const items = all.items;
    return {
      total: items.length,
      active: items.filter((e) => e.status === ToolStatus.ACTIVE).length,
      inactive: items.filter((e) => e.status === ToolStatus.INACTIVE).length,
      deprecated: items.filter((e) => e.status === ToolStatus.DEPRECATED).length,
      healthy: items.filter((e) => e.health === ToolHealth.HEALTHY).length,
      degraded: items.filter((e) => e.health === ToolHealth.DEGRADED).length,
      unhealthy: items.filter((e) => e.health === ToolHealth.UNHEALTHY).length,
    };
  }
}
