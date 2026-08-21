import type { ProductEntity } from '../../domain/entities/product.entity.js';
import type { VendorEntity } from '../../domain/entities/vendor.entity.js';
import type { ProductTranslationJson } from '../../domain/value-objects/product-translation.vo.js';
import { DEFAULT_PRODUCT_LOCALE } from '../../domain/value-objects/product-translation.vo.js';
import type { ProductImageJson } from '../../domain/value-objects/product-image.vo.js';

export interface ProductResponse {
  id: string;
  vendorId: string;
  type: string;
  category: string | null;
  specifications: Record<string, any> | null;
  sku: string;
  price: number;
  currency: string;
  status: string;
  /** Title resolved through the locale fallback chain (SKU when untranslated). */
  title: string;
  description: string | null;
  /** Locale actually used for `title`/`description`, `null` when untranslated. */
  resolvedLocale: string | null;
  translations: ProductTranslationJson[];
  /** آلبوم تصاویر — مرتب، تصویر شاخص در ابتدا. */
  images: ProductImageJson[];
  /** میان‌بر تصویر شاخص برای فهرست‌ها و کارت‌ها. */
  primaryImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface VendorResponse {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Domain entities keep their state in private fields, so returning them straight
 * from a controller would serialize as `_sku`, `_price`, … These mappers produce
 * the stable public contract instead.
 */
export function toProductResponse(
  entity: ProductEntity,
  locale: string = DEFAULT_PRODUCT_LOCALE,
): ProductResponse {
  const resolved = entity.translationFor(locale);

  return {
    id: entity.id,
    vendorId: entity.vendorId,
    type: entity.type,
    category: entity.category,
    specifications: entity.specifications,
    sku: entity.sku,
    price: entity.price,
    currency: entity.currency,
    status: entity.status,
    title: resolved?.title ?? entity.sku,
    description: resolved?.description ?? null,
    resolvedLocale: resolved?.locale ?? null,
    translations: entity.translations.map((t) => t.toJSON()),
    images: entity.gallery.toJSON(),
    primaryImageUrl: entity.primaryImageUrl,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
  };
}

export function toProductResponseList(
  entities: ProductEntity[],
  locale: string = DEFAULT_PRODUCT_LOCALE,
): ProductResponse[] {
  return entities.map((entity) => toProductResponse(entity, locale));
}

export function toVendorResponse(entity: VendorEntity): VendorResponse {
  return {
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    status: entity.status,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export function toVendorResponseList(entities: VendorEntity[]): VendorResponse[] {
  return entities.map(toVendorResponse);
}
