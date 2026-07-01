import type {
  Citation,
  RetrievalChunk,
} from '../../domain/types/rag.types.js';
import type { ICitationEngine } from '../../domain/interfaces/citation-engine.interface.js';

function tokenize(text: string): Set<string> {
  return new Set(text.toLowerCase().split(/[\s\W]+/).filter(Boolean));
}

export class CitationEngineService implements ICitationEngine {
  async generateCitations(
    statements: string[],
    evidence: RetrievalChunk[],
  ): Promise<Citation[]> {
    if (!statements.length || !evidence.length) return [];

    const citations: Citation[] = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]!;
      const best = this.selectBestEvidence(statement, evidence, i, evidence.length);

      citations.push({
        statement,
        evidence: {
          documentXid: best.metadata.xid,
          documentTitle: best.metadata.title,
          version: best.metadata.version,
          section: best.provenance?.section,
          page: best.provenance?.page,
          chunkId: best.chunkId,
          paragraph: best.provenance?.paragraph,
        },
        confidence: best.score,
        authorityScore: best.metadata.authorityScore,
        sourceTier: best.metadata.tier,
        citationChain: [],
      });
    }

    const chains = this.buildCitationChain(citations);
    for (const citation of citations) {
      const chain = chains.find((c) => c.includes(citation.statement));
      if (chain) {
        citation.citationChain = chain;
      }
    }

    return citations;
  }

  validateCitation(citation: Citation): boolean {
    if (!citation.statement || typeof citation.statement !== 'string') return false;
    if (!citation.evidence) return false;
    if (!citation.evidence.documentXid || typeof citation.evidence.documentXid !== 'string') return false;
    if (!citation.evidence.documentTitle || typeof citation.evidence.documentTitle !== 'string') return false;
    if (typeof citation.evidence.version !== 'number' || citation.evidence.version < 0) return false;
    if (typeof citation.confidence !== 'number' || citation.confidence < 0 || citation.confidence > 1) return false;
    if (typeof citation.authorityScore !== 'number' || citation.authorityScore < 0) return false;
    if (!citation.sourceTier) return false;

    return true;
  }

  buildCitationChain(citations: Citation[]): string[][] {
    const byXid = new Map<string, string[]>();

    for (const c of citations) {
      const xid = c.evidence.documentXid;
      if (!byXid.has(xid)) {
        byXid.set(xid, []);
      }
      byXid.get(xid)!.push(c.statement);
    }

    return [...byXid.values()];
  }

  private selectBestEvidence(
    statement: string,
    evidence: RetrievalChunk[],
    fallbackIndex: number,
    fallbackTotal: number,
  ): RetrievalChunk {
    const stmtWords = tokenize(statement);

    if (stmtWords.size === 0) {
      return evidence[fallbackIndex % fallbackTotal]!;
    }

    let bestScore = -1;
    let bestIdx = 0;

    for (let i = 0; i < evidence.length; i++) {
      const chunk = evidence[i]!;
      const chunkWords = tokenize(chunk.content);
      const intersection = new Set([...stmtWords].filter((w) => chunkWords.has(w)));
      const union = new Set([...stmtWords, ...chunkWords]);
      const jaccard = union.size > 0 ? intersection.size / union.size : 0;
      const combined = jaccard * chunk.score;

      if (combined > bestScore) {
        bestScore = combined;
        bestIdx = i;
      }
    }

    return evidence[bestIdx]!;
  }
}
