import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IKnowledgeRepository, KnowledgeSearchParams, KnowledgeSearchResult } from '../../domain/interfaces/knowledge.repository.interface.js';
import { KnowledgeEntity } from '../../domain/entities/knowledge.entity.js';

@Injectable()
export class KnowledgeRepository implements IKnowledgeRepository {
  async findById(id: string): Promise<KnowledgeEntity | null> {
    const row = await prisma.knowledge.findUnique({ where: { id } });
    if (!row) return null;
    return this._toEntity(row);
  }

  async findBySlug(workspaceId: string, slug: string): Promise<KnowledgeEntity | null> {
    const row = await prisma.knowledge.findUnique({ where: { slug } });
    if (!row || row.workspace_id !== workspaceId) return null;
    return this._toEntity(row);
  }

  async findAll(workspaceId: string, offset = 0, limit = 20, status?: string): Promise<KnowledgeEntity[]> {
    const rows = await prisma.knowledge.findMany({
      where: {
        workspace_id: workspaceId,
        is_active: true,
        ...(status ? { status } : {}),
      },
      skip: offset,
      take: limit,
      orderBy: { created_at: 'desc' },
    });
    return rows.map((r) => this._toEntity(r));
  }

  async count(workspaceId: string, status?: string): Promise<number> {
    return prisma.knowledge.count({
      where: {
        workspace_id: workspaceId,
        is_active: true,
        ...(status ? { status } : {}),
      },
    });
  }

  async search(workspaceId: string, params: KnowledgeSearchParams): Promise<KnowledgeSearchResult> {
    const where: any = {
      workspace_id: workspaceId,
      is_active: true,
    };

    if (params.status) where.status = params.status;
    if (params.visibility) where.visibility = params.visibility;
    if (params.language) where.language = params.language;
    if (params.difficulty) where.difficulty = params.difficulty;
    if (params.authorId) where.author_id = params.authorId;

    if (params.taxonomyType && params.taxonomyId) {
      where.taxonomy = {
        some: {
          taxonomy_type: params.taxonomyType,
          taxonomy_id: params.taxonomyId,
        },
      };
    }

    if (params.query) {
      return this._searchWithTsquery(workspaceId, params, where);
    }

    const [data, total] = await Promise.all([
      prisma.knowledge.findMany({
        where,
        skip: params.offset ?? 0,
        take: params.limit ?? 20,
        orderBy: { created_at: 'desc' },
      }),
      prisma.knowledge.count({ where }),
    ]);

    return {
      data: data.map((r) => this._toEntity(r)),
      total,
    };
  }

  private async _searchWithTsquery(
    workspaceId: string,
    params: KnowledgeSearchParams,
    baseWhere: any,
  ): Promise<KnowledgeSearchResult> {
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    const query = params.query!;

    const conditions: string[] = ['k.is_active = true', 'k.workspace_id = $1'];
    const values: unknown[] = [workspaceId];
    let idx = 2;

    const addParam = (val: unknown) => {
      values.push(val);
      return `$${idx++}`;
    };

    for (const col of ['status', 'visibility', 'language', 'difficulty', 'author_id'] as const) {
      if (baseWhere[col]) {
        conditions.push(`k.${col} = ${addParam(baseWhere[col])}`);
      }
    }

    const searchTsvector = `to_tsvector('simple', COALESCE(k.search_text, ''))`;
    const searchTsquery = `plainto_tsquery('simple', ${addParam(query)})`;

    const [rows, countResult] = await Promise.all([
      prisma.$queryRawUnsafe(
        `SELECT k.*
         FROM knowledge k
         WHERE ${conditions.join(' AND ')}
           AND ${searchTsvector} @@ ${searchTsquery}
         ORDER BY ts_rank(${searchTsvector}, ${searchTsquery}) DESC,
                  k.created_at DESC
         LIMIT ${addParam(limit)}
         OFFSET ${addParam(offset)}`,
        ...values,
      ),
      prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int as count
         FROM knowledge k
         WHERE ${conditions.join(' AND ')}
           AND ${searchTsvector} @@ ${searchTsquery}`,
        ...values.slice(0, -2), // exclude limit and offset params
      ),
    ]);

    const total = Number((countResult as any[])[0]?.count ?? 0);
    return {
      data: (rows as any[]).map((r) => this._toEntity(r)),
      total,
    };
  }

  async save(entity: KnowledgeEntity): Promise<void> {
    await prisma.knowledge.upsert({
      where: { id: entity.id },
      update: {
        slug: entity.slug,
        status: entity.status,
        visibility: entity.visibility,
        language: entity.language,
        version: entity.version,
        is_active: entity.isActive,
        content: entity.content as any,
        search_text: entity.searchText,
        reading_time: entity.readingTime,
        difficulty: entity.difficulty,
        reviewer_id: entity.reviewerId,
        updated_at: entity.updatedAt,
        published_at: entity.publishedAt,
        reviewed_at: entity.reviewedAt,
        archived_at: entity.archivedAt,
      },
      create: {
        id: entity.id,
        workspace_id: entity.workspaceId,
        slug: entity.slug,
        status: entity.status,
        visibility: entity.visibility,
        language: entity.language,
        version: entity.version,
        is_active: entity.isActive,
        content: entity.content as any,
        search_text: entity.searchText,
        reading_time: entity.readingTime,
        difficulty: entity.difficulty,
        author_id: entity.authorId,
        reviewer_id: entity.reviewerId,
        created_at: entity.createdAt,
        updated_at: entity.updatedAt,
        published_at: entity.publishedAt,
        reviewed_at: entity.reviewedAt,
        archived_at: entity.archivedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.knowledge.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.knowledge.count({ where: { id } });
    return count > 0;
  }

  private _toEntity(row: any): KnowledgeEntity {
    return KnowledgeEntity.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      slug: row.slug,
      status: row.status,
      visibility: row.visibility,
      language: row.language,
      version: row.version,
      isActive: row.is_active,
      content: typeof row.content === 'object' ? row.content : {},
      searchText: row.search_text ?? null,
      readingTime: row.reading_time ?? null,
      difficulty: row.difficulty ?? null,
      authorId: row.author_id ?? null,
      reviewerId: row.reviewer_id ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at ?? null,
      reviewedAt: row.reviewed_at ?? null,
      archivedAt: row.archived_at ?? null,
    });
  }
}
