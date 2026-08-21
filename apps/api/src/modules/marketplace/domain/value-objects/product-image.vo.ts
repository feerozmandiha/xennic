import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

const MAX_URL_LENGTH = 2048;
const MAX_ALT_LENGTH = 300;

/** فرمت‌های تصویری مجاز برای آلبوم محصول. */
export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
] as const;

export type ProductImageMimeType = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

export interface ProductImageData {
  id?: string;
  url: string;
  altFa?: string | null;
  altEn?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
  mimeType?: string | null;
  fileSize?: number | null;
}

export interface ProductImageJson {
  id: string;
  url: string;
  altFa: string | null;
  altEn: string | null;
  isPrimary: boolean;
  sortOrder: number;
  mimeType: string | null;
  fileSize: number | null;
}

/**
 * یک تصویر در آلبوم محصول.
 *
 * `url` می‌تواند مطلق (`https://…`) یا نسبی باشد (`/api/v1/storage/files/…/download`)
 * تا هم CDN بیرونی و هم فایل‌های آپلودشده در ماژول storage پشتیبانی شوند.
 */
export class ProductImage {
  private constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly altFa: string | null,
    public readonly altEn: string | null,
    public readonly isPrimary: boolean,
    public readonly sortOrder: number,
    public readonly mimeType: string | null,
    public readonly fileSize: number | null,
  ) {}

  static normalizeUrl(input: string | null | undefined): string {
    const url = (input ?? '').trim();
    if (!url) throw new BadRequestException('Image url is required');
    if (url.length > MAX_URL_LENGTH) {
      throw new BadRequestException(`Image url exceeds ${MAX_URL_LENGTH} characters`);
    }

    const isAbsolute = /^https?:\/\/\S+$/i.test(url);
    const isRelative = url.startsWith('/') && !url.startsWith('//');
    if (!isAbsolute && !isRelative) {
      throw new BadRequestException(
        `Invalid image url "${input}". Use an absolute http(s) url or a root-relative path`,
      );
    }
    return url;
  }

  static normalizeMimeType(input: string | null | undefined): string | null {
    const mime = (input ?? '').trim().toLowerCase();
    if (!mime) return null;
    if (!SUPPORTED_IMAGE_MIME_TYPES.includes(mime as ProductImageMimeType)) {
      throw new BadRequestException(
        `Unsupported image type "${input}". Supported: ${SUPPORTED_IMAGE_MIME_TYPES.join(', ')}`,
      );
    }
    return mime;
  }

  private static normalizeAlt(input: string | null | undefined, field: string): string | null {
    if (input == null) return null;
    const alt = String(input).trim();
    if (!alt) return null;
    if (alt.length > MAX_ALT_LENGTH) {
      throw new BadRequestException(`Image ${field} exceeds ${MAX_ALT_LENGTH} characters`);
    }
    return alt;
  }

  static create(data: ProductImageData): ProductImage {
    const sortOrder = data.sortOrder ?? 0;
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      throw new BadRequestException('Image sortOrder must be a non-negative integer');
    }

    const fileSize = data.fileSize ?? null;
    if (fileSize != null && (!Number.isInteger(fileSize) || fileSize < 0)) {
      throw new BadRequestException('Image fileSize must be a non-negative integer');
    }

    return new ProductImage(
      data.id ?? randomUUID(),
      ProductImage.normalizeUrl(data.url),
      ProductImage.normalizeAlt(data.altFa, 'altFa'),
      ProductImage.normalizeAlt(data.altEn, 'altEn'),
      data.isPrimary === true,
      sortOrder,
      ProductImage.normalizeMimeType(data.mimeType),
      fileSize,
    );
  }

  /** کپی با تغییرات جزئی — چون شیء تغییرناپذیر است. */
  with(patch: Partial<ProductImageData>): ProductImage {
    return ProductImage.create({
      id: this.id,
      url: patch.url !== undefined ? patch.url : this.url,
      altFa: patch.altFa !== undefined ? patch.altFa : this.altFa,
      altEn: patch.altEn !== undefined ? patch.altEn : this.altEn,
      isPrimary: patch.isPrimary !== undefined ? patch.isPrimary : this.isPrimary,
      sortOrder: patch.sortOrder !== undefined ? patch.sortOrder : this.sortOrder,
      mimeType: patch.mimeType !== undefined ? patch.mimeType : this.mimeType,
      fileSize: patch.fileSize !== undefined ? patch.fileSize : this.fileSize,
    });
  }

  /** متن جایگزین بر اساس زبان، با fallback به زبان دیگر. */
  altFor(locale: string): string | null {
    return locale === 'en' ? (this.altEn ?? this.altFa) : (this.altFa ?? this.altEn);
  }

  toJSON(): ProductImageJson {
    return {
      id: this.id,
      url: this.url,
      altFa: this.altFa,
      altEn: this.altEn,
      isPrimary: this.isPrimary,
      sortOrder: this.sortOrder,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
    };
  }
}
