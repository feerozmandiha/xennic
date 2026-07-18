import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { ContextScope } from '../../../shared/types/index.js';
import { ContextEntity } from '../../domain/context.entity.js';
import type {
  IContextRepository,
  FindByScopeOptions,
} from '../../domain/context-repository.interface.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

@Injectable()
export class PrismaContextStore implements IContextRepository {
  private readonly logger = new Logger(PrismaContextStore.name);

  async save(entity: ContextEntity): Promise<void> {
    await prisma.context_cache.upsert({
      where: { id: entity.id },
      update: {
        scope: entity.scope,
        scope_id: entity.scopeId,
        source: entity.source,
        key: entity.key,
        value: entity.value as Record<string, unknown>,
        version: entity.version,
        created_by: entity.createdBy,
      },
      create: {
        id: entity.id,
        workspace_id: null,
        scope: entity.scope,
        scope_id: entity.scopeId,
        source: entity.source,
        key: entity.key,
        value: entity.value as Record<string, unknown>,
        version: entity.version,
        created_by: entity.createdBy,
      },
    });
    this.logger.debug(`Saved context entity ${entity.id}`);
  }

  async findById(id: string): Promise<ContextEntity | null> {
    const row = await prisma.context_cache.findUnique({ where: { id } });
    if (!row) return null;
    return ContextEntity.reconstitute(
      row.id,
      row.scope as ContextScope,
      row.scope_id,
      row.source,
      row.key,
      row.value as Record<string, unknown>,
      row.version,
      row.created_at,
      row.created_by,
    );
  }

  async findByScope(
    scope: ContextScope,
    scopeId: string,
    options?: FindByScopeOptions,
  ): Promise<PaginatedResult<ContextEntity>> {
    const where = { scope, scope_id: scopeId };
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    const [items, total] = await Promise.all([
      prisma.context_cache.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.context_cache.count({ where }),
    ]);
    return {
      items: items.map((r) =>
        ContextEntity.reconstitute(
          r.id,
          r.scope as ContextScope,
          r.scope_id,
          r.source,
          r.key,
          r.value as Record<string, unknown>,
          r.version,
          r.created_at,
          r.created_by,
        ),
      ),
      total,
      offset,
      limit,
    };
  }

  async findBySource(
    scope: ContextScope,
    scopeId: string,
    source: string,
  ): Promise<ContextEntity[]> {
    const rows = await prisma.context_cache.findMany({
      where: { scope, scope_id: scopeId, source },
    });
    return rows.map((r) =>
      ContextEntity.reconstitute(
        r.id,
        r.scope as ContextScope,
        r.scope_id,
        r.source,
        r.key,
        r.value as Record<string, unknown>,
        r.version,
        r.created_at,
        r.created_by,
      ),
    );
  }

  async findKeys(scope: ContextScope, scopeId: string, keys: string[]): Promise<ContextEntity[]> {
    const rows = await prisma.context_cache.findMany({
      where: { scope, scope_id: scopeId, key: { in: keys } },
    });
    return rows.map((r) =>
      ContextEntity.reconstitute(
        r.id,
        r.scope as ContextScope,
        r.scope_id,
        r.source,
        r.key,
        r.value as Record<string, unknown>,
        r.version,
        r.created_at,
        r.created_by,
      ),
    );
  }

  async delete(id: string): Promise<void> {
    await prisma.context_cache.delete({ where: { id } });
  }

  async deleteByScope(scope: ContextScope, scopeId: string): Promise<void> {
    await prisma.context_cache.deleteMany({
      where: { scope, scope_id: scopeId },
    });
  }
}
