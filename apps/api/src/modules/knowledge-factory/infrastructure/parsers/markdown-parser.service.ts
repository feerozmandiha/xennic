import { Injectable, Logger } from '@nestjs/common';
import type { ParsedContent, ParserService } from './parsed-content.type.js';

type MarkedModule = {
  parse: (text: string) => Promise<string>;
};

@Injectable()
export class MarkdownParserService implements ParserService {
  private readonly logger = new Logger(MarkdownParserService.name);

  async parse(buffer: Buffer): Promise<ParsedContent> {
    const text = buffer.toString('utf-8');
    const marked = await this.loadMarked();

    const htmlContent = await marked.parse(text);
    const headings = this.extractHeadings(text);
    const codeBlocks = this.countCodeBlocks(text);

    return {
      text,
      htmlContent,
      metadata: {
        title: this.extractTitle(text),
        headings,
        codeBlocks,
      },
    };
  }

  private extractTitle(text: string): string | undefined {
    const match = text.match(/^#\s+(.+)/m);
    return match?.[1]?.trim();
  }

  private extractHeadings(text: string): string[] {
    const matches = text.matchAll(/^(#{1,6})\s+(.+)/gm);
    return Array.from(matches).map((m) => {
      const level = m[1] ?? '';
      const heading = m[2] ?? '';
      return `${'#'.repeat(level.length)} ${heading.trim()}`;
    });
  }

  private countCodeBlocks(text: string): number {
    const matches = text.match(/```/g);
    return matches ? Math.floor(matches.length / 2) : 0;
  }

  private async loadMarked(): Promise<MarkedModule> {
    try {
      const mod = await import('marked');
      return mod as MarkedModule;
    } catch {
      this.logger.warn('marked not available, using fallback parser');
      return this.fallbackParser();
    }
  }

  private fallbackParser(): MarkedModule {
    return {
      parse: async (text: string) => `<pre>${text.replace(/</g, '&lt;')}</pre>`,
    };
  }
}
