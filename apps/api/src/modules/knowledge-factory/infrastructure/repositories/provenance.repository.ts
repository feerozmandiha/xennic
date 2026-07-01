import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { ProvenanceRecord } from '../../domain/provenance.entity.js';
import type { IProvenanceRepository } from '../../domain/interfaces/provenance.repository.interface.js';

@Injectable()
export class ProvenanceRepository implements IProvenanceRepository {
  async save(record: ProvenanceRecord): Promise<void> {
    const data = record.toJSON();
    await prisma.provenance_records.create({
      data: {
        id: data.id,
        knowledge_object_id: data.knowledgeObjectId,
        source_document: data.sourceDocument,
        page: data.page,
        section: data.section,
        paragraph: data.paragraph,
        chunk_id: data.chunkId,
        pipeline_version: data.pipelineVersion,
        parser_version: data.parserVersion,
        embedding_version: data.embeddingVersion,
        citation_chain: data.citationChain,
        trace_id: data.traceId,
      },
    });
  }

  async findByKnowledgeObjectId(knowledgeObjectId: string): Promise<ProvenanceRecord[]> {
    const rows = await prisma.provenance_records.findMany({
      where: { knowledge_object_id: knowledgeObjectId },
      orderBy: { created_at: 'asc' },
    });
    return rows.map(this.toEntity);
  }

  async findByTraceId(traceId: string): Promise<ProvenanceRecord[]> {
    const rows = await prisma.provenance_records.findMany({
      where: { trace_id: traceId },
      orderBy: { created_at: 'asc' },
    });
    return rows.map(this.toEntity);
  }

  async findByChunkId(chunkId: string): Promise<ProvenanceRecord | null> {
    const row = await prisma.provenance_records.findFirst({
      where: { chunk_id: chunkId },
    });
    return row ? this.toEntity(row) : null;
  }

  private toEntity(row: any): ProvenanceRecord {
    return ProvenanceRecord.reconstitute({
      id: row.id,
      knowledgeObjectId: row.knowledge_object_id,
      sourceDocument: row.source_document ?? undefined,
      page: row.page ?? undefined,
      section: row.section ?? undefined,
      paragraph: row.paragraph ?? undefined,
      chunkId: row.chunk_id ?? undefined,
      pipelineVersion: row.pipeline_version ?? undefined,
      parserVersion: row.parser_version ?? undefined,
      embeddingVersion: row.embedding_version ?? undefined,
      citationChain: row.citation_chain as any[],
      traceId: row.trace_id ?? undefined,
      createdAt: row.created_at,
    });
  }
}
