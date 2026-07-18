import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { ContextScope, PaginatedResult, Metadata } from '../../../shared/types/index.js';
import { MemoryEntity, type MemoryType } from '../../domain/memory.entity.js';
import type { IMemoryStore, FindOptions } from '../../domain/memory-store.interface.js';

@Injectable()
export class PrismaMemoryStore implements IMemoryStore {
  private readonly logger = new Logger(PrismaMemoryStore.name);

  async save(entity: MemoryEntity): Promise<void> {
    await prisma.memories.upsert({
      where: { id: entity.id },
      update: {
        type: entity.type,
        scope: entity.scope,
        scope_id: entity.scopeId,
        key: entity.key,
        value: entity.value as Record<string, unknown>,
        tags: entity.tags,
        embedding: entity.embedding ?? [],
        version: entity.version,
        created_by: entity.metadata.createdBy,
        updated_by: entity.metadata.updatedBy,
        expires_at: entity.expiresAt,
      },
      create: {
        id: entity.id,
        workspace_id: null,
        type: entity.type,
        scope: entity.scope,
        scope_id: entity.scopeId,
        key: entity.key,
        value: entity.value as Record<string, unknown>,
        tags: entity.tags,
        embedding: entity.embedding ?? [],
        version: entity.version,
        created_by: entity.metadata.createdBy,
        updated_by: entity.metadata.updatedBy,
        expires_at: entity.expiresAt,
      },
    });
    this.logger.debug(`Saved memory ${entity.id}`);
  }

  async findById(id: string): Promise<MemoryEntity | null> {
    const row = await prisma.memories.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async findByType(
    type: MemoryType,
    scope: ContextScope,
    scopeId: string,
    options?: FindOptions,
  ): Promise<PaginatedResult<MemoryEntity>> {
    const where = { type, scope, scope_id: scopeId };
    return this.paginatedFind(where, options);
  }

  async findByScope(
    scope: ContextScope,
    scopeId: string,
    options?: FindOptions,
  ): Promise<PaginatedResult<MemoryEntity>> {
    const where = { scope, scope_id: scopeId };
    return this.paginatedFind(where, options);
  }

  async search(query: string, options?: FindOptions): Promise<PaginatedResult<MemoryEntity>> {
    const where = { key: { contains: query } };
    return this.paginatedFind(where, options);
  }

  async findByTags(
    tags: string[],
    options?: FindOptions & { scope?: ContextScope; scopeId?: string },
  ): Promise<PaginatedResult<MemoryEntity>> {
    const where: Record<string, unknown> = { tags: { hasSome: tags } };
    if (options?.scope) {
      where.scope = options.scope;
      where.scope_id = options.scopeId;
    }
    return this.paginatedFind(where, options);
  }

  async delete(id: string): Promise<void> {
    await prisma.memories.delete({ where: { id } });
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.memories.deleteMany({
      where: { expires_at: { lte: new Date() } },
    });
    if (result.count > 0) {
      this.logger.log(`Deleted ${result.count} expired memory entries`);
    }
    return result.count;
  }

  async count(type?: MemoryType, scope?: ContextScope, scopeId?: string): Promise<number> {
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (scope) where.scope = scope;
    if (scopeId) where.scope_id = scopeId;
    return prisma.memories.count({ where });
  }

  private async paginatedFind(
    where: Record<string, unknown>,
    options?: FindOptions,
  ): Promise<PaginatedResult<MemoryEntity>> {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    const [items, total] = await Promise.all([
      prisma.memories.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.memories.count({ where }),
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
    type: string;
    scope: string;
    scope_id: string;
    key: string;
    value: unknown;
    tags: string[];
    embedding: number[];
    version: number;
    created_by: string;
    updated_by: string | null;
    expires_at: Date | null;
    created_at: Date;
    updated_at: Date;
  }): MemoryEntity {
    const metadata: Metadata = {
      createdBy: r.created_by,
      updatedBy: r.updated_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
    return MemoryEntity.reconstitute(
      r.id,
      r.type as MemoryType,
      r.scope as ContextScope,
      r.scope_id,
      r.key,
      r.value as Record<string, unknown>,
      r.tags,
      r.embedding.length > 0 ? r.embedding : null,
      r.version,
      metadata,
      r.expires_at,
      r.created_at,
      r.updated_at,
    );
  }
}
