import { Injectable, Logger } from '@nestjs/common';
import type { DocumentChunk, ChunkType } from '../../domain/chunk.types.js';

export interface ParsedContent {
  docId: string;
  workspaceId: string;
  content: string;
  format: 'markdown' | 'pdf' | 'html' | 'plain';
  metadata?: Record<string, unknown>;
}

const HEADING_RE = /^(#{1,6})\s+(.+)$/gm;
const TABLE_RE = /^\|.+\|\s*$/m;
const CROSS_REF_RE = /\[\[(.+?)\]\]/g;
const PAGE_NUM_RE = /<!--\s*page:\s*(\d+)\s*-->/g;

@Injectable()
export class ChunkingService {
  private readonly logger = new Logger(ChunkingService.name);

  chunkDocument(input: ParsedContent): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const lines = input.content.split('\n');
    const totalLines = lines.length;

    let currentHeading: string | undefined;
    let currentBuffer: string[] = [];
    let chunkIndex = 0;
    let currentPage = 1;
    let detectedCrossReferences: string[] = [];

    const flushTextBlock = (): void => {
      const raw = currentBuffer.join('\n').trim();
      if (!raw) return;

      const textChunks = this._splitLargeText(raw, input.docId, input.workspaceId, chunkIndex, currentHeading, currentPage, detectedCrossReferences);
      for (const tc of textChunks) {
        chunks.push(tc);
        chunkIndex++;
      }
      currentBuffer = [];
      detectedCrossReferences = [];
    };

    for (let i = 0; i < totalLines; i++) {
      const line = lines[i] as string;

      const pageMatch = line.match(PAGE_NUM_RE);
      if (pageMatch) {
        currentPage = parseInt(pageMatch[1] as string, 10);
        continue;
      }

      const headingMatch = HEADING_RE.exec(line);
      HEADING_RE.lastIndex = 0;
      if (headingMatch) {
        flushTextBlock();
        const headingText = (headingMatch[2] as string).trim();
        const crossRefs = this._extractCrossReferences(line);

        chunks.push({
          chunkId: `${input.docId}-chunk-${chunkIndex}`,
          docId: input.docId,
          workspaceId: input.workspaceId,
          content: line,
          heading: headingText,
          chunkType: 'heading',
          index: chunkIndex,
          metadata: {
            headings: [headingText],
            crossReferences: crossRefs.length > 0 ? crossRefs : undefined,
            pageNumber: currentPage,
          },
          tokenCount: this._estimateTokens(line),
        });
        chunkIndex++;
        currentHeading = headingText;
        detectedCrossReferences = [];
        continue;
      }

      const crossRefs = this._extractCrossReferences(line);
      detectedCrossReferences.push(...crossRefs);

      const isTableLine = TABLE_RE.test(line.trim());
      const prevLine = i > 0 ? (lines[i - 1] as string) : '';
      const nextLine = i < totalLines - 1 ? (lines[i + 1] as string) : '';
      const prevIsTable = i > 0 && TABLE_RE.test(prevLine.trim());
      const nextIsTable = i < totalLines - 1 && TABLE_RE.test(nextLine.trim());

      if (isTableLine || prevIsTable) {
        if (!prevIsTable) {
          flushTextBlock();
          currentBuffer = [line];
        } else {
          currentBuffer.push(line);
        }
        if (!nextIsTable) {
          const rawTable = currentBuffer.join('\n').trim();
          if (rawTable) {
            chunks.push({
              chunkId: `${input.docId}-chunk-${chunkIndex}`,
              docId: input.docId,
              workspaceId: input.workspaceId,
              content: rawTable,
              heading: currentHeading,
              chunkType: 'table',
              index: chunkIndex,
              metadata: {
                headings: currentHeading ? [currentHeading] : undefined,
                tables: [rawTable],
                crossReferences: detectedCrossReferences.length > 0 ? [...detectedCrossReferences] : undefined,
                pageNumber: currentPage,
              },
              tokenCount: this._estimateTokens(rawTable),
            });
            chunkIndex++;
          }
          currentBuffer = [];
          detectedCrossReferences = [];
        }
        continue;
      }

      const hasFormulaBlock = line.includes('$$');
      if (hasFormulaBlock) {
        const formulaContent = this._extractFormulaBlock(input.content, i, lines);
        if (formulaContent) {
          flushTextBlock();
          chunks.push({
            chunkId: `${input.docId}-chunk-${chunkIndex}`,
            docId: input.docId,
            workspaceId: input.workspaceId,
            content: formulaContent,
            heading: currentHeading,
            chunkType: 'formula',
            index: chunkIndex,
            metadata: {
              headings: currentHeading ? [currentHeading] : undefined,
              formulas: [formulaContent],
              crossReferences: detectedCrossReferences.length > 0 ? [...detectedCrossReferences] : undefined,
              pageNumber: currentPage,
            },
            tokenCount: this._estimateTokens(formulaContent),
          });
          chunkIndex++;
          detectedCrossReferences = [];
          if (formulaContent.includes('\n')) {
            const formulaLines = formulaContent.split('\n');
            i += formulaLines.length - 1;
          }
          continue;
        }
      }

      currentBuffer.push(line);
    }

    flushTextBlock();

    this._deduplicateCrossReferences(chunks);

    this.logger.log(`Chunked document ${input.docId}: ${chunks.length} chunks`);
    return chunks;
  }

  private _splitLargeText(
    text: string,
    docId: string,
    workspaceId: string,
    startIndex: number,
    heading?: string,
    pageNumber?: number,
    crossReferences?: string[],
  ): DocumentChunk[] {
    const MAX_CHUNK_LENGTH = 2000;
    if (text.length <= MAX_CHUNK_LENGTH) {
      return [
        {
          chunkId: `${docId}-chunk-${startIndex}`,
          docId,
          workspaceId,
          content: text,
          heading,
          chunkType: 'text',
          index: startIndex,
          metadata: {
            headings: heading ? [heading] : undefined,
            crossReferences: crossReferences && crossReferences.length > 0 ? [...crossReferences] : undefined,
            pageNumber,
          },
          tokenCount: this._estimateTokens(text),
        },
      ];
    }

    const result: DocumentChunk[] = [];
    let offset = 0;
    let subIndex = startIndex;

    while (offset < text.length) {
      let end = Math.min(offset + MAX_CHUNK_LENGTH, text.length);
      if (end < text.length) {
        const boundary = text.lastIndexOf('\n', end);
        if (boundary > offset) end = boundary;
        const sentenceBoundary = text.lastIndexOf('. ', end);
        if (sentenceBoundary > offset && end - sentenceBoundary < 200) end = sentenceBoundary + 1;
      }

      const segment = text.slice(offset, end).trim();
      if (segment) {
        result.push({
          chunkId: `${docId}-chunk-${subIndex}`,
          docId,
          workspaceId,
          content: segment,
          heading,
          chunkType: 'text',
          index: subIndex,
          metadata: {
            headings: heading ? [heading] : undefined,
            crossReferences: crossReferences && crossReferences.length > 0 ? [...crossReferences] : undefined,
            pageNumber,
          },
          tokenCount: this._estimateTokens(segment),
        });
        subIndex++;
      }
      offset = end;
    }

    return result;
  }

  private _extractCrossReferences(line: string): string[] {
    const refs: string[] = [];
    let match: RegExpExecArray | null;
    const regex = new RegExp(CROSS_REF_RE.source, 'g');
    while ((match = regex.exec(line)) !== null) {
      refs.push(match[1]!.trim());
    }
    return refs;
  }

  private _extractFormulaBlock(
    content: string,
    lineIndex: number,
    lines: string[],
  ): string | null {
    const line = lines[lineIndex] as string;
    if (line.trim() === '$$') {
      const blockLines: string[] = [];
      for (let j = lineIndex + 1; j < lines.length; j++) {
        if ((lines[j] as string).trim() === '$$') break;
        blockLines.push(lines[j] as string);
      }
      if (blockLines.length > 0) return `$$\n${blockLines.join('\n')}\n$$`;
    }
    const inlineMatch = line.match(/\$(.+?)\$/);
    if (inlineMatch) return inlineMatch[0];
    return null;
  }

  private _deduplicateCrossReferences(chunks: DocumentChunk[]): void {
    for (const chunk of chunks) {
      if (chunk.metadata.crossReferences) {
        chunk.metadata.crossReferences = [...new Set(chunk.metadata.crossReferences)];
      }
    }
  }

  private _estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
