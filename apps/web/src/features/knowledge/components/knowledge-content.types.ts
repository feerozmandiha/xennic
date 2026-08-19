export type KnowledgeLocale = 'fa' | 'en' | 'ar' | 'de' | 'fr' | 'es' | 'ru' | 'zh';

export interface KnowledgeTranslation {
  id: string;
  knowledgeId: string;
  language: KnowledgeLocale;
  title: string;
  summary: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  content: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LocalizedKnowledge {
  id: string;
  slug: string;
  requestedLocale: KnowledgeLocale;
  resolvedLocale: KnowledgeLocale;
  isFallback: boolean;
  title: string | null;
  summary: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  content: Record<string, unknown>;
  availableLocales: KnowledgeLocale[];
}

export type KnowledgeMediaType =
  | 'image'
  | 'pdf'
  | 'video'
  | 'cad'
  | '3d'
  | 'gif'
  | 'svg'
  | 'audio'
  | 'archive';

export interface KnowledgeMedia {
  id: string;
  knowledgeId: string;
  type: KnowledgeMediaType;
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
  createdAt: string;
}

export interface KnowledgeFormula {
  id: string;
  knowledgeId: string;
  latex: string;
  mathml: string | null;
  descriptionFa: string | null;
  descriptionEn: string | null;
  variables: unknown[];
  calculatorType: string | null;
  sortOrder: number;
  createdAt: string;
}

export type ExampleDifficulty = 'basic' | 'intermediate' | 'advanced';

export interface KnowledgeExample {
  id: string;
  knowledgeId: string;
  titleFa: string;
  titleEn: string | null;
  difficulty: ExampleDifficulty;
  steps: Array<{ order?: number; text?: string; formula?: string; [key: string]: unknown }>;
  answer: Record<string, unknown> | null;
  calculatorType: string | null;
  sortOrder: number;
  createdAt: string;
}
