import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HybridSearchService {
  private readonly logger = new Logger(HybridSearchService.name);

  async hybridSearch(params: {
    workspaceId: string;
    query: string;
    keywordResults?: any[];
    vectorResults?: any[];
    graphResults?: any[];
    citationResults?: any[];
    limit?: number;
  }): Promise<any[]> {
    const { keywordResults = [], vectorResults = [], graphResults = [], citationResults = [], limit = 20 } = params;

    const merged = new Map<string, { item: any; score: number; sources: string[] }>();

    const addSource = (results: any[], source: string, baseScore: number) => {
      for (const item of results) {
        const id = item.id ?? item.entityId;
        if (!merged.has(id)) {
          merged.set(id, { item, score: 0, sources: [] });
        }
        const entry = merged.get(id)!;
        entry.score += baseScore;
        entry.sources.push(source);
      }
    };

    addSource(keywordResults, 'keyword', 1.0);
    addSource(vectorResults, 'vector', 1.2);
    addSource(graphResults, 'graph', 1.5);
    addSource(citationResults, 'citation', 1.8);

    const ranked = Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry) => ({
        ...entry.item,
        hybridScore: entry.score,
        sources: entry.sources,
      }));

    return ranked;
  }
}
