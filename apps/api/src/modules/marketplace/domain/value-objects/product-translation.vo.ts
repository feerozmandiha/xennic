import { BadRequestException } from '@nestjs/common';

/**
 * Locales supported by the marketplace product catalogue.
 * Persian (`fa`) is the platform default, English (`en`) is the secondary locale.
 */
export const SUPPORTED_PRODUCT_LOCALES = ['fa', 'en'] as const;

export type ProductLocale = (typeof SUPPORTED_PRODUCT_LOCALES)[number];

export const DEFAULT_PRODUCT_LOCALE: ProductLocale = 'fa';

/**
 * Order used both for deterministic sorting and for the resolution fallback
 * chain when a requested locale has no translation row.
 */
export const PRODUCT_LOCALE_FALLBACK_CHAIN: readonly ProductLocale[] = SUPPORTED_PRODUCT_LOCALES;

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 4000;

export interface ProductTranslationData {
  locale: string;
  title: string;
  description?: string | null;
}

export interface ProductTranslationJson {
  locale: ProductLocale;
  title: string;
  description: string | null;
}

/**
 * Immutable value object holding the localized marketing copy of a product.
 *
 * Owns every locale concern of the marketplace domain:
 * - normalization (`fa-IR` → `fa`, `EN` → `en`)
 * - validation of the supported locale set
 * - title/description trimming and length rules
 */
export class ProductTranslation {
  private constructor(
    public readonly locale: ProductLocale,
    public readonly title: string,
    public readonly description: string | null,
  ) {}

  /** Normalizes an arbitrary locale tag to a supported product locale. */
  static normalizeLocale(input: string | null | undefined): ProductLocale {
    const raw = (input ?? '').trim().toLowerCase();
    if (!raw) {
      throw new BadRequestException('Product translation locale is required');
    }

    const base = raw.split(/[-_]/)[0] as ProductLocale;
    if (!SUPPORTED_PRODUCT_LOCALES.includes(base)) {
      throw new BadRequestException(
        `Unsupported product locale "${input}". Supported locales: ${SUPPORTED_PRODUCT_LOCALES.join(', ')}`,
      );
    }
    return base;
  }

  /** Non-throwing variant of {@link normalizeLocale}. */
  static isSupportedLocale(input: string | null | undefined): boolean {
    try {
      ProductTranslation.normalizeLocale(input);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Resolves the locale to use for a read operation. Unsupported or missing
   * input silently degrades to the default locale instead of failing a query.
   */
  static resolveReadLocale(input: string | null | undefined): ProductLocale {
    return ProductTranslation.isSupportedLocale(input)
      ? ProductTranslation.normalizeLocale(input)
      : DEFAULT_PRODUCT_LOCALE;
  }

  static create(data: ProductTranslationData): ProductTranslation {
    const locale = ProductTranslation.normalizeLocale(data.locale);

    const title = typeof data.title === 'string' ? data.title.trim() : '';
    if (!title) {
      throw new BadRequestException(`Translation title is required for locale "${locale}"`);
    }
    if (title.length > MAX_TITLE_LENGTH) {
      throw new BadRequestException(
        `Translation title for locale "${locale}" exceeds ${MAX_TITLE_LENGTH} characters`,
      );
    }

    const rawDescription = data.description == null ? '' : String(data.description).trim();
    if (rawDescription.length > MAX_DESCRIPTION_LENGTH) {
      throw new BadRequestException(
        `Translation description for locale "${locale}" exceeds ${MAX_DESCRIPTION_LENGTH} characters`,
      );
    }

    return new ProductTranslation(locale, title, rawDescription || null);
  }

  /**
   * Builds a de-duplicated, deterministically ordered translation list.
   * When the same locale appears twice the last occurrence wins.
   */
  static collection(items: ProductTranslationData[] | null | undefined): ProductTranslation[] {
    if (!items || items.length === 0) return [];

    const byLocale = new Map<ProductLocale, ProductTranslation>();
    for (const item of items) {
      const translation = ProductTranslation.create(item);
      byLocale.set(translation.locale, translation);
    }
    return ProductTranslation.sort([...byLocale.values()]);
  }

  /**
   * Lenient counterpart of {@link collection} used when hydrating rows that are
   * already persisted: unknown locales or blank titles are skipped instead of
   * throwing, so legacy data can never break a read path.
   */
  static fromPersistence(items: ProductTranslationData[] | null | undefined): ProductTranslation[] {
    if (!items || items.length === 0) return [];

    const byLocale = new Map<ProductLocale, ProductTranslation>();
    for (const item of items) {
      try {
        const translation = ProductTranslation.create(item);
        byLocale.set(translation.locale, translation);
      } catch {
        // ignore unsupported / malformed rows
      }
    }
    return ProductTranslation.sort([...byLocale.values()]);
  }

  static sort(items: ProductTranslation[]): ProductTranslation[] {
    return [...items].sort(
      (a, b) =>
        PRODUCT_LOCALE_FALLBACK_CHAIN.indexOf(a.locale) -
        PRODUCT_LOCALE_FALLBACK_CHAIN.indexOf(b.locale),
    );
  }

  equals(other: ProductTranslation | null | undefined): boolean {
    if (!other) return false;
    return (
      this.locale === other.locale &&
      this.title === other.title &&
      this.description === other.description
    );
  }

  toJSON(): ProductTranslationJson {
    return { locale: this.locale, title: this.title, description: this.description };
  }
}
