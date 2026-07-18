import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { ToolEntity, ToolStatus, ToolHealth } from '../../domain/tool.entity.js';
import type { IToolRegistry, ListOptions } from '../../domain/tool-registry.interface.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

@Injectable()
export class PrismaToolRegistry implements IToolRegistry {
  private readonly logger = new Logger(PrismaToolRegistry.name);

  async register(entity: ToolEntity): Promise<void> {
    await prisma.tool_registry.upsert({
      where: { id: entity.id },
      update: {
        name: entity.name,
        description: entity.description,
        version: entity.version,
        schema: entity.schema as Record<string, unknown>,
        permissions: entity.permissions,
        status: entity.status,
        health: entity.health,
        endpoint: entity.endpoint ?? null,
        metadata: entity.metadata as Record<string, unknown>,
      },
      create: {
        id: entity.id,
        workspace_id: null,
        name: entity.name,
        description: entity.description,
        version: entity.version,
        schema: entity.schema as Record<string, unknown>,
        permissions: entity.permissions,
        status: entity.status,
        health: entity.health,
        endpoint: entity.endpoint ?? null,
        metadata: entity.metadata as Record<string, unknown>,
      },
    });
    this.logger.debug(`Registered tool ${entity.name} (${entity.id}) v${entity.version}`);
  }

  async get(id: string): Promise<ToolEntity | null> {
    const row = await prisma.tool_registry.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async getByName(name: string, version?: number): Promise<ToolEntity | null> {
    if (version !== undefined) {
      const row = await prisma.tool_registry.findUnique({
        where: { name_version: { name, version } },
      });
      return row ? this.toEntity(row) : null;
    }
    const rows = await prisma.tool_registry.findMany({
      where: { name },
      orderBy: { version: 'desc' },
      take: 1,
    });
    return rows.length > 0 ? this.toEntity(rows[0]!) : null;
  }

  async list(options?: ListOptions): Promise<PaginatedResult<ToolEntity>> {
    const where: Record<string, unknown> = {};
    if (options?.status) where.status = options.status;
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    const [items, total] = await Promise.all([
      prisma.tool_registry.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.tool_registry.count({ where }),
    ]);
    return {
      items: items.map((r) => this.toEntity(r)),
      total,
      offset,
      limit,
    };
  }

  async findByCapability(capability: string): Promise<ToolEntity[]> {
    const lower = capability.toLowerCase();
    const rows = await prisma.tool_registry.findMany({
      where: {
        OR: [{ description: { contains: lower } }],
      },
    });
    return rows
      .filter((r) => {
        const schemaStr = JSON.stringify(r.schema ?? {}).toLowerCase();
        const metaStr = JSON.stringify(r.metadata ?? {}).toLowerCase();
        const desc = (r.description ?? '').toLowerCase();
        return desc.includes(lower) || schemaStr.includes(lower) || metaStr.includes(lower);
      })
      .map((r) => this.toEntity(r));
  }

  async update(id: string, partial: Partial<ToolEntity>): Promise<ToolEntity | null> {
    const existing = await prisma.tool_registry.findUnique({ where: { id } });
    if (!existing) return null;

    const version = partial.version ?? existing.version;
    const updated = ToolEntity.reconstitute(
      partial.id ?? existing.id,
      partial.name ?? existing.name,
      partial.description ?? existing.description,
      version,
      partial.schema ?? (existing.schema as Record<string, unknown>),
      partial.permissions ?? existing.permissions,
      partial.status ?? (existing.status as ToolStatus),
      partial.health ?? (existing.health as ToolHealth),
      partial.endpoint ?? existing.endpoint ?? undefined,
      partial.metadata ?? (existing.metadata as Record<string, unknown>),
      existing.created_at,
      new Date(),
    );

    await this.register(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await prisma.tool_registry.delete({ where: { id } }).catch(() => {});
  }

  private toEntity(r: {
    id: string;
    name: string;
    description: string;
    version: number;
    schema: unknown;
    permissions: string[];
    status: string;
    health: string;
    endpoint: string | null;
    metadata: unknown;
    created_at: Date;
    updated_at: Date;
  }): ToolEntity {
    return ToolEntity.reconstitute(
      r.id,
      r.name,
      r.description,
      r.version,
      r.schema as Record<string, unknown>,
      r.permissions,
      r.status as ToolStatus,
      r.health as ToolHealth,
      r.endpoint ?? undefined,
      r.metadata as Record<string, unknown>,
      r.created_at,
      r.updated_at,
    );
  }
}
