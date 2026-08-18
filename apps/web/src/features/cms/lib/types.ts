export type CmsBlockType =
  | 'hero'
  | 'features'
  | 'feature'
  | 'pricing'
  | 'pricing-plan'
  | 'cta'
  | 'branding'
  | 'auth-brand'
  | 'articles'
  | 'article'
  | 'logos'
  | 'logo'
  | 'stats'
  | 'stat'
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
  | 'social-link'
  | 'footer-column'
  | 'html'
  | 'newsletter'
  | 'map'
  | 'countdown'
  | 'card'
  | 'cards'
  | 'steps'
  | 'step'
  | 'quote'
  | 'code'
  | 'alert';

/**
 * CmsBlockStyle — تنظیمات استایل قابل اعمال به هر بلوک
 *
 * همه‌ی فیلد‌ها اختیاری هستند. مقادیر به‌صورت CSS متغیر یا
 * Tailwind-like نگه داشته می‌شوند و در Renderer به inline style
 * یا کلاس مناسب تبدیل می‌شوند.
 */
export interface CmsBlockStyle {
  // رنگ
  backgroundColor?: string; // hex یا hsl(var(--...))
  textColor?: string;
  gradient?: string; // عبارت gradient آماده
  backgroundImage?: string; // url(...)
  backgroundOverlay?: string; // rgba overlay

  // فاصله
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  paddingX?: 'none' | 'sm' | 'md' | 'lg';
  marginY?: 'none' | 'sm' | 'md' | 'lg';

  // چیدمان
  align?: 'start' | 'center' | 'end';
  textAlign?: 'right' | 'center' | 'left';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  // ظاهر
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  className?: string; // کلاس دلخواه

  // تایپوگرافی
  textSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
}

export interface CmsBlock {
  type: CmsBlockType | string;
  id: string;
  props: Record<string, unknown>;
  style?: CmsBlockStyle;
  children?: CmsBlock[];
  /** آیا در ویرایشگر مخفی شود (نه در رندر نهایی) */
  hidden?: boolean;
}

export interface CmsDocument {
  schema: 'xennic-cms/v2';
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
  schema: 'xennic-cms/v2',
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
  style?: CmsBlockStyle,
): CmsBlock {
  return {
    type,
    id: newBlockId(),
    props,
    ...(children ? { children } : {}),
    ...(style ? { style } : {}),
  };
}
