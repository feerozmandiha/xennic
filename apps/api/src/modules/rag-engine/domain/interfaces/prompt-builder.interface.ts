import type {
  RagQuery,
  RagContext,
  RagPrompt,
} from '../types/rag.types.js';

export interface IPromptBuilder {
  build(query: RagQuery, context: RagContext): Promise<RagPrompt>;
  buildSystemContext(): string;
  buildConstraints(query: RagQuery): string;
  buildEvidenceSection(context: RagContext): string;
  buildKnowledgeSection(context: RagContext): string;
  buildOutputRules(): string;
  sanitizePrompt(prompt: RagPrompt): RagPrompt;
}
