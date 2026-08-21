import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductImage } from './product-image.vo.js';
import type { ProductImageData, ProductImageJson } from './product-image.vo.js';

/** سقف تعداد تصاویر هر محصول. */
export const MAX_PRODUCT_IMAGES = 12;

/**
 * آلبوم تصاویر یک محصول — مجموعه‌ای تغییرناپذیر که ثابت‌های زیر را تضمین می‌کند:
 *
 * 1. `sortOrder` همیشه پیوسته و از صفر است (۰..n-۱)
 * 2. اگر آلبوم خالی نباشد، دقیقاً یک تصویر شاخص (`isPrimary`) دارد
 * 3. تصویر شاخص همیشه اول فهرست است
 * 4. آدرس تکراری پذیرفته نمی‌شود
 * 5. تعداد تصاویر از {@link MAX_PRODUCT_IMAGES} بیشتر نمی‌شود
 *
 * همهٔ متدهای تغییردهنده یک آلبوم جدید برمی‌گردانند.
 */
export class ProductGallery {
  private constructor(private readonly items: ProductImage[]) {}

  static empty(): ProductGallery {
    return new ProductGallery([]);
  }

  /** ساخت آلبوم از ورودی کاربر — خطاها پرتاب می‌شوند. */
  static create(items: ProductImageData[] | null | undefined): ProductGallery {
    if (!items || items.length === 0) return ProductGallery.empty();

    if (items.length > MAX_PRODUCT_IMAGES) {
      throw new BadRequestException(
        `A product can have at most ${MAX_PRODUCT_IMAGES} images (received ${items.length})`,
      );
    }

    const images = items.map((item) => ProductImage.create(item));
    ProductGallery.assertUniqueUrls(images);

    return new ProductGallery(ProductGallery.normalize(images));
  }

  /**
   * ساخت آلبوم از ردیف‌های دیتابیس — ردیف‌های نامعتبر یا تکراری نادیده گرفته
   * می‌شوند تا دادهٔ قدیمی هرگز یک مسیر خواندن را نشکند.
   */
  static fromPersistence(items: ProductImageData[] | null | undefined): ProductGallery {
    if (!items || items.length === 0) return ProductGallery.empty();

    const seenUrls = new Set<string>();
    const images: ProductImage[] = [];

    for (const item of items) {
      try {
        const image = ProductImage.create(item);
        if (seenUrls.has(image.url)) continue;
        seenUrls.add(image.url);
        images.push(image);
      } catch {
        // ردیف خراب — نادیده گرفته می‌شود
      }
    }

    return new ProductGallery(ProductGallery.normalize(images.slice(0, MAX_PRODUCT_IMAGES)));
  }

  private static assertUniqueUrls(images: ProductImage[]): void {
    const seen = new Set<string>();
    for (const image of images) {
      if (seen.has(image.url)) {
        throw new BadRequestException(`Duplicate image url: ${image.url}`);
      }
      seen.add(image.url);
    }
  }

  /** مرتب‌سازی + اعمال ثابت‌های تصویر شاخص و ترتیب پیوسته. */
  private static normalize(images: ProductImage[]): ProductImage[] {
    if (images.length === 0) return [];

    const ordered = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
    const primaryIndex = ordered.findIndex((image) => image.isPrimary);
    const resolvedPrimary = primaryIndex >= 0 ? primaryIndex : 0;

    const [primary] = ordered.splice(resolvedPrimary, 1);
    const finalOrder = [primary, ...ordered];

    return ProductGallery.renumber(finalOrder);
  }

  /**
   * شماره‌گذاری مجدد بر اساس ترتیب فعلی آرایه — بدون مرتب‌سازی دوباره.
   * برای زمانی که ترتیب نهایی از قبل مشخص است (افزودن، انتخاب شاخص، چیدمان).
   */
  private static renumber(images: ProductImage[]): ProductImage[] {
    return images.map((image, index) => image.with({ isPrimary: index === 0, sortOrder: index }));
  }

  get all(): ProductImage[] {
    return [...this.items];
  }

  get size(): number {
    return this.items.length;
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  get primary(): ProductImage | null {
    return this.items[0] ?? null;
  }

  get primaryUrl(): string | null {
    return this.primary?.url ?? null;
  }

  find(imageId: string): ProductImage | null {
    return this.items.find((image) => image.id === imageId) ?? null;
  }

  private require(imageId: string): ProductImage {
    const image = this.find(imageId);
    if (!image) throw new NotFoundException(`Image "${imageId}" not found for this product`);
    return image;
  }

  /** افزودن تصویر به انتهای آلبوم (یا به‌عنوان شاخص اگر درخواست شده باشد). */
  add(data: ProductImageData): ProductGallery {
    if (this.items.length >= MAX_PRODUCT_IMAGES) {
      throw new BadRequestException(`A product can have at most ${MAX_PRODUCT_IMAGES} images`);
    }

    const image = ProductImage.create({ ...data, sortOrder: data.sortOrder ?? this.items.length });
    if (this.items.some((existing) => existing.url === image.url)) {
      throw new BadRequestException(`Duplicate image url: ${image.url}`);
    }

    // اولین تصویر آلبوم به‌طور خودکار شاخص می‌شود
    const shouldBePrimary = image.isPrimary || this.items.length === 0;
    const next = shouldBePrimary ? [image, ...this.items] : [...this.items, image];

    return new ProductGallery(ProductGallery.renumber(next));
  }

  update(imageId: string, patch: Partial<ProductImageData>): ProductGallery {
    const current = this.require(imageId);
    const updated = current.with(patch);

    if (
      updated.url !== current.url &&
      this.items.some((image) => image.id !== imageId && image.url === updated.url)
    ) {
      throw new BadRequestException(`Duplicate image url: ${updated.url}`);
    }

    const next = this.items.map((image) => (image.id === imageId ? updated : image));

    // اگر این تصویر شاخص شد، بقیه از حالت شاخص خارج می‌شوند
    if (patch.isPrimary === true) return this.promote(next, imageId);
    return new ProductGallery(ProductGallery.normalize(next));
  }

  remove(imageId: string): ProductGallery {
    this.require(imageId);
    return new ProductGallery(
      ProductGallery.normalize(this.items.filter((image) => image.id !== imageId)),
    );
  }

  /** انتخاب تصویر شاخص. */
  setPrimary(imageId: string): ProductGallery {
    this.require(imageId);
    return this.promote(this.items, imageId);
  }

  private promote(images: ProductImage[], imageId: string): ProductGallery {
    const reordered = ProductGallery.renumber([
      ...images.filter((image) => image.id === imageId),
      ...images.filter((image) => image.id !== imageId),
    ]);

    return new ProductGallery(reordered);
  }

  /**
   * چیدمان مجدد بر اساس فهرست شناسه‌ها. فهرست باید دقیقاً شامل همان تصاویر
   * فعلی باشد؛ اولین شناسه تصویر شاخص می‌شود.
   */
  reorder(imageIds: string[]): ProductGallery {
    const unique = new Set(imageIds);
    if (unique.size !== imageIds.length) {
      throw new BadRequestException('Reorder payload contains duplicate image ids');
    }
    if (imageIds.length !== this.items.length) {
      throw new BadRequestException(
        `Reorder payload must list all ${this.items.length} image(s) of the product`,
      );
    }

    const reordered = ProductGallery.renumber(imageIds.map((imageId) => this.require(imageId)));
    return new ProductGallery(reordered);
  }

  toJSON(): ProductImageJson[] {
    return this.items.map((image) => image.toJSON());
  }
}
