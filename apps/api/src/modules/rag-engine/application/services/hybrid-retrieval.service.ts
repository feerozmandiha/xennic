import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IHybridRetrievalService, RetrievalOptions } from '../../domain/interfaces/hybrid-retrieval.interface.js';
import type { RagQuery, RetrievalChunk, KnowledgeTier, VersionStatus } from '../../domain/types/rag.types.js';
import type { IQdrantAdapter, QdrantFilter, QdrantCondition } from '../../../knowledge-factory/domain/interfaces/qdrant-adapter.interface.js';
import { FullTextSearchService } from '../../../knowledge-factory/application/services/fulltext-search.service.js';
import type { IOntologyRepository } from '../../../knowledge-factory/domain/interfaces/ontology.repository.interface.js';
import type { ITaxonomyRepository } from '../../../knowledge-factory/domain/interfaces/taxonomy.repository.interface.js';

@Injectable()
export class HybridRetrievalService implements IHybridRetrievalService {
  private readonly logger = new Logger(HybridRetrievalService.name);

  constructor(
    @Inject('IQdrantAdapter') private readonly qdrant: IQdrantAdapter,
    private readonly fts: FullTextSearchService,
    @Inject('IOntologyRepository') private readonly ontologyRepo: IOntologyRepository,
    @Inject('ITaxonomyRepository') private readonly taxonomyRepo: ITaxonomyRepository,
  ) {}

  async retrieve(query: RagQuery, options?: RetrievalOptions): Promise<RetrievalChunk[]> {
    const topK = options?.topK ?? 10;
    const [dense, sparse] = await Promise.all([
      this.denseSearch(query, options),
      this.sparseSearch(query, options),
    ]);
    return this.fuseResults(dense, sparse, options).slice(0, topK);
  }

  async denseSearch(query: RagQuery, options?: RetrievalOptions): Promise<RetrievalChunk[]> {
    const vector = new Array(384).fill(0);
    const filter = this.buildFilter(query);
    const results = await this.qdrant.search(query.workspaceId, vector, filter, (options?.topK ?? 10) * 2);
    return results.map((r: any) => ({
      chunkId: r.id,
      knowledgeObjectId: (r.payload.knowledgeObjectId as string) ?? '',
      content: (r.payload.text as string) ?? '',
      score: r.score,
      denseScore: r.score,
      metadata: {
        title: (r.payload.title as string) ?? '',
        xid: (r.payload.xid as string) ?? '',
        tier: (r.payload.tier as KnowledgeTier) ?? 'bronze',
        language: (r.payload.language as string) ?? 'en',
        version: (r.payload.version as number) ?? 1,
        status: (r.payload.status as VersionStatus) ?? 'active',
        authorityScore: (r.payload.authorityScore as number) ?? 0,
        taxonomy: (r.payload.taxonomy as string[]) ?? [],
        ontology: (r.payload.ontology as string[]) ?? [],
      },
      provenance: r.payload.provenance ? {
        sourceDocument: (r.payload.provenance as any).sourceDocument ?? '',
        section: (r.payload.provenance as any).section,
        page: (r.payload.provenance as any).page,
        paragraph: (r.payload.provenance as any).paragraph,
      } : undefined,
    }));
  }

  async sparseSearch(query: RagQuery, options?: RetrievalOptions): Promise<RetrievalChunk[]> {
    const limit = (options?.topK ?? 10) * 2;
    const result = await this.fts.search(query.workspaceId, query.question, limit, 0);
    return result.items.map((item) => ({
      chunkId: item.id,
      knowledgeObjectId: item.id,
      content: item.highlight ?? item.title,
      score: item.rank,
      sparseScore: item.rank,
      metadata: {
        title: item.title,
        xid: item.xid,
        tier: 'bronze' as KnowledgeTier,
        language: 'en',
        version: 1,
        status: 'active' as VersionStatus,
        authorityScore: 0,
        taxonomy: [],
        ontology: [],
      },
    }));
  }

  fuseResults(dense: RetrievalChunk[], sparse: RetrievalChunk[], options?: RetrievalOptions): RetrievalChunk[] {
    const k = options?.rrfK ?? 60;
    const denseWeight = options?.denseWeight ?? 0.5;
    const sparseWeight = options?.sparseWeight ?? 0.5;

    const allIds = new Set([...dense.map((d) => d.chunkId), ...sparse.map((s) => s.chunkId)]);
    const denseRanks = new Map(dense.map((d, i) => [d.chunkId, i + 1]));
    const sparseRanks = new Map(sparse.map((s, i) => [s.chunkId, i + 1]));

    const fused: RetrievalChunk[] = [];
    for (const id of allIds) {
      const denseRank = denseRanks.get(id) ?? dense.length + 1;
      const sparseRank = sparseRanks.get(id) ?? sparse.length + 1;
      const rrfScore = denseWeight * (1 / (k + denseRank)) + sparseWeight * (1 / (k + sparseRank));

      const denseItem = dense.find((d) => d.chunkId === id);
      const sparseItem = sparse.find((s) => s.chunkId === id);
      const base = denseItem ?? sparseItem!;
      fused.push({
        ...base,
        score: rrfScore,
        denseScore: denseItem?.denseScore,
        sparseScore: sparseItem?.sparseScore,
      });
    }

    return fused.sort((a, b) => b.score - a.score);
  }

  private buildFilter(query: RagQuery): QdrantFilter | undefined {
    const conditions: QdrantCondition[] = [];
    if (query.filters?.tiers?.length && query.filters.tiers[0]) {
      conditions.push({ key: 'tier', match: { value: query.filters.tiers[0] } });
    }
    if (query.filters?.languages?.length && query.filters.languages[0]) {
      conditions.push({ key: 'language', match: { value: query.filters.languages[0] } });
    }
    if (query.filters?.versionStatus) {
      conditions.push({ key: 'status', match: { value: query.filters.versionStatus } });
    }
    if (query.filters?.minAuthorityScore !== undefined) {
      conditions.push({ key: 'authorityScore', range: { gte: query.filters.minAuthorityScore } });
    }
    return conditions.length ? { must: conditions } : undefined;
  }
}
