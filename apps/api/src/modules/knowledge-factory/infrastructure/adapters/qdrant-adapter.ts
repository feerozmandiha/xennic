import { Injectable, Logger } from '@nestjs/common';
import { QdrantService } from '../embeddings/qdrant.service.js';
import type { IQdrantAdapter, QdrantPoint, QdrantSearchResult, QdrantFilter } from '../../domain/interfaces/qdrant-adapter.interface.js';

@Injectable()
export class QdrantAdapter implements IQdrantAdapter {
  private readonly logger = new Logger(QdrantAdapter.name);

  constructor(private readonly qdrant: QdrantService) {}

  async ensureCollection(workspaceId: string): Promise<void> {
    await this.qdrant.ensureCollection(workspaceId);
  }

  async upsertVector(workspaceId: string, point: QdrantPoint): Promise<void> {
    await this.qdrant.upsertPoints(workspaceId, [
      { id: point.id, vector: point.vector, payload: point.payload },
    ]);
  }

  async batchInsert(workspaceId: string, points: QdrantPoint[]): Promise<void> {
    const batchSize = 100;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      await this.qdrant.upsertPoints(
        workspaceId,
        batch.map((p) => ({ id: p.id, vector: p.vector, payload: p.payload })),
      );
    }
  }

  async deleteVector(workspaceId: string, id: string): Promise<void> {
    await this.qdrant.deletePoints(workspaceId, [id]);
  }

  async deleteVectors(workspaceId: string, ids: string[]): Promise<void> {
    await this.qdrant.deletePoints(workspaceId, ids);
  }

  async search(
    workspaceId: string,
    vector: number[],
    filter?: QdrantFilter,
    limit = 10,
  ): Promise<QdrantSearchResult[]> {
    const qdrantFilter: Record<string, any> = {};
    if (filter?.must) {
      qdrantFilter.must = filter.must.map((c) => {
        if (c.match) return { key: c.key, match: c.match };
        if (c.range) return { key: c.key, range: c.range };
        return { key: c.key };
      });
    }
    if (filter?.should) {
      qdrantFilter.should = filter.should.map((c) => {
        if (c.match) return { key: c.key, match: c.match };
        if (c.range) return { key: c.key, range: c.range };
        return { key: c.key };
      });
    }
    if (filter?.must_not) {
      qdrantFilter.must_not = filter.must_not.map((c) => {
        if (c.match) return { key: c.key, match: c.match };
        if (c.range) return { key: c.key, range: c.range };
        return { key: c.key };
      });
    }

    const results = await this.qdrant.search(workspaceId, vector, qdrantFilter, limit);
    return results.map((r) => ({ id: r.chunkId, score: r.score, payload: r.payload }));
  }
}
