import { Injectable, Logger } from '@nestjs/common';
import type { IQueryOptimizer } from '../../domain/interfaces/performance-interfaces.js';
import type { QueryOptimizationHint } from '../../domain/types/performance.types.js';

@Injectable()
export class QueryOptimizerService implements IQueryOptimizer {
  private readonly logger = new Logger(QueryOptimizerService.name);

  optimize(query: string, hints?: QueryOptimizationHint): string {
    let optimized = query.trim();
    if (hints?.useIndex) optimized = `/*+ INDEX(${hints.useIndex}) */ ${optimized}`;
    if (hints?.useCache === false) optimized = `/*+ NO_CACHE */ ${optimized}`;
    if (hints?.maxRows) optimized = `${optimized} LIMIT ${hints.maxRows}`;
    return optimized;
  }

  async explain(query: string): Promise<Record<string, unknown>> {
    const tables = query.match(/(?:FROM|JOIN)\s+(\w+)/gi)?.map((m) => m.split(/\s+/)[1]) ?? [];
    return {
      query, complexity: tables.length + (query.includes('WHERE') ? 2 : 0),
      tables, estimatedRows: 1000, suggestedIndexes: [],
    };
  }

  async suggestIndex(query: string): Promise<string[]> {
    const tables = query.match(/(?:FROM|JOIN)\s+(\w+)/gi)?.map((m) => m.split(/\s+/)[1]) ?? [];
    const whereCols = query.match(/WHERE\s+(\w+(?:\.\w+)?)/i);
    return tables.map((t) => `${t}_${whereCols?.[1] ?? 'idx'}`);
  }
}
