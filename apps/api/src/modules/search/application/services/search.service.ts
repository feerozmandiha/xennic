import { Injectable, Inject } from '@nestjs/common';
import { SEARCH_REPOSITORY } from '../../domain/interfaces/search.repository.interface.js';
import type { ISearchRepository } from '../../domain/interfaces/search.repository.interface.js';
import type {
  SearchQuery,
  SearchResultEntity,
  SearchResults,
  SearchResultType,
} from '../../domain/entities/search-result.entity.js';

export type { SearchResultEntity, SearchResults, SearchQuery, SearchResultType };

@Injectable()
export class SearchService {
  constructor(
    @Inject(SEARCH_REPOSITORY)
    private readonly searchRepository: ISearchRepository,
  ) {}

  async search(
    query: string,
    workspaceId?: string,
    types?: string[],
  ): Promise<SearchResultEntity[]> {
    const searchQuery: SearchQuery = {
      query,
      workspaceId,
      types: types as SearchResultType[],
      limit: 5,
      offset: 0,
    };
    const results = await this.searchRepository.search(searchQuery);
    return results.items;
  }

  async searchPaginated(params: {
    query: string;
    workspaceId?: string;
    types?: string[];
    page?: number;
    limit?: number;
  }): Promise<SearchResults> {
    const { query, workspaceId, types, page = 1, limit = 10 } = params;
    const searchQuery: SearchQuery = {
      query,
      workspaceId,
      types: types as SearchResultType[],
      limit,
      offset: (page - 1) * limit,
    };
    return this.searchRepository.search(searchQuery);
  }
}
