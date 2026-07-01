export interface ParsedContent {
  text: string;
  htmlContent?: string;
  pages?: number;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creationDate?: Date;
    pageCount?: number;
    paragraphCount?: number;
    headings?: string[];
    codeBlocks?: number;
    [key: string]: unknown;
  };
}

export interface ParserService {
  parse(buffer: Buffer): Promise<ParsedContent>;
}

export interface ClassificationResult {
  sourceType: 'standard' | 'article' | 'manual' | 'specification' | 'report' | 'other';
  confidence: number;
  language: string;
}

export interface DocumentMetadata {
  title: string;
  author: string;
  date: Date;
  language: string;
  sourceType: string;
  confidence: number;
  version?: string;
  pageCount?: number;
  wordCount?: number;
  hasTables?: boolean;
  hasFormulas?: boolean;
}
