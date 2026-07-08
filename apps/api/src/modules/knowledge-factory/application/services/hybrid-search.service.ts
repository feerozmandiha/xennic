import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IKnowledgeChunkRepository } from '../../domain/interfaces/knowledge-chunk.repository.interface.js';

export interface HybridSearchResult {
  documentId: string;
  chunkId?: string;
  text: string;
  score: number;
  source: 'keyword' | 'vector' | 'fusion';
  metadata: {
    documentType: string;
    standard: string;
    equipmentType: string;
    pageNumber?: number;
    section?: string;
    publishedAt?: Date;
    workspaceId: string;
  };
}

@Injectable()
export class HybridSearchService {
  private readonly logger = new Logger(HybridSearchService.name);
  private readonly aiServiceUrl: string;

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    private readonly documentRepository: IKnowledgeDocumentRepository,
    @Inject('IKnowledgeChunkRepository')
    private readonly chunkRepository: IKnowledgeChunkRepository,
  ) {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8002';
  }

  async search(query: string, workspaceId: string, options: {
    standard?: string;
    equipmentType?: string;
    domain?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ results: HybridSearchResult[]; total: number }> {
    const limit = options.limit || 20;
    const [keywordResults, vectorResults] = await Promise.all([
      this.keywordSearch(query, workspaceId, options, limit * 2),
      this.vectorSearch(query, workspaceId, options, limit * 2),
    ]);

    const fusedResults = this.reciprocalRankFusion(keywordResults, vectorResults, limit);

    return {
      results: fusedResults,
      total: fusedResults.length,
    };
  }

  private async keywordSearch(query: string, workspaceId: string, options: any, limit: number): Promise<HybridSearchResult[]> {
    try {
      const documents = await this.documentRepository.findByWorkspace(workspaceId, 0, limit);
      const results: HybridSearchResult[] = [];

      for (const doc of documents.data) {
        const chunks = await this.chunkRepository.findByDocument(doc.id);
        for (const chunk of chunks) {
          const score = this.bm25Score(query, chunk.text);
          if (score > 0) {
            results.push({
              documentId: doc.id,
              chunkId: chunk.id,
              text: chunk.text,
              score,
              source: 'keyword',
              metadata: {
                documentType: doc.documentType,
                standard: (doc.classification as any)?.standard || '',
                equipmentType: (doc.classification as any)?.equipmentType || '',
                pageNumber: chunk.pageNumber || undefined,
                section: chunk.section || undefined,
                publishedAt: doc.updatedAt,
                workspaceId: doc.workspaceId,
              },
            });
          }
        }
      }

      return results.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      this.logger.warn(`Keyword search failed: ${error instanceof Error ? error.message : 'unknown'}`);
      return [];
    }
  }

  private async vectorSearch(query: string, workspaceId: string, options: any, limit: number): Promise<HybridSearchResult[]> {
    try {
      const response = await fetch(`${this.aiServiceUrl}/rag/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          workspace_id: workspaceId,
          collection: 'knowledge_factory',
          limit,
          score_threshold: 0.5,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`Vector search failed: ${response.status}`);
      }

      const data = await response.json() as { results: Array<{ id: string; score: number; metadata: any; text: string }> };
      return data.results.map((r) => ({
        documentId: r.metadata.documentId || r.id,
        chunkId: r.id,
        text: r.text,
        score: r.score,
        source: 'vector' as const,
        metadata: {
          documentType: r.metadata.documentType || '',
          standard: r.metadata.standard || '',
          equipmentType: r.metadata.equipmentType || '',
          pageNumber: r.metadata.pageNumber,
          section: r.metadata.section,
          publishedAt: r.metadata.publishedAt ? new Date(r.metadata.publishedAt) : undefined,
          workspaceId: r.metadata.workspaceId || workspaceId,
        },
      }));
    } catch (error) {
      this.logger.warn(`Vector search failed: ${error instanceof Error ? error.message : 'unknown'}`);
      return [];
    }
  }

  private bm25Score(query: string, text: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const textLower = text.toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
      const matches = (textLower.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      score += matches;
    }
    return score;
  }

  private reciprocalRankFusion(
    keywordResults: HybridSearchResult[],
    vectorResults: HybridSearchResult[],
    limit: number,
    k: number = 60,
  ): HybridSearchResult[] {
    const scores = new Map<string, { result: HybridSearchResult; score: number }>();
    const seen = new Map<string, HybridSearchResult>();

    keywordResults.forEach((r, idx) => {
      const key = r.chunkId || r.documentId;
      const rrfScore = 1 / (k + idx + 1);
      scores.set(key, { result: r, score: (scores.get(key)?.score || 0) + rrfScore });
      seen.set(key, r);
    });

    vectorResults.forEach((r, idx) => {
      const key = r.chunkId || r.documentId;
      const rrfScore = 1 / (k + idx + 1);
      const existing = scores.get(key);
      if (existing) {
        existing.score += rrfScore;
        existing.result.source = 'fusion';
      } else {
        scores.set(key, { result: { ...r, source: 'fusion' as const }, score: rrfScore });
      }
      seen.set(key, r);
    });

    const sorted = Array.from(scores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return sorted.map((item) => ({
      ...item.result,
      score: item.score,
    }));
  }
}
