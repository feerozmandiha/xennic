import { Logger } from '@nestjs/common';
import { ToolEntity } from '../../domain/tool.entity.js';
import type { IToolRegistry, ListOptions } from '../../domain/tool-registry.interface.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

export class InMemoryToolRegistry implements IToolRegistry {
  private readonly logger = new Logger(InMemoryToolRegistry.name);
  private readonly store = new Map<string, ToolEntity>();
  private readonly versions = new Map<string, ToolEntity[]>();

  async register(entity: ToolEntity): Promise<void> {
    this.store.set(entity.id, entity);
    this.logger.debug(`Registered tool ${entity.name} (${entity.id}) v${entity.version}`);
  }

  async get(id: string): Promise<ToolEntity | null> {
    return this.store.get(id) ?? null;
  }

  async getByName(name: string, version?: number): Promise<ToolEntity | null> {
    const candidates = Array.from(this.store.values()).filter((e) => e.name === name);
    if (version !== undefined) {
      const match = candidates.find((e) => e.version === version);
      if (match) return match;
      const archived = this.versions.get(name);
      if (archived) {
        return archived.find((e) => e.name === name && e.version === version) ?? null;
      }
      return null;
    }
    if (candidates.length === 0) return null;
    return candidates.reduce((latest, e) => (e.version > latest.version ? e : latest));
  }

  async list(options?: ListOptions): Promise<PaginatedResult<ToolEntity>> {
    let items = Array.from(this.store.values());
    if (options?.status) {
      items = items.filter((e) => e.status === options.status);
    }
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;
    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async findByCapability(capability: string): Promise<ToolEntity[]> {
    const lower = capability.toLowerCase();
    return Array.from(this.store.values()).filter((e) => {
      const desc = (e.description ?? '').toLowerCase();
      const schemaStr = JSON.stringify(e.schema ?? {}).toLowerCase();
      const metaStr = JSON.stringify(e.metadata ?? {}).toLowerCase();
      return desc.includes(lower) || schemaStr.includes(lower) || metaStr.includes(lower);
    });
  }

  async update(id: string, partial: Partial<ToolEntity>): Promise<ToolEntity | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const version = partial.version ?? existing.version;
    if (version !== existing.version) {
      const archived = this.versions.get(existing.name) ?? [];
      archived.push(existing);
      this.versions.set(existing.name, archived);
    }
    const updated = ToolEntity.reconstitute(
      partial.id ?? existing.id,
      partial.name ?? existing.name,
      partial.description ?? existing.description,
      version,
      partial.schema ?? existing.schema,
      partial.permissions ?? existing.permissions,
      partial.status ?? existing.status,
      partial.health ?? existing.health,
      partial.endpoint ?? existing.endpoint,
      partial.metadata ?? existing.metadata,
      existing.createdAt,
      new Date(),
    );
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const entity = this.store.get(id);
    if (entity) {
      this.versions.delete(entity.name);
    }
    this.store.delete(id);
  }
}
