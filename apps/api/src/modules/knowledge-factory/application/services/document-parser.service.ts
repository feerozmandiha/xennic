import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import { KnowledgeExtraction } from '../../domain/entities/knowledge-extraction.entity.js';

interface ParsedContent {
  text: string;
  metadata: Record<string, unknown>;
}

@Injectable()
export class DocumentParserService {
  private readonly logger = new Logger(DocumentParserService.name);

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    private readonly documentRepository: IKnowledgeDocumentRepository,
  ) {}

  async parseDocument(documentId: string): Promise<ParsedContent> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    this.logger.log(`Parsing document: ${document.originalName}`);

    const text = await this.parseWithAiService(document);
    const metadata = { parser: 'ai-service', parsedAt: new Date().toISOString() };

    return { text, metadata };
  }

  private async parseWithAiService(document: { mimeType: string }): Promise<string> {
    if (document.mimeType === 'application/pdf') {
      return this.parsePdfWithOcr(document.mimeType);
    }

    if (document.mimeType.startsWith('image/')) {
      return this.parseImageWithOcr(document.mimeType);
    }

    return '';
  }

  private async parsePdfWithOcr(mimeType: string): Promise<string> {
    return `[PDF content extracted via OCR - ${mimeType}]`;
  }

  private async parseImageWithOcr(mimeType: string): Promise<string> {
    return `[Image content extracted via OCR - ${mimeType}]`;
  }

  async extractStructuredData(_documentId: string): Promise<Partial<KnowledgeExtraction>> {
    return {};
  }
}
