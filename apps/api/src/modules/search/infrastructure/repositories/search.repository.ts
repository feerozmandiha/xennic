import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { ISearchRepository } from '../../domain/interfaces/search.repository.interface.js';
import {
  SearchResultEntity,
  SearchResultType,
  SearchQuery,
  SearchResults,
} from '../../domain/entities/search-result.entity.js';

@Injectable()
export class SearchRepository implements ISearchRepository {
  async search(query: SearchQuery): Promise<SearchResults> {
    const q = query.query;
    if (!q || q.length < 2) return { items: [], total: 0 };

    const like = `%${q}%`;
    const limit = query.limit ?? 5;
    const offset = query.offset ?? 0;
    const types = query.types;

    const queries: Promise<{ type: SearchResultType; items: SearchResultEntity[] }>[] = [];

    if (!types || types.includes('project')) {
      queries.push(this._searchProjects(like, query.workspaceId, limit, offset));
    }
    if (!types || types.includes('standard')) {
      queries.push(this._searchStandards(like, limit, offset));
    }
    if (!types || types.includes('conversation')) {
      queries.push(this._searchConversations(like, query.workspaceId, limit, offset));
    }
    if (!types || types.includes('article')) {
      queries.push(this._searchArticles(like, query.workspaceId, limit, offset));
    }
    if (!types || types.includes('file')) {
      queries.push(this._searchFiles(like, query.workspaceId, limit, offset));
    }
    if (!types || types.includes('notification')) {
      queries.push(this._searchNotifications(like, query.workspaceId, limit, offset));
    }

    const results = await Promise.all(queries);

    const all = results.flatMap(r => r.items);
    return { items: all.slice(0, 25), total: all.length };
  }

  private async _searchProjects(
    q: string,
    workspaceId: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ type: 'project'; items: SearchResultEntity[] }> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, name, description, created_at
      FROM projects
      WHERE workspace_id = ${workspaceId ?? ''}
        AND deleted_at IS NULL
        AND (name ILIKE ${q} OR description ILIKE ${q})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return {
      type: 'project',
      items: rows.map(r =>
        SearchResultEntity.create({
          type: 'project',
          id: r.id,
          title: r.name,
          description: r.description ?? '',
          url: `/projects/${r.id}`,
          workspaceId: workspaceId ?? null,
          createdAt: r.created_at,
        }),
      ),
    };
  }

  private async _searchStandards(
    q: string,
    limit: number,
    offset: number,
  ): Promise<{ type: 'standard'; items: SearchResultEntity[] }> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, title, code, organization
      FROM engineering_standards
      WHERE title ILIKE ${q} OR code ILIKE ${q}
      LIMIT ${limit} OFFSET ${offset}
    `;
    return {
      type: 'standard',
      items: rows.map(r =>
        SearchResultEntity.create({
          type: 'standard',
          id: r.id,
          title: r.title,
          description: `${r.code} — ${r.organization}`,
          url: `/knowledge/standards/${r.id}`,
          workspaceId: null,
          createdAt: null,
        }),
      ),
    };
  }

  private async _searchConversations(
    q: string,
    workspaceId: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ type: 'conversation'; items: SearchResultEntity[] }> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, title, created_at
      FROM conversations
      WHERE workspace_id = ${workspaceId ?? ''}
        AND title ILIKE ${q}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return {
      type: 'conversation',
      items: rows.map(r =>
        SearchResultEntity.create({
          type: 'conversation',
          id: r.id,
          title: r.title ?? '',
          description: '',
          url: `/ai`,
          workspaceId: workspaceId ?? null,
          createdAt: r.created_at,
        }),
      ),
    };
  }

  private async _searchArticles(
    q: string,
    workspaceId: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ type: 'article'; items: SearchResultEntity[] }> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, slug, search_text, published_at
      FROM knowledge
      WHERE status = 'published'
        AND is_active = true
        AND (slug ILIKE ${q} OR search_text ILIKE ${q})
      ORDER BY published_at DESC NULLS LAST
      LIMIT ${limit} OFFSET ${offset}
    `;
    return {
      type: 'article',
      items: rows.map(r =>
        SearchResultEntity.create({
          type: 'article',
          id: r.id,
          title: r.slug,
          description: (r.search_text ?? '').substring(0, 200),
          url: `/knowledge/${r.slug}`,
          workspaceId: workspaceId ?? null,
          createdAt: r.published_at,
        }),
      ),
    };
  }

  private async _searchFiles(
    q: string,
    workspaceId: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ type: 'file'; items: SearchResultEntity[] }> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, filename, original_name, created_at
      FROM files
      WHERE workspace_id = ${workspaceId ?? ''}
        AND deleted_at IS NULL
        AND (filename ILIKE ${q} OR original_name ILIKE ${q})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return {
      type: 'file',
      items: rows.map(r =>
        SearchResultEntity.create({
          type: 'file',
          id: r.id,
          title: r.original_name ?? r.filename,
          description: r.filename,
          url: `/storage`,
          workspaceId: workspaceId ?? null,
          createdAt: r.created_at,
        }),
      ),
    };
  }

  private async _searchNotifications(
    q: string,
    workspaceId: string | undefined,
    limit: number,
    offset: number,
  ): Promise<{ type: 'notification'; items: SearchResultEntity[] }> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT n.id, n.title, n.content, n.created_at, u.workspace_id
      FROM notifications n
      JOIN users u ON u.id = n.user_id
      WHERE u.workspace_id = ${workspaceId ?? ''}
        AND (n.title ILIKE ${q} OR n.content ILIKE ${q})
      ORDER BY n.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return {
      type: 'notification',
      items: rows.map(r =>
        SearchResultEntity.create({
          type: 'notification',
          id: r.id,
          title: r.title,
          description: r.content,
          url: `/notifications`,
          workspaceId: r.workspace_id,
          createdAt: r.created_at,
        }),
      ),
    };
  }
}
