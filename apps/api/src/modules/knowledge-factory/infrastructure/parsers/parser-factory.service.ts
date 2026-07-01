import { Injectable, BadRequestException } from '@nestjs/common';
import type { ParserService } from './parsed-content.type.js';
import { PdfParserService } from './pdf-parser.service.js';
import { DocxParserService } from './docx-parser.service.js';
import { MarkdownParserService } from './markdown-parser.service.js';
import { isAllowedMimeType } from '../../application/utils/mime-validator.js';

@Injectable()
export class ParserFactoryService {
  private readonly parsers: Record<string, ParserService>;

  constructor(
    private readonly pdfParser: PdfParserService,
    private readonly docxParser: DocxParserService,
    private readonly markdownParser: MarkdownParserService,
  ) {
    this.parsers = {
      'application/pdf': this.pdfParser,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': this.docxParser,
      'text/markdown': this.markdownParser,
      'text/plain': this.markdownParser,
    };
  }

  getParser(mimeType: string): ParserService {
    if (!isAllowedMimeType(mimeType)) {
      throw new BadRequestException(`No parser available for MIME type: ${mimeType}`);
    }
    const parser = this.parsers[mimeType];
    if (!parser) {
      throw new BadRequestException(`No parser available for MIME type: ${mimeType}`);
    }
    return parser;
  }
}
