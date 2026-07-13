import { Injectable, Logger } from '@nestjs/common';
import type {
  IFederatedSearch,
  ISearchSource,
  FederatedSearchQuery,
  FederatedSearchResponse,
  FederatedSearchResult,
} from '../../domain/interfaces/search-source.interface.js';

@Injectable()
export class FederatedSearchService implements IFederatedSearch {
  private readonly logger = new Logger(FederatedSearchService.name);
  private readonly sources: ISearchSource[] = [];

  registerSource(source: ISearchSource): void {
    this.sources.push(source);
    this.sources.sort((a, b) => a.priority - b.priority);
    this.logger.log(`Registered search source: ${source.sourceName} (priority ${source.priority})`);
  }

  async search(query: FederatedSearchQuery): Promise<FederatedSearchResponse> {
    const startTime = Date.now();
    const sources = query.sources
      ? this.sources.filter((s) => query.sources!.includes(s.sourceName))
      : this.sources;

    if (sources.length === 0) {
      return { items: [], total: 0, sourceCounts: {}, tookMs: 0 };
    }

    const results = await Promise.allSettled(sources.map((source) => source.search(query)));

    const allItems: FederatedSearchResult[] = [];
    const sourceCounts: Record<string, number> = {};

    results.forEach((result, idx) => {
      const sourceName = sources[idx]!.sourceName;
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
        sourceCounts[sourceName] = result.value.length;
      } else {
        this.logger.error(`Search source ${sourceName} failed: ${result.reason}`);
        sourceCounts[sourceName] = 0;
      }
    });

    const ranked = this._rankAndMerge(allItems, query.query, query.limit ?? 20);
    const tookMs = Date.now() - startTime;

    this.logger.debug(
      `Federated search "${query.query}": ${ranked.length} results from ${sources.length} sources in ${tookMs}ms`,
    );

    return {
      items: ranked,
      total: ranked.length,
      sourceCounts,
      tookMs,
    };
  }

  private _rankAndMerge(
    items: FederatedSearchResult[],
    query: string,
    limit: number,
  ): FederatedSearchResult[] {
    const seen = new Set<string>();
    const unique: FederatedSearchResult[] = [];

    const scored = items
      .map((item) => ({ item, score: this._calculateScore(item, query) }))
      .sort((a, b) => b.score - a.score);

    for (const { item } of scored) {
      const key = item.id;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
      if (unique.length >= limit) break;
    }

    return unique;
  }

  private _calculateScore(item: FederatedSearchResult, query: string): number {
    const q = query.toLowerCase();
    let score = 0;

    const titleLower = item.title.toLowerCase();
    if (titleLower === q) score += 100;
    else if (titleLower.startsWith(q)) score += 80;
    else if (titleLower.includes(q)) score += 60;

    const descLower = item.description.toLowerCase();
    if (descLower.includes(q)) score += 30;

    const qWords = q.split(/\s+/);
    for (const word of qWords) {
      if (titleLower.includes(word)) score += 10;
      if (descLower.includes(word)) score += 5;
    }

    score += Math.max(0, 1 - (item.score ?? 0));
    score += item.source === 'knowledge-graph' ? 15 : 0;

    return score;
  }
}
