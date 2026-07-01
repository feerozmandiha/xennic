import { Injectable, Inject, Logger } from '@nestjs/common';
import type { EmbeddingService } from './embedding.service.js';
import type { QdrantService } from '../../infrastructure/embeddings/qdrant.service.js';
import type { SearchOptions, SearchResponse, SearchResultItem, Citation } from '../../domain/search.types.js';
import type { QdrantFilter } from '../../domain/chunk.types.js';

export const EMBEDDING_SERVICE = 'IEmbeddingService';
export const QDRANT_SERVICE = 'IQdrantService';
export const SEARCH_REPOSITORY = 'ISearchRepository';

export interface IEmbeddingService {
  generateEmbedding(text: string): Promise<number[]>;
}

export interface IQdrantService {
  search(
    workspaceId: string,
    query: number[],
    filter?: QdrantFilter,
    limit?: number,
  ): Promise<{ chunkId: string; score: number; payload: Record<string, unknown> }[]>;
}

export interface KeywordSearchResult {
  id: string;
  documentId: string;
  documentName: string;
  excerpt: string;
  score: number;
  metadata: Record<string, unknown>;
  sourceType: string;
}

export interface ISearchRepository {
  keywordSearch(
    workspaceId: string,
    query: string,
    options: { limit: number; types?: string[]; filters?: Record<string, unknown> },
  ): Promise<KeywordSearchResult[]>;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private static readonly RRF_K = 60;

  constructor(
    @Inject(EMBEDDING_SERVICE)
    private readonly embeddingService: IEmbeddingService,
    @Inject(QDRANT_SERVICE)
    private readonly qdrantService: IQdrantService,
    @Inject(SEARCH_REPOSITORY)
    private readonly searchRepository: ISearchRepository,
  ) {}

  async search(
    workspaceId: string,
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResponse> {
    const start = Date.now();
    const limit = options?.limit ?? 10;
    const offset = options?.offset ?? 0;
    const minScore = options?.minScore ?? 0;

    const embedding = await this.embeddingService.generateEmbedding(query);
    const effectiveLimit = limit + offset;

    const qdrantFilter = this.buildQdrantFilter(options);
    const [vectorResults, keywordResults] = await Promise.all([
      this.qdrantService.search(workspaceId, embedding, qdrantFilter, effectiveLimit),
      this.searchRepository.keywordSearch(workspaceId, query, {
        limit: effectiveLimit,
        types: options?.types,
        filters: options?.filters,
      }),
    ]);

    const merged = this.mergeResults(vectorResults, keywordResults, offset, limit);
    const results = merged
      .filter(item => item.score >= minScore)
      .slice(0, limit)
      .map(item => ({
        ...item,
        confidence: this.calculateConfidence(item.score),
        citation: this.generateCitation(item),
      }));

    return {
      results,
      total: Math.max(vectorResults.length, keywordResults.length),
      query,
      took: Date.now() - start,
    };
  }

  private buildQdrantFilter(options?: SearchOptions): QdrantFilter | undefined {
    const clauses: QdrantFilter[] = [];

    const firstType = options?.types?.[0];
    if (firstType) {
      clauses.push({
        key: 'sourceType',
        match: { value: firstType },
      });
    }

    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (typeof value === 'string') {
          clauses.push({ key, match: { value } });
        } else if (typeof value === 'number') {
          clauses.push({ key, range: { gte: value, lte: value } });
        }
      }
    }

    return clauses.length > 0 ? { must: clauses } : undefined;
  }

  private mergeResults(
    vector: { chunkId: string; score: number; payload: Record<string, unknown> }[],
    keyword: KeywordSearchResult[],
    offset: number,
    limit: number,
  ): SearchResultItem[] {
    const rrfScores = new Map<string, { item: SearchResultItem; score: number }>();

    vector.forEach((v, i) => {
      const id = v.chunkId;
      const existing = rrfScores.get(id);
      const rrfScore = 1 / (SearchService.RRF_K + i);

      if (existing) {
        existing.score += rrfScore;
      } else {
        rrfScores.set(id, {
          item: {
            chunkId: v.chunkId,
            documentId: (v.payload.documentId as string) ?? (v.payload.docId as string) ?? '',
            documentName: (v.payload.documentName as string) ?? (v.payload.filename as string) ?? 'Unknown',
            excerpt: (v.payload.content as string) ?? (v.payload.excerpt as string) ?? '',
            score: v.score,
            confidence: 0,
            metadata: v.payload,
            sourceType: (v.payload.sourceType as string) ?? 'unknown',
            citation: null!,
          },
          score: rrfScore,
        });
      }
    });

    keyword.forEach((k, i) => {
      const id = k.id;
      const existing = rrfScores.get(id);
      const rrfScore = 1 / (SearchService.RRF_K + i);

      if (existing) {
        existing.score += rrfScore;
      } else {
        rrfScores.set(id, {
          item: {
            chunkId: k.id,
            documentId: k.documentId,
            documentName: k.documentName,
            excerpt: k.excerpt,
            score: k.score,
            confidence: 0,
            metadata: k.metadata,
            sourceType: k.sourceType,
            citation: null!,
          },
          score: rrfScore,
        });
      }
    });

    const sorted = Array.from(rrfScores.values())
      .sort((a, b) => b.score - a.score);

    return sorted.slice(offset, offset + limit).map(entry => ({
      ...entry.item,
      score: entry.score,
    }));
  }

  private calculateConfidence(score: number): number {
    if (score <= 0) return 0;
    if (score >= 1) return 1;
    return Math.min(1, Math.max(0, (score - 0.1) / 0.9));
  }

  private generateCitation(item: SearchResultItem): Citation {
    return {
      sourceDocumentName: item.documentName,
      chunkTextExcerpt: item.excerpt.length > 200
        ? item.excerpt.slice(0, 200) + '...'
        : item.excerpt,
      pageReference: item.metadata?.pageNumber != null
        ? String(item.metadata.pageNumber)
        : (item.metadata?.pageReference as string) ?? null,
      relevanceScore: item.score,
    };
  }
}
