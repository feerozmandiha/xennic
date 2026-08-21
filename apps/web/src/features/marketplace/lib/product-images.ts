/**
 * ابزارهای مشترک آلبوم تصاویر محصول (سمت وب).
 *
 * قواعد اینجا آینهٔ ثابت‌های دامنه در بک‌اند هستند: تصویر شاخص همیشه اول
 * فهرست است و `sortOrder` پیوسته و از صفر شمرده می‌شود.
 */

export const MAX_PRODUCT_IMAGES = 12;

export const PRODUCT_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
];

export interface ProductImage {
  id?: string;
  url: string;
  altFa?: string | null;
  altEn?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
  mimeType?: string | null;
  fileSize?: number | null;
}

/** آدرس معتبر است اگر مطلق http(s) یا مسیر ریشه‌ای باشد. */
export function isValidImageUrl(url: string): boolean {
  const value = (url ?? '').trim();
  if (!value || value.length > 2048) return false;
  if (/^https?:\/\/\S+$/i.test(value)) return true;
  return value.startsWith('/') && !value.startsWith('//');
}

/** تصویر شاخص را به ابتدا می‌برد و ترتیب را دوباره شماره‌گذاری می‌کند. */
export function normalizeImages(images: ProductImage[]): ProductImage[] {
  if (images.length === 0) return [];

  const primaryIndex = images.findIndex((image) => image.isPrimary);
  const ordered = [...images];
  const [primary] = ordered.splice(primaryIndex >= 0 ? primaryIndex : 0, 1);

  return [primary, ...ordered].map((image, index) => ({
    ...image,
    isPrimary: index === 0,
    sortOrder: index,
  }));
}

export function setPrimaryImage(images: ProductImage[], index: number): ProductImage[] {
  return normalizeImages(images.map((image, i) => ({ ...image, isPrimary: i === index })));
}

export function moveImage(images: ProductImage[], index: number, delta: number): ProductImage[] {
  const target = index + delta;
  if (target < 0 || target >= images.length) return images;

  const next = [...images];
  [next[index], next[target]] = [next[target], next[index]];
  return normalizeImages(next.map((image) => ({ ...image, isPrimary: false })));
}

export function removeImageAt(images: ProductImage[], index: number): ProductImage[] {
  return normalizeImages(images.filter((_, i) => i !== index));
}

export function addImage(images: ProductImage[], image: ProductImage): ProductImage[] {
  return normalizeImages([...images, { ...image, isPrimary: images.length === 0 }]);
}

/** برچسب جایگزین بر اساس زبان، با fallback به زبان دیگر. */
export function altFor(image: ProductImage, locale: string): string {
  const alt = locale === 'en' ? (image.altEn ?? image.altFa) : (image.altFa ?? image.altEn);
  return alt ?? '';
}

/** آدرس عمومی و ماندگار یک فایل بارگذاری‌شده در ماژول storage. */
export function publicImageUrl(fileId: string): string {
  return `/api/v1/storage/public/images/${fileId}`;
}

/** پیام خطای قابل‌فهم برای شکست بارگذاری تصویر. */
export function uploadErrorMessage(error: unknown): string {
  const status = (error as { status?: number } | null)?.status;
  const serverMessage = (error as { message?: string } | null)?.message ?? '';

  if (status === 503) {
    if (/credential|access key|signature/i.test(serverMessage)) {
      return 'کلیدهای MinIO پذیرفته نشد. مقادیر MINIO_ACCESS_KEY و MINIO_SECRET_KEY در .env با سرویس ذخیره‌سازی یکی نیست.';
    }
    return 'سرویس ذخیره‌سازی فایل (MinIO) در دسترس نیست. آن را بالا بیاورید یا فعلاً آدرس تصویر را وارد کنید.';
  }
  if (status === 413) return 'حجم فایل بیش از حد مجاز است.';
  if (status === 403) return 'برای بارگذاری فایل دسترسی لازم را ندارید.';
  if (status === 0) return 'ارتباط با سرور برقرار نشد.';

  return serverMessage.trim() ? serverMessage : 'خطا در بارگذاری تصویر';
}
