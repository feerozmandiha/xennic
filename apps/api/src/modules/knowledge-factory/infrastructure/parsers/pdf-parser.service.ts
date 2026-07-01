import { Injectable, Logger } from '@nestjs/common';
import type { ParsedContent, ParserService } from './parsed-content.type.js';

@Injectable()
export class PdfParserService implements ParserService {
  private readonly logger = new Logger(PdfParserService.name);

  async parse(buffer: Buffer): Promise<ParsedContent> {
    const { PDFParse } = await import('pdf-parse');
    const pdf = new PDFParse({ data: new Uint8Array(buffer) });

    const [textResult, infoResult] = await Promise.all([
      pdf.getText(),
      pdf.getInfo(),
    ]);

    return {
      text: textResult.text,
      pages: textResult.pages.length,
      metadata: {
        title: infoResult.info?.Title,
        author: infoResult.info?.Author,
        subject: infoResult.info?.Subject,
        keywords: infoResult.info?.Keywords,
        creationDate: infoResult.info?.CreationDate
          ? new Date(infoResult.info.CreationDate)
          : undefined,
        pageCount: textResult.pages.length,
      },
    };
  }
}
