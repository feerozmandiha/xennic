import { Injectable, Logger } from '@nestjs/common';
import type { IEngineeringGuardrails } from '../../domain/interfaces/engineering-guardrails.interface.js';
import type {
  RagQuery,
  RetrievalChunk,
  RagResponse,
  GuardrailResult,
} from '../../domain/types/rag.types.js';

@Injectable()
export class EngineeringGuardrails implements IEngineeringGuardrails {
  private readonly logger = new Logger(EngineeringGuardrails.name);

  async checkResponse(
    response: RagResponse,
    query: RagQuery,
    evidence: RetrievalChunk[],
  ): Promise<GuardrailResult> {
    const checks = await Promise.all([
      this.checkEvidencePresence(evidence),
      this.checkOutdatedDocuments(evidence),
      this.checkUnresolvableConflicts(response),
      this.checkWorkspaceMismatch(response, query),
      this.checkInvalidCitations(response),
    ]);

    const reasons: string[] = [];
    for (const check of checks) {
      if (!check.allowed) reasons.push(...check.reasons);
    }

    if (reasons.length > 0) {
      this.logger.warn(`Guardrails rejected response: ${reasons.join('; ')}`);
      return {
        allowed: false,
        reasons,
        recommendation: 'Re-query with stricter filters or provide additional sources.',
      };
    }

    return { allowed: true, reasons: [] };
  }

  checkEvidencePresence(evidence: RetrievalChunk[]): GuardrailResult {
    if (!evidence.length) {
      return {
        allowed: false,
        reasons: ['No evidence found for the query'],
        recommendation: 'Broaden search filters or rephrase the question.',
      };
    }
    return { allowed: true, reasons: [] };
  }

  checkOutdatedDocuments(evidence: RetrievalChunk[]): GuardrailResult {
    const outdated = evidence.filter((c) => c.metadata.status === 'superseded' || c.metadata.status === 'deprecated');
    const nonOutdated = evidence.filter((c) => c.metadata.status === 'active');

    if (evidence.length > 0 && nonOutdated.length === 0) {
      return {
        allowed: false,
        reasons: [`All ${evidence.length} retrieved documents are superseded or deprecated`],
        recommendation: 'Search for updated versions of the relevant standards.',
      };
    }
    return { allowed: true, reasons: [] };
  }

  checkUnresolvableConflicts(response: RagResponse): GuardrailResult {
    if (!response.answer) {
      return { allowed: false, reasons: ['Empty response generated'] };
    }
    const conflictIndicators = ['conflict', 'contradict', 'disagree', 'inconsistent', 'cannot determine'];
    const answerLower = response.answer.toLowerCase();
    const hasUnresolvedConflict = conflictIndicators.some((indicator) => answerLower.includes(indicator));

    if (hasUnresolvedConflict) {
      return {
        allowed: false,
        reasons: ['Response contains unresolved knowledge conflicts'],
        recommendation: 'Consult a domain expert to resolve the conflict.',
      };
    }
    return { allowed: true, reasons: [] };
  }

  checkWorkspaceMismatch(response: RagResponse, query: RagQuery): GuardrailResult {
    const chain = response.evidenceChain;
    if (!chain) return { allowed: true, reasons: [] };

    for (const chunk of chain.selectedEvidence) {
      if (!chunk.knowledgeObjectId.startsWith(query.workspaceId)) {
        return {
          allowed: false,
          reasons: [`Chunk ${chunk.chunkId} does not belong to workspace ${query.workspaceId}`],
        };
      }
    }
    return { allowed: true, reasons: [] };
  }

  checkInvalidCitations(response: RagResponse): GuardrailResult {
    if (!response.citations?.length) {
      return {
        allowed: false,
        reasons: ['Response has no citations'],
        recommendation: 'Ensure at least one evidence source is cited.',
      };
    }

    const invalid = response.citations.filter((c) => {
      return !c.evidence.documentXid || !c.evidence.documentTitle;
    });

    if (invalid.length) {
      return {
        allowed: false,
        reasons: [`${invalid.length} citations are missing required fields (document XID or title)`],
      };
    }
    return { allowed: true, reasons: [] };
  }
}
