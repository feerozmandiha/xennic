import { Injectable } from '@nestjs/common';
import type { FederatedSearchResult } from '../../domain/interfaces/search-source.interface.js';
import type {
  IRankingStrategy,
  RankingScore,
} from '../../domain/interfaces/search-ranking.interface.js';

@Injectable()
export class RankingStrategyService implements IRankingStrategy {
  rank(item: FederatedSearchResult, query: string): RankingScore {
    const q = query.toLowerCase();
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();

    let relevance = 0;
    if (titleLower === q) relevance = 1.0;
    else if (titleLower.includes(q)) relevance = 0.8;
    else if (descLower.includes(q)) relevance = 0.5;
    else if (q.split(/\s+/).some((w) => titleLower.includes(w))) relevance = 0.3;

    const age = item.createdAt ? Date.now() - new Date(item.createdAt).getTime() : Infinity;
    const recency = Math.max(0, 1 - age / (365 * 24 * 60 * 60 * 1000));

    const authority = (item.metadata?.authorityScore as number) ?? 0.5;
    const completeness = (item.metadata?.completenessScore as number) ?? 0.5;

    const finalScore = relevance * 0.5 + recency * 0.15 + authority * 0.2 + completeness * 0.15;

    return { relevance, recency, authority, completeness, finalScore };
  }

  merge(results: FederatedSearchResult[][], limit: number): FederatedSearchResult[] {
    const seen = new Map<string, FederatedSearchResult>();

    for (const batch of results) {
      for (const item of batch) {
        const key = `${item.source}:${item.id}`;
        if (!seen.has(key)) {
          seen.set(key, item);
        }
      }
    }

    return Array.from(seen.values()).slice(0, limit);
  }
}
