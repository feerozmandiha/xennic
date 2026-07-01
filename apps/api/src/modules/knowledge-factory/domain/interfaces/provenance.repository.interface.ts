import type { ProvenanceRecord } from '../provenance.entity.js';

export interface IProvenanceRepository {
  save(record: ProvenanceRecord): Promise<void>;
  findByKnowledgeObjectId(knowledgeObjectId: string): Promise<ProvenanceRecord[]>;
  findByTraceId(traceId: string): Promise<ProvenanceRecord[]>;
  findByChunkId(chunkId: string): Promise<ProvenanceRecord | null>;
}
