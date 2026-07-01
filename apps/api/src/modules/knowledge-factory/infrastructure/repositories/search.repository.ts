import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { ISearchRepository, KeywordSearchResult } from '../../application/services/search.service.js';

@Injectable()
export class SearchRepository implements ISearchRepository {
  async keywordSearch(
    workspaceId: string,
    query: string,
    options: { limit: number; types?: string[]; filters?: Record<string, unknown> },
  ): Promise<KeywordSearchResult[]> {
    const conditions: string[] = ['k.workspace_id = $1', 'k.deleted_at IS NULL'];
    const params: unknown[] = [workspaceId];
    let paramIndex = 2;

    if (query) {
      const idx = paramIndex++;
      params.push(`%${query}%`);
      conditions.push(`k.search_text ILIKE $${idx}`);
    }

    if (options.types?.length) {
      const typeConditions = options.types.map(() => {
        const idx = paramIndex++;
        return `k.content->>'sourceType' = $${idx}`;
      });
      params.push(...options.types);
      conditions.push(`(${typeConditions.join(' OR ')})`);
    }

    const where = conditions.join(' AND ');
    const limitIdx = paramIndex++;
    const offsetIdx = paramIndex++;
    params.push(options.limit, 0);

    const sql = `
      SELECT
        k.id,
        k.content->>'documentId' AS "documentId",
        COALESCE(k.content->>'originalName', k.content->>'documentName', 'Unknown') AS "documentName",
        COALESCE(k.search_text, '') AS excerpt,
        k.content AS metadata,
        k.content->>'sourceType' AS "sourceType"
      FROM knowledge k
      WHERE ${where}
      ORDER BY k.updated_at DESC
      LIMIT $${limitIdx}
      OFFSET $${offsetIdx}
    `;

    const rows = await prisma.$queryRawUnsafe<any[]>(sql, ...params);

    return rows.map((row: any) => ({
      id: row.id,
      documentId: row.documentId ?? row.id,
      documentName: row.documentName ?? 'Unknown',
      excerpt: typeof row.excerpt === 'string' ? row.excerpt.slice(0, 500) : '',
      score: 0.5,
      metadata: typeof row.metadata === 'object' ? row.metadata : {},
      sourceType: row.sourceType ?? 'unknown',
    }));
  }
}
