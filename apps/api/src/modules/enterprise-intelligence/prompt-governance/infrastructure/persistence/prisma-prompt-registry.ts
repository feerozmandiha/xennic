import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { PaginatedResult, Metadata } from '../../../shared/types/index.js';
import { PromptEntity, type PromptStatus } from '../../domain/prompt.entity.js';
import type { IPromptRegistry, PromptFindOptions } from '../../domain/prompt-registry.interface.js';

@Injectable()
export class PrismaPromptRegistry implements IPromptRegistry {
  private readonly logger = new Logger(PrismaPromptRegistry.name);

  async register(entity: PromptEntity): Promise<void> {
    await prisma.prompt_registry.upsert({
      where: { id: entity.id },
      update: {
        name: entity.name,
        description: entity.description,
        content: entity.content,
        variables: [...entity.variables],
        version: entity.version,
        status: entity.status,
        tags: [...entity.tags],
        created_by: entity.metadata.createdBy,
        updated_by: entity.metadata.updatedBy,
      },
      create: {
        id: entity.id,
        workspace_id: null,
        name: entity.name,
        description: entity.description,
        content: entity.content,
        variables: [...entity.variables],
        version: entity.version,
        status: entity.status,
        tags: [...entity.tags],
        created_by: entity.metadata.createdBy,
        updated_by: entity.metadata.updatedBy,
      },
    });
    this.logger.debug(`Registered prompt ${entity.id}`);
  }

  async get(id: string): Promise<PromptEntity | null> {
    const row = await prisma.prompt_registry.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async getByName(name: string, version?: number): Promise<PromptEntity | null> {
    const where: Record<string, unknown> = { name };
    if (version !== undefined) {
      where.version = version;
    }
    if (version !== undefined) {
      const row = await prisma.prompt_registry.findFirst({ where });
      return row ? this.toEntity(row) : null;
    }
    const rows = await prisma.prompt_registry.findMany({
      where: { name },
      orderBy: { version: 'desc' },
      take: 1,
    });
    return rows.length > 0 ? this.toEntity(rows[0]!) : null;
  }

  async list(options?: PromptFindOptions): Promise<PaginatedResult<PromptEntity>> {
    const where: Record<string, unknown> = {};
    if (options?.status) where.status = options.status;
    return this.paginatedFind(where, options);
  }

  async search(query: string, options?: PromptFindOptions): Promise<PaginatedResult<PromptEntity>> {
    const where: Record<string, unknown> = {
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        { content: { contains: query } },
        { tags: { has: query } },
      ],
    };
    if (options?.status) where.status = options.status;
    return this.paginatedFind(where, options);
  }

  async delete(id: string): Promise<void> {
    await prisma.prompt_registry.delete({ where: { id } });
  }

  private async paginatedFind(
    where: Record<string, unknown>,
    options?: PromptFindOptions,
  ): Promise<PaginatedResult<PromptEntity>> {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    const [items, total] = await Promise.all([
      prisma.prompt_registry.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.prompt_registry.count({ where }),
    ]);
    return {
      items: items.map((r) => this.toEntity(r)),
      total,
      offset,
      limit,
    };
  }

  private toEntity(r: {
    id: string;
    name: string;
    description: string;
    content: string;
    variables: string[];
    version: number;
    status: string;
    tags: string[];
    created_by: string;
    updated_by: string | null;
    created_at: Date;
    updated_at: Date;
  }): PromptEntity {
    const metadata: Metadata = {
      createdBy: r.created_by,
      updatedBy: r.updated_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
    return PromptEntity.reconstitute(
      r.id,
      r.name,
      r.description,
      r.content,
      r.variables,
      r.version,
      r.status as PromptStatus,
      r.tags,
      metadata,
      r.created_at,
      r.updated_at,
    );
  }
}
