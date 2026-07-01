import { Injectable, Logger } from '@nestjs/common';
import type { ParsedContent, ParserService } from './parsed-content.type.js';

type MammothResult = {
  value: string;
  messages: Array<{ type: string; message: string }>;
};

type MammothModule = {
  extractRawText: (opts: { buffer: Buffer }) => Promise<MammothResult>;
  convertToHtml: (opts: { buffer: Buffer }) => Promise<MammothResult>;
};

@Injectable()
export class DocxParserService implements ParserService {
  private readonly logger = new Logger(DocxParserService.name);

  async parse(buffer: Buffer): Promise<ParsedContent> {
    const mammoth = await this.loadMammoth();

    const result = await mammoth.extractRawText({ buffer });
    const htmlResult = await mammoth.convertToHtml({ buffer });

    const paragraphs = result.value.split('\n').filter((p: string) => p.trim().length > 0);

    return {
      text: result.value,
      htmlContent: htmlResult.value,
      metadata: {
        title: undefined,
        author: undefined,
        paragraphCount: paragraphs.length,
      },
    };
  }

  private async loadMammoth(): Promise<MammothModule> {
    try {
      const mod = await import('mammoth');
      return mod as unknown as MammothModule;
    } catch {
      this.logger.warn('mammoth not available, using fallback parser');
      return this.fallbackParser();
    }
  }

  private fallbackParser(): MammothModule {
    return {
      extractRawText: async ({ buffer }: { buffer: Buffer }) => ({
        value: buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r]/g, ' '),
        messages: [],
      }),
      convertToHtml: async ({ buffer }: { buffer: Buffer }) => ({
        value: `<p>${buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r]/g, ' ')}</p>`,
        messages: [],
      }),
    };
  }
}
