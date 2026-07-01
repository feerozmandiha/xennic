import type {
  RagQuery,
  RetrievalChunk,
  RagResponse,
  GuardrailResult,
} from '../types/rag.types.js';

export interface IEngineeringGuardrails {
  checkResponse(response: RagResponse, query: RagQuery, evidence: RetrievalChunk[]): Promise<GuardrailResult>;
  checkEvidencePresence(evidence: RetrievalChunk[]): GuardrailResult;
  checkOutdatedDocuments(evidence: RetrievalChunk[]): GuardrailResult;
  checkUnresolvableConflicts(response: RagResponse): GuardrailResult;
  checkWorkspaceMismatch(response: RagResponse, query: RagQuery): GuardrailResult;
  checkInvalidCitations(response: RagResponse): GuardrailResult;
}
