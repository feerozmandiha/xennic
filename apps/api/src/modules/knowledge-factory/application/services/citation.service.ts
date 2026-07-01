import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ParsedContent } from '../../infrastructure/parsers/parsed-content.type.js';

export interface EvidenceChain {
  evidenceId: string;
  claims: Claim[];
  confidence: number;
  sources: SourceRef[];
}

export interface Claim {
  claimId: string;
  text: string;
  confidence: number;
  supportingSources: string[];
}

export interface SourceRef {
  sourceId: string;
  documentId: string;
  location: string;
  excerpt: string;
  confidence: number;
  version: number;
}

export interface Citation {
  citationId: string;
  format: string;
  sourceRef: SourceRef;
}

const XENNIC_CITE_PATTERN = /XENNIC-CITE:([^:]+):([^:]+):(\d+):([^:]+):([\d.]+)/;

@Injectable()
export class CitationService {
  private readonly logger = new Logger(CitationService.name);

  buildEvidenceChain(
    documentId: string,
    content: ParsedContent,
    chunks: { chunkId: string; content: string; heading?: string; index: number }[],
  ): EvidenceChain {
    const sources: SourceRef[] = chunks.map((chunk) => ({
      sourceId: chunk.chunkId,
      documentId,
      location: chunk.heading ?? `section-${chunk.index + 1}`,
      excerpt: chunk.content.slice(0, 200),
      confidence: 0.9,
      version: 1,
    }));

    const claims = this.extractClaims(content.text).map((text) => {
      const supportingSources = this.findSupportingSources(text, chunks);
      return {
        claimId: randomUUID(),
        text,
        confidence: supportingSources.length > 0 ? 0.85 : 0.5,
        supportingSources: supportingSources.map((s) => s.sourceId),
      };
    });

    const confidence = claims.length > 0
      ? claims.reduce((sum, c) => sum + c.confidence, 0) / claims.length
      : 0;

    return { evidenceId: randomUUID(), claims, confidence, sources };
  }

  generateCitations(chain: EvidenceChain): Citation[] {
    return chain.sources.map((source) => ({
      citationId: randomUUID(),
      format: `XENNIC-CITE:${source.documentId}:${source.sourceId}:${source.version}:${source.location}:${source.confidence}`,
      sourceRef: source,
    }));
  }

  parseCitation(citation: string): SourceRef | null {
    const match = citation.match(XENNIC_CITE_PATTERN);
    if (!match) return null;
    return {
      sourceId: match[2]!,
      documentId: match[1]!,
      version: parseInt(match[3]!, 10),
      location: match[4]!,
      confidence: parseFloat(match[5]!),
      excerpt: '',
    };
  }

  formatForDisplay(citation: Citation): string {
    const ref = citation.sourceRef;
    return `[${ref.sourceId.slice(0, 8)}] ${ref.location} — confidence ${(ref.confidence * 100).toFixed(0)}%`;
  }

  private extractClaims(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(Boolean).map((s) => s.trim()).filter((s) => s.length > 20);
    const claims: string[] = [];

    for (const sentence of sentences) {
      if (/shall be|must be|required to|is defined as|refers to|specifies|states that/i.test(sentence)) {
        claims.push(sentence);
      } else if (/=\s*|≥|≤|±/i.test(sentence) && /\d/.test(sentence)) {
        claims.push(sentence);
      }
    }

    return claims.slice(0, 50);
  }

  private findSupportingSources(
    claim: string,
    chunks: { chunkId: string; content: string; index: number }[],
  ): { sourceId: string; index: number }[] {
    const claimWords = new Set(
      claim.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
    );
    const results: { sourceId: string; index: number }[] = [];

    for (const chunk of chunks) {
      const chunkWords = chunk.content.toLowerCase().split(/\s+/);
      const matchCount = chunkWords.filter((w) => claimWords.has(w)).length;
      if (matchCount / claimWords.size > 0.3) {
        results.push({ sourceId: chunk.chunkId, index: chunk.index });
      }
    }

    return results;
  }
}
