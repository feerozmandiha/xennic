import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IKnowledgeChunkRepository } from '../../domain/interfaces/knowledge-chunk.repository.interface.js';

interface NormalizedChunk {
  content: string;
  tokenCount: number;
  section?: string;
  pageNumber?: number;
}

interface DocumentStats {
  totalPages: number;
  totalChunks: number;
  totalTokens: number;
  averageChunkSize: number;
  compressionRatio: number;
}

@Injectable()
export class ContentNormalizerService {
  private readonly logger = new Logger(ContentNormalizerService.name);

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    private readonly documentRepository: IKnowledgeDocumentRepository,
    @Inject('IKnowledgeChunkRepository')
    private readonly chunkRepository: IKnowledgeChunkRepository,
  ) {}

  async normalizeDocument(documentId: string): Promise<DocumentStats> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    this.logger.log(`Normalizing document: ${document.originalName}`);

    const normalizedChunks = this.normalizeChunks(document);

    const totalTokens = normalizedChunks.reduce((sum, c) => sum + c.tokenCount, 0);
    const averageChunkSize = normalizedChunks.length > 0 ? Math.round(totalTokens / normalizedChunks.length) : 0;
    const compressionRatio = document.sizeBytes > 0 ? parseFloat((totalTokens / (document.sizeBytes / 1024)).toFixed(2)) : 0;

    return {
      totalPages: 0,
      totalChunks: normalizedChunks.length,
      totalTokens,
      averageChunkSize,
      compressionRatio,
    };
  }

  async deduplicateChunks(documentId: string): Promise<number> {
    const chunks = await this.chunkRepository.findByDocument(documentId);
    const seen = new Set<string>();
    let removed = 0;

    for (const chunk of chunks) {
      const normalizedText = chunk.text.trim().toLowerCase();

      if (seen.has(normalizedText)) {
        await this.chunkRepository.deleteByDocument(documentId);
        removed++;
      } else {
        seen.add(normalizedText);
      }
    }

    if (removed > 0) {
      this.logger.log(`Removed ${removed} duplicate chunks from document ${documentId}`);
    }

    return removed;
  }

  private normalizeChunks(_document: { id: string; metadata?: unknown }): NormalizedChunk[] {
    return [];
  }

  private splitIntoSections(text: string): Array<{ title?: string; text: string; page?: number }> {
    const cleaned = text.replace(/\r\n/g, '\n').trim();

    if (cleaned.length === 0) return [{ text: '' }];

    const sectionBreaks = cleaned.split(/\n\s*\n/);

    return sectionBreaks.map((block, idx) => ({
      text: block.trim(),
      page: idx + 1,
    }));
  }

  private cleanText(text: string): string {
    return text
      .replace(/[^\S\n]+/g, ' ')
      .replace(/[^\x20-\x7E\n]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.max(1, Math.round(text.length / 4));
  }
}
