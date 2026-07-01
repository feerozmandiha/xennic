export interface QdrantPoint {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
}

export interface QdrantSearchResult {
  id: string;
  score: number;
  payload: Record<string, unknown>;
}

export interface QdrantFilter {
  must?: QdrantCondition[];
  should?: QdrantCondition[];
  must_not?: QdrantCondition[];
}

export interface QdrantCondition {
  key: string;
  match?: { value: string };
  range?: { gte?: number; lte?: number; gt?: number; lt?: number };
}

export interface IQdrantAdapter {
  ensureCollection(workspaceId: string): Promise<void>;
  upsertVector(workspaceId: string, point: QdrantPoint): Promise<void>;
  batchInsert(workspaceId: string, points: QdrantPoint[]): Promise<void>;
  deleteVector(workspaceId: string, id: string): Promise<void>;
  deleteVectors(workspaceId: string, ids: string[]): Promise<void>;
  search(workspaceId: string, vector: number[], filter?: QdrantFilter, limit?: number): Promise<QdrantSearchResult[]>;
}
