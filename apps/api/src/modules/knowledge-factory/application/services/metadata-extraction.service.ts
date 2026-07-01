import { Injectable } from '@nestjs/common';
import type { ParsedContent, ClassificationResult, DocumentMetadata } from '../../infrastructure/parsers/parsed-content.type.js';

@Injectable()
export class MetadataExtractionService {
  extract(content: ParsedContent, classification: ClassificationResult): DocumentMetadata {
    const title = content.metadata.title ?? this.extractTitleFromText(content.text);
    const author = content.metadata.author ?? 'Unknown';
    const date = content.metadata.creationDate ?? new Date();
    const wordCount = this.countWords(content.text);

    return {
      title,
      author,
      date,
      language: classification.language,
      sourceType: classification.sourceType,
      confidence: classification.confidence,
      wordCount,
      pageCount: content.pages ?? content.metadata.pageCount,
      hasTables: this.detectTables(content.text),
      hasFormulas: this.detectFormulas(content.text),
    };
  }

  private extractTitleFromText(text: string): string {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const firstLine = lines[0];
    if (firstLine && firstLine.length < 200) {
      return firstLine.trim().slice(0, 255);
    }
    return 'Untitled Document';
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter((w) => w.length > 0).length;
  }

  private detectTables(text: string): boolean {
    return /\|.+\|.+\|/.test(text) || text.includes('|---');
  }

  private detectFormulas(text: string): boolean {
    return /\\[a-zA-Z]+{.*}|\\\[.*\\\]|\\\(.*\\\)|\$.*\$/.test(text);
  }
}
