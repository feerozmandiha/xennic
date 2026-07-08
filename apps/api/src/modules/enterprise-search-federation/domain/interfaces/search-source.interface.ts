export const IFEDERATED_SEARCH = 'IFederatedSearch' as const;

export interface FederatedSearchQuery {
  query: string;
  workspaceId?: string;
  sources?: string[];
  types?: string[];
  limit?: number;
  offset?: number;
  filters?: Record<string, unknown>;
}

export interface FederatedSearchResult {
  id: string;
  source: string;
  type: string;
  title: string;
  description: string;
  url: string;
  workspaceId: string | null;
  score: number;
  createdAt: string | null;
  metadata?: Record<string, unknown>;
}

export interface FederatedSearchResponse {
  items: FederatedSearchResult[];
  total: number;
  sourceCounts: Record<string, number>;
  tookMs: number;
}

export interface ISearchSource {
  readonly sourceName: string;
  readonly priority: number;
  search(query: FederatedSearchQuery): Promise<FederatedSearchResult[]>;
}

export interface IFederatedSearch {
  search(query: FederatedSearchQuery): Promise<FederatedSearchResponse>;
  registerSource(source: ISearchSource): void;
}
