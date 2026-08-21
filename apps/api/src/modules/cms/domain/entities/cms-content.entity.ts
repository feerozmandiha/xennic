/**
 * CmsContentEntity — یکپارچه‌ی محتوای ویرایش‌شده‌ی صفحات عمومی (هدر/فوتر/صفحه/بلاک)
 *
 * - `slot` مسیر سلسله‌مراتبی محتوا است (مثلاً `landing/header`, `landing/hero`, `site/footer`).
 * - `locale` برای پشتیبانی چندزبانه نگه داشته می‌شود (fa/en).
 * - `document` ساختار بلوک‌بندی شده است (خود توصیفی، Schema در دیتابیس JSON).
 * - `version` برای هر به‌روزرسانی افزایش می‌یابد و `publishedAt` کنترل می‌کند چه نسخه‌ای عمومی است.
 */
export type CmsSlot = string;
export type CmsLocale = string;

export interface CmsBlockStyle {
  backgroundColor?: string;
  textColor?: string;
  gradient?: string;
  backgroundImage?: string;
  backgroundOverlay?: string;
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  paddingX?: 'none' | 'sm' | 'md' | 'lg';
  marginY?: 'none' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end';
  textAlign?: 'right' | 'center' | 'left';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  className?: string;
  textSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
}

export interface CmsBlock {
  /** نوع بلوک — باید در فهرست رسمی تعریف‌شده در CmsBlockRegistry باشد */
  type: string;
  /** شناسه‌ی پایدار بلوک (برای drag & drop و ویرایش) */
  id: string;
  /** محتوای قابل رندر — برای هر نوع بلوک اختصاصی است */
  props: Record<string, unknown>;
  /** استایل قابل ویرایش برای هر بلوک */
  style?: CmsBlockStyle;
  /** آیا بلوک در خروجی مخفی شود */
  hidden?: boolean;
  /** بلوک‌های فرزند برای ترکیب‌بندی */
  children?: CmsBlock[];
}

export interface CmsDocument {
  /** نسخه‌ی ساختار — برای اعتبارسنجی آینده */
  schema: 'xennic-cms/v1' | 'xennic-cms/v2';
  /** متادیتای آزاد */
  meta?: Record<string, unknown>;
  /** فهرست بلوک‌ها */
  blocks: CmsBlock[];
}

export class CmsContentEntity {
  private constructor(
    public readonly id: string,
    public readonly slot: CmsSlot,
    public readonly locale: CmsLocale,
    private _document: CmsDocument,
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public version: number,
    public publishedAt: Date | null,
  ) {}

  static create(data: {
    slot: string;
    locale?: string;
    document: CmsDocument;
    createdBy?: string | null;
    publishedAt?: Date | null;
  }): CmsContentEntity {
    const now = new Date();
    return new CmsContentEntity(
      crypto.randomUUID(),
      data.slot,
      data.locale ?? 'fa',
      data.document,
      data.createdBy ?? null,
      data.createdBy ?? null,
      now,
      now,
      1,
      data.publishedAt ?? null,
    );
  }

  static reconstitute(data: {
    id: string;
    slot: string;
    locale: string;
    document: CmsDocument;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    publishedAt: Date | null;
  }): CmsContentEntity {
    return new CmsContentEntity(
      data.id,
      data.slot,
      data.locale,
      data.document,
      data.createdBy,
      data.updatedBy,
      data.createdAt,
      data.updatedAt,
      data.version,
      data.publishedAt,
    );
  }

  get document(): CmsDocument {
    return this._document;
  }

  get isPublished(): boolean {
    return this.publishedAt !== null;
  }

  update(document: CmsDocument, userId?: string | null): void {
    this._document = document;
    this.version += 1;
    this.updatedAt = new Date();
    if (userId !== undefined) {
      (this as { updatedBy: string | null }).updatedBy = userId;
    }
  }

  publish(userId?: string | null): Date {
    this.publishedAt = new Date();
    this.version += 1;
    this.updatedAt = this.publishedAt;
    if (userId !== undefined) {
      (this as { updatedBy: string | null }).updatedBy = userId;
    }
    return this.publishedAt;
  }

  unpublish(): void {
    this.publishedAt = null;
    this.updatedAt = new Date();
  }
}
