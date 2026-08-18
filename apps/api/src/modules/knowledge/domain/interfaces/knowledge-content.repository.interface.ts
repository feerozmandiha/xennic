/**
 * Read/write contracts for the child collections of the Knowledge aggregate:
 * translations, media, formulas, examples and comment reactions.
 *
 * These records are always owned by a `knowledge` root — ownership (and therefore
 * workspace isolation) is enforced by the application layer before any call here.
 */

// ─── Translations ────────────────────────────────────────────────────────────

export interface KnowledgeTranslationRecord {
  id: string;
  knowledgeId: string;
  language: string;
  title: string;
  summary: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  content: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaveTranslationData {
  language: string;
  title: string;
  summary?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  content?: Record<string, unknown>;
}

// ─── Media ───────────────────────────────────────────────────────────────────

export interface KnowledgeMediaRecord {
  id: string;
  knowledgeId: string;
  type: string;
  url: string;
  captionFa: string | null;
  captionEn: string | null;
  altFa: string | null;
  altEn: string | null;
  description: string | null;
  license: string | null;
  source: string | null;
  fileSize: number | null;
  mimeType: string | null;
  sortOrder: number;
  createdAt: Date;
}

export interface CreateMediaData {
  type: string;
  url: string;
  captionFa?: string | null;
  captionEn?: string | null;
  altFa?: string | null;
  altEn?: string | null;
  description?: string | null;
  license?: string | null;
  source?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  sortOrder?: number;
}

export type UpdateMediaData = Partial<CreateMediaData>;

// ─── Formulas ────────────────────────────────────────────────────────────────

export interface KnowledgeFormulaRecord {
  id: string;
  knowledgeId: string;
  latex: string;
  mathml: string | null;
  descriptionFa: string | null;
  descriptionEn: string | null;
  variables: unknown[];
  calculatorType: string | null;
  sortOrder: number;
  createdAt: Date;
}

export interface CreateFormulaData {
  latex: string;
  mathml?: string | null;
  descriptionFa?: string | null;
  descriptionEn?: string | null;
  variables?: unknown[];
  calculatorType?: string | null;
  sortOrder?: number;
}

export type UpdateFormulaData = Partial<CreateFormulaData>;

// ─── Examples ────────────────────────────────────────────────────────────────

export interface KnowledgeExampleRecord {
  id: string;
  knowledgeId: string;
  titleFa: string;
  titleEn: string | null;
  difficulty: string;
  steps: unknown[];
  answer: Record<string, unknown> | null;
  calculatorType: string | null;
  sortOrder: number;
  createdAt: Date;
}

export interface CreateExampleData {
  titleFa: string;
  titleEn?: string | null;
  difficulty?: string;
  steps?: unknown[];
  answer?: Record<string, unknown> | null;
  calculatorType?: string | null;
  sortOrder?: number;
}

export type UpdateExampleData = Partial<CreateExampleData>;

// ─── Comment reactions ───────────────────────────────────────────────────────

export interface CommentReactionRecord {
  id: string;
  knowledgeId: string;
  likes: number;
  likedBy: string[];
  deletedAt: Date | null;
}

// ─── Repository ──────────────────────────────────────────────────────────────

export interface IKnowledgeContentRepository {
  // Translations
  findTranslations(knowledgeId: string): Promise<KnowledgeTranslationRecord[]>;
  findTranslationByLanguage(
    knowledgeId: string,
    language: string,
  ): Promise<KnowledgeTranslationRecord | null>;
  saveTranslation(
    knowledgeId: string,
    data: SaveTranslationData,
  ): Promise<KnowledgeTranslationRecord>;
  deleteTranslation(knowledgeId: string, language: string): Promise<void>;

  // Media
  findMedia(knowledgeId: string): Promise<KnowledgeMediaRecord[]>;
  findMediaById(id: string): Promise<KnowledgeMediaRecord | null>;
  createMedia(knowledgeId: string, data: CreateMediaData): Promise<KnowledgeMediaRecord>;
  updateMedia(id: string, data: UpdateMediaData): Promise<KnowledgeMediaRecord>;
  deleteMedia(id: string): Promise<void>;

  // Formulas
  findFormulas(knowledgeId: string): Promise<KnowledgeFormulaRecord[]>;
  findFormulaById(id: string): Promise<KnowledgeFormulaRecord | null>;
  createFormula(knowledgeId: string, data: CreateFormulaData): Promise<KnowledgeFormulaRecord>;
  updateFormula(id: string, data: UpdateFormulaData): Promise<KnowledgeFormulaRecord>;
  deleteFormula(id: string): Promise<void>;

  // Examples
  findExamples(knowledgeId: string): Promise<KnowledgeExampleRecord[]>;
  findExampleById(id: string): Promise<KnowledgeExampleRecord | null>;
  createExample(knowledgeId: string, data: CreateExampleData): Promise<KnowledgeExampleRecord>;
  updateExample(id: string, data: UpdateExampleData): Promise<KnowledgeExampleRecord>;
  deleteExample(id: string): Promise<void>;

  // Comment reactions
  findCommentReaction(commentId: string): Promise<CommentReactionRecord | null>;
  saveCommentReaction(
    commentId: string,
    likes: number,
    likedBy: string[],
  ): Promise<CommentReactionRecord>;
}
