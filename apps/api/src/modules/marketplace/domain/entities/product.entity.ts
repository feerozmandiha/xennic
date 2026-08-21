import { randomUUID } from 'node:crypto';
import {
  DEFAULT_PRODUCT_LOCALE,
  PRODUCT_LOCALE_FALLBACK_CHAIN,
  ProductTranslation,
} from '../value-objects/product-translation.vo.js';
import type {
  ProductLocale,
  ProductTranslationData,
} from '../value-objects/product-translation.vo.js';

export type ProductStatus = 'active' | 'inactive' | 'archived';

export class ProductEntity {
  private _translations: ProductTranslation[];

  constructor(
    public readonly id: string,
    private _vendorId: string,
    private _type: string,
    private _category: string | null,
    private _specifications: Record<string, any> | null,
    private _sku: string,
    private _price: number,
    private _currency: string,
    private _status: ProductStatus,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
    translations: ProductTranslation[] = [],
  ) {
    this._translations = ProductTranslation.sort(translations);
  }

  static create(data: {
    vendorId: string;
    type: string;
    category?: string;
    specifications?: Record<string, any>;
    sku?: string;
    price: number;
    currency?: string;
    translations?: ProductTranslationData[];
  }): ProductEntity {
    return new ProductEntity(
      randomUUID(),
      data.vendorId,
      data.type,
      data.category ?? null,
      data.specifications ?? null,
      data.sku ?? `SKU-${Date.now()}`,
      data.price,
      data.currency ?? 'USD',
      'active',
      new Date(),
      new Date(),
      null,
      ProductTranslation.collection(data.translations),
    );
  }

  static reconstitute(data: {
    id: string;
    vendorId: string;
    type: string;
    category?: string | null;
    specifications?: Record<string, any> | null;
    sku: string;
    price: number;
    currency: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    translations?: ProductTranslationData[] | null;
  }): ProductEntity {
    return new ProductEntity(
      data.id,
      data.vendorId,
      data.type,
      data.category ?? null,
      data.specifications ?? null,
      data.sku,
      data.price,
      data.currency,
      data.status as ProductStatus,
      data.createdAt,
      data.updatedAt,
      data.deletedAt,
      ProductTranslation.fromPersistence(data.translations),
    );
  }

  get vendorId(): string {
    return this._vendorId;
  }
  get type(): string {
    return this._type;
  }
  get category(): string | null {
    return this._category;
  }
  get specifications(): Record<string, any> | null {
    return this._specifications;
  }
  get sku(): string {
    return this._sku;
  }
  get price(): number {
    return this._price;
  }
  get currency(): string {
    return this._currency;
  }
  get status(): ProductStatus {
    return this._status;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  /** Defensive copy — translations are only mutated through the entity API. */
  get translations(): ProductTranslation[] {
    return [...this._translations];
  }

  get locales(): ProductLocale[] {
    return this._translations.map((t) => t.locale);
  }

  update(data: {
    type?: string;
    category?: string;
    specifications?: Record<string, any>;
    price?: number;
    currency?: string;
    status?: ProductStatus;
  }): void {
    if (data.type !== undefined) this._type = data.type;
    if (data.category !== undefined) this._category = data.category;
    if (data.specifications !== undefined) this._specifications = data.specifications;
    if (data.price !== undefined) this._price = data.price;
    if (data.currency !== undefined) this._currency = data.currency;
    if (data.status !== undefined) this._status = data.status;
    this._updatedAt = new Date();
  }

  // ── Translations ────────────────────────────────────────────────────────

  /**
   * Resolves the best translation for a locale using the fallback chain
   * requested → fa → en → first available. Returns `null` when the product
   * has no translation at all.
   */
  translationFor(locale?: string | null): ProductTranslation | null {
    const requested = ProductTranslation.resolveReadLocale(locale);
    const chain: ProductLocale[] = [requested, ...PRODUCT_LOCALE_FALLBACK_CHAIN];

    for (const candidate of chain) {
      const found = this._translations.find((t) => t.locale === candidate);
      if (found) return found;
    }
    return this._translations[0] ?? null;
  }

  /** Exact-match lookup — no fallback. */
  findTranslation(locale: string): ProductTranslation | null {
    const normalized = ProductTranslation.normalizeLocale(locale);
    return this._translations.find((t) => t.locale === normalized) ?? null;
  }

  hasTranslation(locale: string): boolean {
    return this.findTranslation(locale) !== null;
  }

  /** Inserts or replaces the translation of a single locale. */
  upsertTranslation(data: ProductTranslationData): ProductTranslation {
    const translation = ProductTranslation.create(data);
    const rest = this._translations.filter((t) => t.locale !== translation.locale);
    this._translations = ProductTranslation.sort([...rest, translation]);
    this._updatedAt = new Date();
    return translation;
  }

  /** Replaces the whole translation set (used by create/update payloads). */
  replaceTranslations(items: ProductTranslationData[] | null | undefined): ProductTranslation[] {
    this._translations = ProductTranslation.collection(items);
    this._updatedAt = new Date();
    return this.translations;
  }

  /** Returns `false` when the locale had no translation to remove. */
  removeTranslation(locale: string): boolean {
    const normalized = ProductTranslation.normalizeLocale(locale);
    const next = this._translations.filter((t) => t.locale !== normalized);
    if (next.length === this._translations.length) return false;

    this._translations = next;
    this._updatedAt = new Date();
    return true;
  }

  /** Display title for a locale, falling back to the SKU for untranslated products. */
  titleFor(locale: string = DEFAULT_PRODUCT_LOCALE): string {
    return this.translationFor(locale)?.title ?? this._sku;
  }

  softDelete(): void {
    this._status = 'archived';
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }
}
