import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';

export interface FtsResult {
  id: string;
  xid: string;
  title: string;
  rank: number;
  highlight?: string;
}

@Injectable()
export class FullTextSearchService {
  private readonly logger = new Logger(FullTextSearchService.name);

  async search(
    workspaceId: string,
    query: string,
    limit = 20,
    offset = 0,
  ): Promise<{ items: FtsResult[]; total: number }> {
    const tsquery = this.buildTsQuery(query);
    if (!tsquery) return { items: [], total: 0 };

    const tsConfig = this.detectLanguage(query);

    const countResult = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*) as count FROM knowledge_objects
       WHERE workspace_id = $1
         AND status = 'active'
         AND search_text IS NOT NULL
         AND to_tsvector(${tsConfig === 'persian' ? "'persian'" : "'english'"}, search_text) @@ to_tsquery(${tsConfig === 'persian' ? "'persian'" : "'english'"}, $2)`,
      workspaceId,
      tsquery,
    );

    const total = Number(countResult[0]?.count ?? 0);

    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, xid, title,
              ts_rank(to_tsvector(${tsConfig === 'persian' ? "'persian'" : "'english'"}, search_text), to_tsquery(${tsConfig === 'persian' ? "'persian'" : "'english'"}, $2)) as rank,
              ts_headline(${tsConfig === 'persian' ? "'persian'" : "'english'"}, search_text, to_tsquery(${tsConfig === 'persian' ? "'persian'" : "'english'"}, $2), 'MaxFragments=2,MaxWords=30,MinWords=10') as highlight
       FROM knowledge_objects
       WHERE workspace_id = $1
         AND status = 'active'
         AND search_text IS NOT NULL
         AND to_tsvector(${tsConfig === 'persian' ? "'persian'" : "'english'"}, search_text) @@ to_tsquery(${tsConfig === 'persian' ? "'persian'" : "'english'"}, $2)
       ORDER BY rank DESC
       LIMIT $3 OFFSET $4`,
      workspaceId,
      tsquery,
      limit,
      offset,
    );

    const items: FtsResult[] = rows.map((r) => ({
      id: r.id,
      xid: r.xid,
      title: r.title,
      rank: Number(r.rank),
      highlight: r.highlight ?? undefined,
    }));

    return { items, total };
  }

  private buildTsQuery(query: string): string {
    const sanitized = query.replace(/[^\w\sآ-ی]/g, ' ').trim();
    if (!sanitized) return '';
    const terms = sanitized.split(/\s+/).filter(Boolean);
    return terms.map((t) => `${t}:*`).join(' & ');
  }

  private detectLanguage(text: string): 'persian' | 'english' {
    const persianRange = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return persianRange.test(text) ? 'persian' : 'english';
  }
}
