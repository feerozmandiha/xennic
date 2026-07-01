import type { CacheOptions, CacheEntry, CacheStats, SemanticCacheEntry, EmbeddingCacheEntry, QueryCacheEntry, OntologyCacheEntry, MetadataCacheEntry, ResponseCacheEntry } from '../types/cache.types.js';

export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
  stats(): Promise<CacheStats>;
}

export interface ISemanticCache extends ICacheProvider {
  findBySimilarity(query: string, embedding: number[], minSimilarity: number): Promise<SemanticCacheEntry | null>;
  store(entry: SemanticCacheEntry): Promise<void>;
}

export interface IEmbeddingCache extends ICacheProvider {
  getEmbedding(text: string, model: string): Promise<number[] | null>;
  storeEmbedding(entry: EmbeddingCacheEntry): Promise<void>;
}

export interface IQueryCache extends ICacheProvider {
  findByHash(hash: string): Promise<QueryCacheEntry | null>;
  storeQuery(entry: QueryCacheEntry): Promise<void>;
}

export interface IOntologyCache extends ICacheProvider {
  getRelationships(concept: string): Promise<string[] | null>;
  storeRelationships(concept: string, relationships: string[]): Promise<void>;
}

export interface IMetadataCache extends ICacheProvider {
  getMetadata(entityId: string, entityType: string): Promise<Record<string, unknown> | null>;
  storeMetadata(entry: MetadataCacheEntry): Promise<void>;
}

export interface IResponseCache extends ICacheProvider {
  getResponse(requestHash: string): Promise<ResponseCacheEntry | null>;
  storeResponse(entry: ResponseCacheEntry): Promise<void>;
}
