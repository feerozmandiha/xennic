export type CmsBlockType =
  | 'hero'
  | 'features'
  | 'feature'
  | 'pricing'
  | 'pricing-plan'
  | 'cta'
  | 'articles'
  | 'article'
  | 'logos'
  | 'stats'
  | 'faq'
  | 'faq-item'
  | 'testimonials'
  | 'testimonial'
  | 'contact'
  | 'gallery'
  | 'image'
  | 'video'
  | 'button'
  | 'buttons'
  | 'heading'
  | 'paragraph'
  | 'rich-text'
  | 'columns'
  | 'column'
  | 'spacer'
  | 'divider'
  | 'nav-link'
  | 'nav-links'
  | 'social-links'
  | 'footer-column'
  | 'html';

export interface CmsBlock {
  type: CmsBlockType | string;
  id: string;
  props: Record<string, unknown>;
  children?: CmsBlock[];
}

export interface CmsDocument {
  schema: 'xennic-cms/v1';
  meta?: Record<string, unknown>;
  blocks: CmsBlock[];
}

export interface CmsContent {
  id: string;
  slot: string;
  locale: string;
  version: number;
  published: boolean;
  publishedAt: string | null;
  updatedBy: string | null;
  updatedAt: string;
  document: CmsDocument;
}

export interface CmsMedia {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  originalName: string;
}

export const EMPTY_DOCUMENT: CmsDocument = {
  schema: 'xennic-cms/v1',
  blocks: [],
};

export function newBlockId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createBlock(
  type: CmsBlock['type'],
  props: Record<string, unknown> = {},
  children?: CmsBlock[],
): CmsBlock {
  return { type, id: newBlockId(), props, ...(children ? { children } : {}) };
}
