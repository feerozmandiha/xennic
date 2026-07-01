import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import type { QdrantFilter, SearchResult } from '../../domain/chunk.types.js';

export interface PointStruct {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
}

const DEFAULT_QDRANT_URL = 'http://localhost:6333';
const COLLECTION_PREFIX = 'xennic';
const VECTOR_SIZE = 1536;
const DISTANCE: 'Cosine' = 'Cosine';

@Injectable()
export class QdrantService {
  private readonly logger = new Logger(QdrantService.name);
  private readonly client: QdrantClient;

  constructor() {
    const url = process.env['QDRANT_URL'] ?? DEFAULT_QDRANT_URL;
    this.client = new QdrantClient({ url });
  }

  private collectionName(workspaceId: string): string {
    return `${COLLECTION_PREFIX}_${workspaceId}_knowledge`;
  }

  private connected = false;

  async onModuleInit() {
    if (process.env['SKIP_INFRA_CONNECT'] === 'true') return;
    this.connected = await this.healthCheck();
    if (this.connected) {
      this.logger.log('Qdrant connected');
    } else {
      this.logger.warn('Qdrant not available — vector search disabled');
    }
  }

  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error('Qdrant is not connected');
    }
  }

  async ensureCollection(workspaceId: string): Promise<void> {
    this.ensureConnected();
    const name = this.collectionName(workspaceId);

    try {
      const exists = await this.client.collectionExists(name);
      if (exists.exists) {
        this.logger.debug(`Collection ${name} already exists`);
        return;
      }
    } catch {
      // collectionExists may throw if Qdrant is unreachable — proceed to create
    }

    try {
      await this.client.createCollection(name, {
        vectors: {
          size: VECTOR_SIZE,
          distance: DISTANCE,
        },
      });
      this.logger.log(`Created collection ${name}`);

      await this.client.createPayloadIndex(name, {
        field_name: 'workspaceId',
        field_schema: 'keyword',
      });
      await this.client.createPayloadIndex(name, {
        field_name: 'docId',
        field_schema: 'keyword',
      });
      await this.client.createPayloadIndex(name, {
        field_name: 'chunkType',
        field_schema: 'keyword',
      });
    } catch (err) {
      this.logger.error(`Failed to create collection ${name}: ${(err as Error).message}`);
      throw err;
    }
  }

  async upsertPoints(workspaceId: string, points: PointStruct[]): Promise<void> {
    const name = this.collectionName(workspaceId);
    await this.ensureCollection(workspaceId);

    const formatted = points.map((p) => ({
      id: p.id,
      vector: p.vector,
      payload: p.payload,
    }));

    try {
      await this.client.upsert(name, {
        points: formatted,
        wait: true,
      });
      this.logger.debug(`Upserted ${points.length} points to ${name}`);
    } catch (err) {
      this.logger.error(`Failed to upsert points to ${name}: ${(err as Error).message}`);
      throw err;
    }
  }

  async search(
    workspaceId: string,
    query: number[],
    filter?: QdrantFilter,
    limit = 10,
  ): Promise<SearchResult[]> {
    const name = this.collectionName(workspaceId);
    await this.ensureCollection(workspaceId);

    try {
      const result = await this.client.query(name, {
        query,
        filter: filter as Record<string, unknown> | undefined,
        limit,
        with_payload: true,
      });

      return result.points.map((p) => ({
        chunkId: String(p.id),
        score: p.score ?? 0,
        payload: (p.payload as Record<string, unknown>) ?? {},
      }));
    } catch (err) {
      this.logger.error(`Search failed on ${name}: ${(err as Error).message}`);
      throw err;
    }
  }

  async deletePoints(workspaceId: string, ids: string[]): Promise<void> {
    const name = this.collectionName(workspaceId);

    try {
      await this.client.delete(name, {
        points: ids,
        wait: true,
      });
      this.logger.debug(`Deleted ${ids.length} points from ${name}`);
    } catch (err) {
      this.logger.error(`Failed to delete points from ${name}: ${(err as Error).message}`);
      throw err;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.getCollections();
      return result.collections !== undefined;
    } catch {
      return false;
    }
  }
}
