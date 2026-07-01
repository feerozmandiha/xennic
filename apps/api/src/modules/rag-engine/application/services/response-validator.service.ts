import { Injectable, Logger } from '@nestjs/common';
import type { IResponseValidator } from '../../domain/interfaces/response-validator.interface.js';
import type {
  RagQuery,
  RagResponse,
  ValidationResult,
  ValidationError,
} from '../../domain/types/rag.types.js';

@Injectable()
export class ResponseValidator implements IResponseValidator {
  private readonly logger = new Logger(ResponseValidator.name);

  async validate(query: RagQuery, response: RagResponse): Promise<ValidationResult> {
    const citationCompleteness = this.checkCitationCompleteness(response);
    const unsupportedClaims = this.checkUnsupportedClaims(response);
    const conflictingStandards = this.checkConflictingStandards(response);
    const supersededDocuments = this.checkSupersededDocuments(response);
    const workspaceIsolation = this.checkWorkspaceIsolation(query, response);
    const hallucination = this.checkHallucination(response);

    const errors: ValidationError[] = [];
    if (!citationCompleteness.passed) {
      errors.push({ code: 'INCOMPLETE_CITATIONS', message: citationCompleteness.details ?? 'Citations missing' });
    }
    if (!unsupportedClaims.passed) {
      errors.push({ code: 'UNSUPPORTED_CLAIMS', message: unsupportedClaims.details ?? 'Claims without evidence' });
    }
    if (!conflictingStandards.passed) {
      errors.push({ code: 'CONFLICTING_STANDARDS', message: conflictingStandards.details ?? 'Standards conflict' });
    }
    if (!supersededDocuments.passed) {
      errors.push({ code: 'SUPERSEDED_DOCUMENTS', message: supersededDocuments.details ?? 'Superseded docs used' });
    }
    if (!workspaceIsolation.passed) {
      errors.push({ code: 'WORKSPACE_MISMATCH', message: workspaceIsolation.details ?? 'Workspace mismatch' });
    }
    if (!hallucination.passed) {
      errors.push({ code: 'HALLUCINATION_DETECTED', message: hallucination.details ?? 'Hallucination detected' });
    }

    const valid = errors.length === 0;
    if (!valid) {
      this.logger.warn(`Validation failed with ${errors.length} errors: ${errors.map((e) => e.code).join(', ')}`);
    }

    return {
      valid,
      checks: {
        citationCompleteness,
        unsupportedClaims,
        conflictingStandards,
        supersededDocuments,
        workspaceIsolation,
        hallucinationDetection: hallucination,
      },
      errors,
    };
  }

  checkCitationCompleteness(response: RagResponse): { passed: boolean; details?: string } {
    if (!response.citations?.length) {
      return { passed: false, details: 'Response has no citations' };
    }
    const missingEvidence = response.citations.filter((c) => !c.evidence.documentXid);
    if (missingEvidence.length) {
      return { passed: false, details: `${missingEvidence.length} citations missing document XID` };
    }
    return { passed: true };
  }

  checkUnsupportedClaims(response: RagResponse): { passed: boolean; details?: string } {
    const answerLower = response.answer?.toLowerCase() ?? '';
    const claimsPattern = /(?:is|are|was|were|has|have|shall|must|should|requires|provides|operates|consists|includes|supports|uses|produces|achieves|delivers)/gi;
    const claims = answerLower.match(claimsPattern);
    const citationCount = response.citations?.length ?? 0;

    if (claims && claims.length > citationCount * 2) {
      return { passed: false, details: `Found ${claims.length} potential claims but only ${citationCount} citations` };
    }
    return { passed: true };
  }

  checkConflictingStandards(response: RagResponse): { passed: boolean; details?: string } {
    const standards: string[] = [];
    for (const citation of response.citations ?? []) {
      const source = citation.evidence.documentTitle?.toLowerCase() ?? '';
      if (source.includes('standard') || source.includes('specification') || source.includes('regulation') || source.includes('code')) {
        standards.push(citation.evidence.documentTitle);
      }
    }
    const unique = new Set(standards);
    if (unique.size > 1) {
      return { passed: false, details: `Multiple standards referenced: ${[...unique].join(', ')}` };
    }
    return { passed: true };
  }

  checkSupersededDocuments(response: RagResponse): { passed: boolean; details?: string } {
    const superseded = (response.citations ?? []).filter((c) => {
      if (!c.evidence.version) return false;
      return c.authorityScore < 0.3;
    });
    if (superseded.length) {
      return { passed: false, details: `${superseded.length} citations reference superseded or low-authority documents` };
    }
    return { passed: true };
  }

  checkWorkspaceIsolation(query: RagQuery, response: RagResponse): { passed: boolean; details?: string } {
    const evidenceChain = response.evidenceChain;
    if (!evidenceChain) return { passed: true };

    for (const chunk of evidenceChain.selectedEvidence) {
      if (chunk.knowledgeObjectId && !chunk.knowledgeObjectId.startsWith(query.workspaceId)) {
        return { passed: false, details: `Chunk ${chunk.chunkId} does not belong to workspace ${query.workspaceId}` };
      }
    }
    return { passed: true };
  }

  checkHallucination(response: RagResponse): { passed: boolean; details?: string } {
    if (!response.answer || !response.citations?.length) {
      return { passed: false, details: 'No answer or no citations to verify against' };
    }
    const answerLower = response.answer.toLowerCase();
    const termsFromCitations = new Set<string>();
    for (const citation of response.citations) {
      const title = citation.evidence.documentTitle?.toLowerCase() ?? '';
      const statement = citation.statement?.toLowerCase() ?? '';
      [...title.split(/\s+/), ...statement.split(/\s+/)].forEach((t) => {
        if (t.length > 3) termsFromCitations.add(t);
      });
    }

    const answerWords = answerLower.split(/\s+/).filter((w) => w.length > 3);
    const unsupportedTerms = answerWords.filter((w) => ![...termsFromCitations].some((t) => t.includes(w) || w.includes(t)));

    if (unsupportedTerms.length > answerWords.length * 0.5 && unsupportedTerms.length > 2) {
      return {
        passed: false,
        details: `${unsupportedTerms.length} terms in answer not found in citations`,
      };
    }
    return { passed: true };
  }
}
