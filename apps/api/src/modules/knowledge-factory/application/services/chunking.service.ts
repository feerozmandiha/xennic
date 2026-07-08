import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IKnowledgeChunkRepository } from '../../domain/interfaces/knowledge-chunk.repository.interface.js';

interface Chunk {
  text: string;
  title?: string;
  pageNumber?: number;
  section?: string;
}

interface ChunkingOptions {
  chunkSize?: number;
  overlap?: number;
  respectBoundaries?: boolean;
}

interface ChunkingResult {
  documentId: string;
  chunks: Chunk[];
  processingTimeMs: number;
  stats: {
    totalChunks: number;
    totalTokens: number;
    averageChunkSize: number;
    largestChunk: number;
    smallestChunk: number;
  };
}

@Injectable()
export class ChunkingService {
  private readonly logger = new Logger(ChunkingService.name);

  private readonly defaultChunkSize = 512;
  private readonly defaultOverlap = 64;

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    private readonly documentRepository: IKnowledgeDocumentRepository,
    @Inject('IKnowledgeChunkRepository')
    private readonly chunkRepository: IKnowledgeChunkRepository,
  ) {}

  async chunkDocument(documentId: string, options: ChunkingOptions = {}): Promise<ChunkingResult> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    const text = '';
    if (!text) {
      return {
        documentId,
        chunks: [],
        processingTimeMs: 0,
        stats: { totalChunks: 0, totalTokens: 0, averageChunkSize: 0, largestChunk: 0, smallestChunk: 0 },
      };
    }

    const start = Date.now();
    const rawChunks = this.splitIntoChunks(text, {
      chunkSize: options.chunkSize ?? this.defaultChunkSize,
      overlap: options.overlap ?? this.defaultOverlap,
      respectBoundaries: options.respectBoundaries ?? true,
    });

    const chunks: Chunk[] = rawChunks.map((c, idx) => ({
      text: c.text,
      pageNumber: c.page ?? idx + 1,
      section: c.section,
    }));

    const processingTimeMs = Date.now() - start;
    const tokenCounts = chunks.map((c) => c.text.length);
    const totalTokens = tokenCounts.reduce((sum, t) => sum + t, 0);

    return {
      documentId,
      chunks,
      processingTimeMs,
      stats: {
        totalChunks: chunks.length,
        totalTokens,
        averageChunkSize: chunks.length > 0 ? Math.round(totalTokens / chunks.length) : 0,
        largestChunk: tokenCounts.length > 0 ? Math.max(...tokenCounts) : 0,
        smallestChunk: tokenCounts.length > 0 ? Math.min(...tokenCounts) : 0,
      },
    };
  }

  async generateEmbeddings(_documentId: string): Promise<number> {
    return 0;
  }

  private async extractNormalizedContent(document: { id: string }): Promise<string> {
    return `Normalized content for document ${document.id}`;
  }

  private splitIntoChunks(
    text: string,
    options: { chunkSize: number; overlap: number; respectBoundaries: boolean },
  ): Array<{ text: string; page?: number; section?: string }> {
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const chunks: Array<{ text: string; page?: number; section?: string }> = [];

    let current = '';

    for (const paragraph of paragraphs) {
      const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

      if (candidate.length > options.chunkSize && current) {
        chunks.push({ text: current.trim() });
        current = paragraph;
      } else {
        current = candidate;
      }
    }

    if (current.trim()) {
      chunks.push({ text: current.trim() });
    }

    return chunks;
  }
}
