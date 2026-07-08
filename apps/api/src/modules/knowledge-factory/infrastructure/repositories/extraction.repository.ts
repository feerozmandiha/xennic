import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IExtractionRepository } from '../../domain/interfaces/extraction.repository.interface.js';
import { KnowledgeExtraction } from '../../domain/entities/knowledge-extraction.entity.js';

@Injectable()
export class ExtractionRepository implements IExtractionRepository {
  async create(entity: KnowledgeExtraction): Promise<KnowledgeExtraction> {
    const row = await prisma.knowledge_extractions.create({
      data: {
        document_id: entity.documentId,
        method: entity.method,
        text: entity.text,
        confidence: entity.confidence,
        language: entity.language,
        metadata: entity.metadata as any,
      },
    });
    return this._toEntity(row);
  }

  async findByDocument(documentId: string): Promise<KnowledgeExtraction[]> {
    const rows = await prisma.knowledge_extractions.findMany({
      where: { document_id: documentId },
      orderBy: { created_at: 'desc' },
    });
    return rows.map((r) => this._toEntity(r));
  }

  async findLatestByDocument(documentId: string): Promise<KnowledgeExtraction | null> {
    const row = await prisma.knowledge_extractions.findFirst({
      where: { document_id: documentId },
      orderBy: { created_at: 'desc' },
    });
    if (!row) return null;
    return this._toEntity(row);
  }

  private _toEntity(row: {
    id: string;
    document_id: string;
    method: string;
    text: string;
    confidence: number | null;
    language: string | null;
    metadata: unknown;
    created_at: Date;
  }): KnowledgeExtraction {
    return KnowledgeExtraction.create({
      documentId: row.document_id,
      method: row.method,
      text: row.text,
      confidence: row.confidence,
      language: row.language,
      metadata: row.metadata,
    });
  }
}
