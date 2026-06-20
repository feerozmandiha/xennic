export type SearchResultType =
  | 'project'
  | 'standard'
  | 'conversation'
  | 'article'
  | 'file'
  | 'notification';

export class SearchResultEntity {
  constructor(
    public readonly type: SearchResultType,
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly url: string,
    public readonly workspaceId: string | null,
    public readonly createdAt: Date | null,
  ) {}

  static create(data: {
    type: SearchResultType;
    id: string;
    title: string;
    description: string;
    url: string;
    workspaceId: string | null;
    createdAt?: Date | null;
  }): SearchResultEntity {
    return new SearchResultEntity(
      data.type,
      data.id,
      data.title,
      data.description,
      data.url,
      data.workspaceId,
      data.createdAt ?? null,
    );
  }
}

export interface SearchQuery {
  query: string;
  workspaceId?: string;
  types?: SearchResultType[];
  limit?: number;
  offset?: number;
}

export interface SearchResults {
  items: SearchResultEntity[];
  total: number;
}
