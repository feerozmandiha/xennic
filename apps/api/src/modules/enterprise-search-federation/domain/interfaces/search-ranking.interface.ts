export const IRANKING_STRATEGY = 'IRankingStrategy' as const;

export interface RankingScore {
  relevance: number;
  recency: number;
  authority: number;
  completeness: number;
  finalScore: number;
}

export interface IRankingStrategy {
  rank(item: FederatedSearchResult, query: string): RankingScore;
  merge(results: FederatedSearchResult[][], limit: number): FederatedSearchResult[];
}

import type { FederatedSearchResult } from './search-source.interface.js';
