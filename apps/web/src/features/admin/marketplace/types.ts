/**
 * انواع مشترک بخش «فروشگاه (بازارگاه)» در پنل ادمین.
 * قرارداد این تایپ‌ها با خروجی `marketplace.mapper.ts` در بک‌اند یکی است.
 */

export const PRODUCT_LOCALES = ['fa', 'en'] as const;
export type ProductLocale = (typeof PRODUCT_LOCALES)[number];

export const PRODUCT_LOCALE_LABELS: Record<ProductLocale, string> = {
  fa: 'فارسی',
  en: 'English',
};

/** یک تصویر در آلبوم محصول — آینهٔ `ProductImage` در بک‌اند. */
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

export interface ProductTranslation {
  locale: ProductLocale;
  title: string;
  description: string | null;
}

export type ProductStatus = 'active' | 'inactive' | 'archived';
export type VendorStatus = 'active' | 'inactive' | 'suspended';

export interface AdminProduct {
  id: string;
  vendorId: string;
  type: string;
  category: string | null;
  specifications: Record<string, unknown> | null;
  sku: string;
  price: number;
  currency: string;
  status: ProductStatus;
  title: string;
  description: string | null;
  resolvedLocale: ProductLocale | null;
  translations: ProductTranslation[];
  images: ProductImage[];
  primaryImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdminVendor {
  id: string;
  name: string;
  slug: string;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'فعال',
  inactive: 'غیرفعال',
  archived: 'بایگانی‌شده',
};

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  active: 'فعال',
  inactive: 'غیرفعال',
  suspended: 'تعلیق‌شده',
};

export const PRODUCT_TYPES = [
  { value: 'physical', label: 'فیزیکی' },
  { value: 'digital', label: 'دیجیتال' },
  { value: 'service', label: 'خدمت' },
  { value: 'course', label: 'دوره آموزشی' },
] as const;

export const CURRENCIES = ['IRR', 'USD', 'EUR'] as const;

/** دسته‌بندی‌های مهندسی — با `calc-category.map.ts` بک‌اند هم‌راستا است. */
export const ENGINEERING_CATEGORIES = [
  { value: 'cable', label: 'کابل' },
  { value: 'transformer', label: 'ترانسفورماتور' },
  { value: 'mccb', label: 'کلید کامپکت (MCCB)' },
  { value: 'acb', label: 'کلید هوایی (ACB)' },
  { value: 'fuse', label: 'فیوز' },
  { value: 'switchgear', label: 'تابلو برق' },
  { value: 'lighting', label: 'روشنایی' },
  { value: 'solar', label: 'خورشیدی' },
  { value: 'battery', label: 'باتری' },
  { value: 'motor', label: 'موتور' },
  { value: 'grounding', label: 'سیستم زمین' },
  { value: 'ppe', label: 'تجهیزات ایمنی (PPE)' },
] as const;

/**
 * کلیدهای پیشنهادی مشخصات فنی برای هر دسته — همان کلیدهایی که موتور
 * پیشنهاد محصول (`SPEC_MATCH_RULES`) در بک‌اند امتیازدهی می‌کند.
 */
export const SPEC_PRESETS: Record<string, string[]> = {
  cable: [
    'cable_size_mm2',
    'current_rating_a',
    'voltage_rating_v',
    'conductor_material',
    'insulation_type',
  ],
  transformer: ['rated_power_kva', 'impedance_pct', 'primary_voltage_kv', 'secondary_voltage_kv'],
  mccb: ['rated_current_a', 'breaking_capacity_ka', 'poles'],
  acb: ['rated_current_a', 'breaking_capacity_ka', 'poles'],
  fuse: ['rated_current_a', 'voltage_rating_v'],
  motor: ['rated_power_kw', 'current_a', 'rpm', 'efficiency_class'],
  battery: ['capacity_ah', 'voltage_rating_v'],
  solar: ['rated_power_w', 'efficiency_pct'],
  lighting: ['luminous_flux_lm', 'power_w', 'color_temperature_k'],
};
