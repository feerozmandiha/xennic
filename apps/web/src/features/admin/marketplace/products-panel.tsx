'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, Languages, Loader2, Package, Plus, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/stores/toast.store';
import { ProductEditor } from './product-editor';
import { apiErrorMessage, marketplaceAdminApi } from './marketplace-admin-api';
import type { ProductPayload, ProductUpdatePayload } from './marketplace-admin-api';
import {
  ENGINEERING_CATEGORIES,
  PRODUCT_LOCALES,
  PRODUCT_LOCALE_LABELS,
  PRODUCT_STATUS_LABELS,
} from './types';
import type { AdminProduct, ProductLocale, ProductStatus } from './types';

const inputCls =
  'px-2.5 py-1.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none focus:border-[hsl(var(--primary))] transition-colors';

const STATUS_STYLES: Record<ProductStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-600',
  archived: 'bg-red-100 text-red-600',
};

export function ProductsPanel() {
  const toast = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
  const [locale, setLocale] = useState<ProductLocale>('fa');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);

  const productsQuery = useQuery({
    queryKey: [
      'admin',
      'marketplace',
      'products',
      search,
      vendorFilter,
      categoryFilter,
      statusFilter,
      locale,
    ],
    queryFn: () =>
      marketplaceAdminApi.listProducts({
        q: search || undefined,
        vendorId: vendorFilter || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        locale,
      }),
  });

  const vendorsQuery = useQuery({
    queryKey: ['admin', 'marketplace', 'vendors'],
    queryFn: () => marketplaceAdminApi.listVendors(),
  });

  const products = productsQuery.data?.data ?? [];
  const vendors = useMemo(() => vendorsQuery.data?.data ?? [], [vendorsQuery.data]);
  const vendorNameById = useMemo(
    () => new Map(vendors.map((vendor) => [vendor.id, vendor.name])),
    [vendors],
  );

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'marketplace', 'products'] });

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
  };

  const createProduct = useMutation({
    mutationFn: (payload: ProductPayload) => marketplaceAdminApi.createProduct(payload),
    onSuccess: () => {
      invalidate();
      toast.success('محصول ایجاد شد');
      closeEditor();
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'خطا در ایجاد محصول')),
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductUpdatePayload }) =>
      marketplaceAdminApi.updateProduct(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success('محصول بروزرسانی شد');
      closeEditor();
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'خطا در بروزرسانی محصول')),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => marketplaceAdminApi.deleteProduct(id),
    onSuccess: () => {
      invalidate();
      toast.success('محصول حذف (بایگانی) شد');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'خطا در حذف محصول')),
  });

  const deleteTranslation = useMutation({
    mutationFn: ({ id, locale: target }: { id: string; locale: ProductLocale }) =>
      marketplaceAdminApi.deleteTranslation(id, target),
    onSuccess: () => {
      invalidate();
      toast.success('ترجمه حذف شد');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'خطا در حذف ترجمه')),
  });

  const saving = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="space-y-4">
      {/* نوار ابزار */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در SKU و عنوان…"
              className={cn(inputCls, 'w-56 pr-8')}
            />
          </div>

          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className={inputCls}
          >
            <option value="">همهٔ فروشندگان</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={inputCls}
          >
            <option value="">همهٔ دسته‌ها</option>
            {ENGINEERING_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProductStatus | '')}
            className={inputCls}
          >
            <option value="">همهٔ وضعیت‌ها</option>
            {(Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((key) => (
              <option key={key} value={key}>
                {PRODUCT_STATUS_LABELS[key]}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] p-0.5">
            {PRODUCT_LOCALES.map((item) => (
              <button
                key={item}
                onClick={() => setLocale(item)}
                className={cn(
                  'h-7 rounded-md px-2.5 text-[10px] font-medium transition-all',
                  locale === item
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'text-[hsl(var(--muted-foreground))]',
                )}
              >
                {PRODUCT_LOCALE_LABELS[item]}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setEditorOpen(true);
          }}
          disabled={vendors.length === 0}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-40"
          title={vendors.length === 0 ? 'ابتدا یک فروشنده بسازید' : undefined}
        >
          <Plus className="h-4 w-4" />
          محصول جدید
        </button>
      </div>

      {/* جدول محصولات */}
      <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--secondary)/0.4)] text-[11px] text-[hsl(var(--muted-foreground))]">
            <tr>
              <th className="px-4 py-2.5 text-right font-medium">محصول</th>
              <th className="px-4 py-2.5 text-right font-medium">فروشنده</th>
              <th className="px-4 py-2.5 text-right font-medium">دسته</th>
              <th className="px-4 py-2.5 text-right font-medium">قیمت</th>
              <th className="px-4 py-2.5 text-right font-medium">ترجمه‌ها</th>
              <th className="px-4 py-2.5 text-right font-medium">وضعیت</th>
              <th className="px-4 py-2.5 text-right font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {productsQuery.isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-[hsl(var(--primary))]" />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-xs text-[hsl(var(--muted-foreground))]"
                >
                  <Package className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  محصولی یافت نشد
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-[hsl(var(--secondary)/0.25)]">
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.title}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]" dir="ltr">
                      {product.sku}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {vendorNameById.get(product.vendorId) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {ENGINEERING_CATEGORIES.find((c) => c.value === product.category)?.label ??
                      product.category ??
                      '—'}
                  </td>
                  <td className="px-4 py-3 text-xs" dir="ltr">
                    {Number(product.price).toLocaleString('fa-IR')} {product.currency}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {PRODUCT_LOCALES.map((item) => {
                        const has = product.translations.some((t) => t.locale === item);
                        return (
                          <span
                            key={item}
                            title={
                              has
                                ? `ترجمهٔ ${PRODUCT_LOCALE_LABELS[item]} موجود است`
                                : `ترجمهٔ ${PRODUCT_LOCALE_LABELS[item]} ندارد`
                            }
                            className={cn(
                              'rounded px-1.5 py-0.5 text-[10px] font-medium uppercase',
                              has
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]',
                            )}
                          >
                            {item}
                          </span>
                        );
                      })}
                      {product.translations.length === 0 && (
                        <Languages className="h-3 w-3 text-[hsl(var(--muted-foreground)/0.5)]" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded px-2 py-0.5 text-[10px] font-medium',
                        STATUS_STYLES[product.status],
                      )}
                    >
                      {PRODUCT_STATUS_LABELS[product.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditing(product);
                          setEditorOpen(true);
                        }}
                        className="flex items-center gap-1 rounded border border-[hsl(var(--border))] px-2 py-1 text-xs hover:bg-[hsl(var(--secondary))]"
                      >
                        <Edit3 className="h-3 w-3" />
                        ویرایش
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`محصول «${product.title}» حذف شود؟`))
                            deleteProduct.mutate(product.id);
                        }}
                        disabled={deleteProduct.isPending}
                        className="flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-40"
                      >
                        <Trash2 className="h-3 w-3" />
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editorOpen && (
        <ProductEditor
          // با تغییر محصول در حال ویرایش، فرم از نو مقداردهی می‌شود
          key={editing?.id ?? 'new'}
          open={editorOpen}
          product={editing}
          vendors={vendors}
          saving={saving}
          onClose={closeEditor}
          onCreate={(payload) => createProduct.mutate(payload)}
          onUpdate={(id, payload) => updateProduct.mutate({ id, payload })}
          onDeleteTranslation={(id, target) => deleteTranslation.mutate({ id, locale: target })}
        />
      )}
    </div>
  );
}
