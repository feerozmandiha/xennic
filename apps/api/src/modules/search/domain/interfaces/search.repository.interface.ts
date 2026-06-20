import { SearchQuery, SearchResults } from '../entities/search-result.entity.js';

export const SEARCH_REPOSITORY = 'ISearchRepository';

export interface ISearchRepository {
  search(query: SearchQuery): Promise<SearchResults>;
}
