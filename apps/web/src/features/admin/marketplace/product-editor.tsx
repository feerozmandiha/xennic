'use client';

import { useMemo, useState } from 'react';
import { Languages, Loader2, Package, Save, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/stores/toast.store';
import { ProductImageEditor } from '@/features/marketplace/components/product-image-editor';
import { normalizeImages } from '@/features/marketplace/lib/product-images';
import {
  SpecEditor,
  createSpecRow,
  duplicateSpecKeys,
  rowsToSpecs,
  specsToRows,
} from './spec-editor';
import type { SpecRow } from './spec-editor';
import {
  CURRENCIES,
  ENGINEERING_CATEGORIES,
  PRODUCT_LOCALES,
  PRODUCT_LOCALE_LABELS,
  PRODUCT_STATUS_LABELS,
  PRODUCT_TYPES,
} from './types';
import type {
  AdminProduct,
  AdminVendor,
  ProductImage,
  ProductLocale,
  ProductStatus,
} from './types';
import type { ProductPayload, ProductUpdatePayload } from './marketplace-admin-api';

const inputCls =
  'w-full px-2.5 py-1.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none focus:border-[hsl(var(--primary))] transition-colors';
const labelCls = 'text-[11px] font-medium text-[hsl(var(--muted-foreground))] block mb-1';

type TranslationDraft = Record<ProductLocale, { title: string; description: string }>;

function emptyTranslations(): TranslationDraft {
  return {
    fa: { title: '', description: '' },
    en: { title: '', description: '' },
  };
}

function translationsFromProduct(product?: AdminProduct | null): TranslationDraft {
  const draft = emptyTranslations();
  for (const translation of product?.translations ?? []) {
    if (translation.locale in draft) {
      draft[translation.locale] = {
        title: translation.title ?? '',
        description: translation.description ?? '',
      };
    }
  }
  return draft;
}

/**
 * آرایهٔ ترجمه‌هایی که باید به بک‌اند ارسال شود.
 * زبانی که عنوانش خالی باشد ارسال نمی‌شود و در حالت ویرایش یعنی «حذف آن ترجمه».
 */
export function buildTranslationsPayload(draft: TranslationDraft) {
  return PRODUCT_LOCALES.filter((locale) => draft[locale].title.trim() !== '').map((locale) => ({
    locale,
    title: draft[locale].title.trim(),
    description: draft[locale].description.trim() || undefined,
  }));
}

/**
 * آلبوم تصاویر آماده برای ارسال — ترتیب و تصویر شاخص نهایی می‌شود و
 * متن‌های جایگزین خالی حذف می‌شوند.
 */
export function buildImagesPayload(images: ProductImage[]): ProductImage[] {
  return normalizeImages(images).map((image) => ({
    id: image.id,
    url: image.url,
    altFa: image.altFa?.trim() ? image.altFa.trim() : undefined,
    altEn: image.altEn?.trim() ? image.altEn.trim() : undefined,
    isPrimary: image.isPrimary,
    sortOrder: image.sortOrder,
    mimeType: image.mimeType ?? undefined,
    fileSize: image.fileSize ?? undefined,
  }));
}

export interface ProductEditorProps {
  open: boolean;
  product?: AdminProduct | null;
  vendors: AdminVendor[];
  saving?: boolean;
  onClose: () => void;
  onCreate: (payload: ProductPayload) => void;
  onUpdate: (id: string, payload: ProductUpdatePayload) => void;
  onDeleteTranslation?: (id: string, locale: ProductLocale) => void;
}

export function ProductEditor({
  open,
  product,
  vendors,
  saving = false,
  onClose,
  onCreate,
  onUpdate,
  onDeleteTranslation,
}: ProductEditorProps) {
  const toast = useToast();
  const isEdit = Boolean(product);

  const [vendorId, setVendorId] = useState(product?.vendorId ?? '');
  const [type, setType] = useState(product?.type ?? 'physical');
  const [category, setCategory] = useState(product?.category ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [currency, setCurrency] = useState(product?.currency ?? 'IRR');
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'active');
  const [specRows, setSpecRows] = useState<SpecRow[]>(() => {
    const rows = specsToRows(product?.specifications);
    return rows.length > 0 ? rows : [createSpecRow()];
  });
  const [translations, setTranslations] = useState<TranslationDraft>(() =>
    translationsFromProduct(product),
  );
  const [images, setImages] = useState<ProductImage[]>(() =>
    normalizeImages(product?.images ?? []),
  );
  const [activeLocale, setActiveLocale] = useState<ProductLocale>('fa');

  const translatedLocales = useMemo(
    () => PRODUCT_LOCALES.filter((locale) => translations[locale].title.trim() !== ''),
    [translations],
  );

  if (!open) return null;

  const setTranslationField = (
    locale: ProductLocale,
    field: 'title' | 'description',
    value: string,
  ) => setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));

  const submit = () => {
    if (!vendorId) {
      toast.error('انتخاب فروشنده الزامی است');
      return;
    }
    const numericPrice = Number(price);
    if (!price.trim() || !Number.isFinite(numericPrice) || numericPrice < 0) {
      toast.error('قیمت معتبر وارد کنید');
      return;
    }
    const duplicates = duplicateSpecKeys(specRows);
    if (duplicates.length > 0) {
      toast.error(`کلید مشخصات تکراری است: ${duplicates.join('، ')}`);
      return;
    }
    if (translatedLocales.length === 0) {
      toast.error('حداقل عنوان یکی از زبان‌ها (فارسی یا انگلیسی) را وارد کنید');
      return;
    }

    const specifications = rowsToSpecs(specRows);
    const translationsPayload = buildTranslationsPayload(translations);
    const imagesPayload = buildImagesPayload(images);

    if (isEdit && product) {
      const payload: ProductUpdatePayload = {
        type,
        category: category || undefined,
        price: numericPrice,
        currency,
        status,
        specifications,
        translations: translationsPayload,
        images: imagesPayload,
      };
      onUpdate(product.id, payload);
      return;
    }

    onCreate({
      vendorId,
      type,
      category: category || undefined,
      sku: sku.trim() || undefined,
      price: numericPrice,
      currency,
      specifications,
      translations: translationsPayload,
      images: imagesPayload,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Package className="h-4 w-4 text-[hsl(var(--primary))]" />
            {isEdit ? `ویرایش محصول — ${product?.sku}` : 'محصول جدید'}
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[hsl(var(--secondary))]"
            aria-label="بستن"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* اطلاعات پایه */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelCls}>فروشنده *</label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              disabled={isEdit}
              className={cn(inputCls, isEdit && 'opacity-60')}
            >
              <option value="">انتخاب فروشنده…</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>نوع</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              {PRODUCT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>دسته‌بندی مهندسی</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            >
              <option value="">—</option>
              {ENGINEERING_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>SKU {isEdit ? '' : '(اختیاری)'}</label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              disabled={isEdit}
              className={cn(inputCls, isEdit && 'opacity-60')}
              placeholder="CABLE-35MM2-1KV"
              dir="ltr"
            />
          </div>

          <div>
            <label className={labelCls}>قیمت *</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputCls}
              placeholder="4900000"
              dir="ltr"
              inputMode="decimal"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelCls}>واحد پول</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={inputCls}
              >
                {CURRENCIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            {isEdit && (
              <div className="flex-1">
                <label className={labelCls}>وضعیت</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  className={inputCls}
                >
                  {(Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((key) => (
                    <option key={key} value={key}>
                      {PRODUCT_STATUS_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* تصاویر */}
        <div className="mt-4 rounded-xl border border-[hsl(var(--border))] p-3">
          <ProductImageEditor value={images} onChange={setImages} disabled={saving} />
        </div>

        {/* مشخصات فنی */}
        <div className="mt-4 rounded-xl border border-[hsl(var(--border))] p-3">
          <SpecEditor rows={specRows} category={category} onChange={setSpecRows} />
        </div>

        {/* ترجمه‌ها */}
        <div className="mt-4 rounded-xl border border-[hsl(var(--border))] p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
              <Languages className="h-3.5 w-3.5" />
              ترجمهٔ محصول
            </span>
            <div className="flex gap-1">
              {PRODUCT_LOCALES.map((locale) => {
                const filled = translations[locale].title.trim() !== '';
                return (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => setActiveLocale(locale)}
                    className={cn(
                      'flex items-center gap-1 h-7 px-3 rounded-lg border text-[10px] font-medium transition-all',
                      activeLocale === locale
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                        : 'bg-[hsl(var(--secondary)/0.3)] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
                    )}
                  >
                    {PRODUCT_LOCALE_LABELS[locale]}
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        filled ? 'bg-emerald-500' : 'bg-[hsl(var(--muted-foreground)/0.4)]',
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <label className={labelCls}>
                عنوان ({PRODUCT_LOCALE_LABELS[activeLocale]}){activeLocale === 'fa' ? ' *' : ''}
              </label>
              <input
                value={translations[activeLocale].title}
                onChange={(e) => setTranslationField(activeLocale, 'title', e.target.value)}
                className={inputCls}
                placeholder={
                  activeLocale === 'fa' ? 'کابل مسی ۳۵ میلی‌متر مربع' : 'Copper cable 35mm²'
                }
                dir={activeLocale === 'fa' ? 'rtl' : 'ltr'}
              />
            </div>
            <div>
              <label className={labelCls}>توضیحات ({PRODUCT_LOCALE_LABELS[activeLocale]})</label>
              <textarea
                value={translations[activeLocale].description}
                onChange={(e) => setTranslationField(activeLocale, 'description', e.target.value)}
                className={cn(inputCls, 'h-20 resize-y')}
                dir={activeLocale === 'fa' ? 'rtl' : 'ltr'}
              />
            </div>

            {isEdit &&
              product?.translations.some((t) => t.locale === activeLocale) &&
              onDeleteTranslation && (
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm(`ترجمهٔ «${PRODUCT_LOCALE_LABELS[activeLocale]}» حذف شود؟`))
                      return;
                    onDeleteTranslation(product.id, activeLocale);
                    setTranslations((prev) => ({
                      ...prev,
                      [activeLocale]: { title: '', description: '' },
                    }));
                  }}
                  className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-[10px] text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                  حذف ترجمهٔ {PRODUCT_LOCALE_LABELS[activeLocale]}
                </button>
              )}
          </div>

          <p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">
            زبانی که عنوان آن خالی بماند ذخیره نمی‌شود. اگر ترجمهٔ زبان درخواستی موجود نباشد،
            فروشگاه به‌ترتیب فارسی و سپس انگلیسی را نمایش می‌دهد.
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))]"
          >
            انصراف
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-1.5 h-9 rounded-lg bg-[hsl(var(--primary))] text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'ذخیرهٔ تغییرات' : 'ایجاد محصول'}
          </button>
        </div>
      </div>
    </div>
  );
}
