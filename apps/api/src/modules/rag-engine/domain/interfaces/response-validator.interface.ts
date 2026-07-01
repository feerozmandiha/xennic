import type {
  RagQuery,
  RagResponse,
  ValidationResult,
} from '../types/rag.types.js';

export interface IResponseValidator {
  validate(query: RagQuery, response: RagResponse): Promise<ValidationResult>;
  checkCitationCompleteness(response: RagResponse): { passed: boolean; details?: string };
  checkUnsupportedClaims(response: RagResponse): { passed: boolean; details?: string };
  checkConflictingStandards(response: RagResponse): { passed: boolean; details?: string };
  checkSupersededDocuments(response: RagResponse): { passed: boolean; details?: string };
  checkWorkspaceIsolation(query: RagQuery, response: RagResponse): { passed: boolean; details?: string };
  checkHallucination(response: RagResponse): { passed: boolean; details?: string };
}
