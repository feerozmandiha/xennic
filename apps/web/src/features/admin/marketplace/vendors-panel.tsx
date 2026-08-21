'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit3, Loader2, Plus, Search, Store, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/stores/toast.store';
import { apiErrorMessage, marketplaceAdminApi } from './marketplace-admin-api';
import { VENDOR_STATUS_LABELS } from './types';
import type { AdminVendor, VendorStatus } from './types';

const inputCls =
  'w-full px-2.5 py-1.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none focus:border-[hsl(var(--primary))] transition-colors';
const labelCls = 'text-[11px] font-medium text-[hsl(var(--muted-foreground))] block mb-1';

const STATUS_STYLES: Record<VendorStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-600',
  suspended: 'bg-amber-100 text-amber-700',
};

/** slug پیش‌نمایش — همان قاعدهٔ `VendorEntity.slugify` در بک‌اند. */
export function previewSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

export function VendorsPanel() {
  const toast = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminVendor | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<VendorStatus>('active');

  const vendorsQuery = useQuery({
    queryKey: ['admin', 'marketplace', 'vendors', search],
    queryFn: () => marketplaceAdminApi.listVendors(search || undefined),
  });

  const vendors = vendorsQuery.data?.data ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'marketplace'] });

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setName('');
    setSlug('');
    setStatus('active');
  };

  const startCreate = () => {
    setEditing(null);
    setName('');
    setSlug('');
    setStatus('active');
    setFormOpen(true);
  };

  const startEdit = (vendor: AdminVendor) => {
    setEditing(vendor);
    setName(vendor.name);
    setSlug(vendor.slug);
    setStatus(vendor.status);
    setFormOpen(true);
  };

  const createVendor = useMutation({
    mutationFn: (body: { name: string; slug?: string }) => marketplaceAdminApi.createVendor(body),
    onSuccess: () => {
      invalidate();
      toast.success('فروشنده ایجاد شد');
      closeForm();
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'خطا در ایجاد فروشنده')),
  });

  const updateVendor = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name?: string; status?: VendorStatus } }) =>
      marketplaceAdminApi.updateVendor(id, body),
    onSuccess: () => {
      invalidate();
      toast.success('فروشنده بروزرسانی شد');
      closeForm();
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'خطا در بروزرسانی فروشنده')),
  });

  const deleteVendor = useMutation({
    mutationFn: (id: string) => marketplaceAdminApi.deleteVendor(id),
    onSuccess: () => {
      invalidate();
      toast.success('فروشنده حذف شد');
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'حذف فروشنده ممکن نیست — ابتدا محصولات آن را حذف کنید')),
  });

  const submit = () => {
    if (!name.trim()) {
      toast.error('نام فروشنده الزامی است');
      return;
    }

    if (editing) {
      updateVendor.mutate({ id: editing.id, body: { name: name.trim(), status } });
      return;
    }

    const finalSlug = previewSlug(slug || name);
    if (!finalSlug) {
      toast.error('از نام واردشده نمی‌توان slug ساخت — یک slug لاتین وارد کنید');
      return;
    }
    createVendor.mutate({ name: name.trim(), slug: finalSlug });
  };

  const saving = createVendor.isPending || updateVendor.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative">
          <Search className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام یا slug…"
            className={cn(inputCls, 'w-56 pr-8')}
          />
        </div>
        <button
          onClick={startCreate}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm text-[hsl(var(--primary-foreground))] hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          فروشندهٔ جدید
        </button>
      </div>

      {formOpen && (
        <div className="space-y-3 rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.03)] p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Store className="h-4 w-4 text-[hsl(var(--primary))]" />
              {editing ? `ویرایش فروشنده — ${editing.slug}` : 'فروشندهٔ جدید'}
            </h3>
            <button
              onClick={closeForm}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[hsl(var(--secondary))]"
              aria-label="بستن"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelCls}>نام *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder="Siemens"
              />
            </div>

            {editing ? (
              <div>
                <label className={labelCls}>وضعیت</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VendorStatus)}
                  className={inputCls}
                >
                  {(Object.keys(VENDOR_STATUS_LABELS) as VendorStatus[]).map((key) => (
                    <option key={key} value={key}>
                      {VENDOR_STATUS_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className={labelCls}>slug (اختیاری)</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={inputCls}
                  placeholder={previewSlug(name) || 'siemens'}
                  dir="ltr"
                />
                <p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]" dir="ltr">
                  {previewSlug(slug || name) || '—'}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={closeForm}
              className="h-9 rounded-lg border border-[hsl(var(--border))] px-4 text-sm hover:bg-[hsl(var(--secondary))]"
            >
              انصراف
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 text-sm text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'ذخیره' : 'ایجاد'}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--secondary)/0.4)] text-[11px] text-[hsl(var(--muted-foreground))]">
            <tr>
              <th className="px-4 py-2.5 text-right font-medium">نام</th>
              <th className="px-4 py-2.5 text-right font-medium">slug</th>
              <th className="px-4 py-2.5 text-right font-medium">وضعیت</th>
              <th className="px-4 py-2.5 text-right font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {vendorsQuery.isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-[hsl(var(--primary))]" />
                </td>
              </tr>
            ) : vendors.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-xs text-[hsl(var(--muted-foreground))]"
                >
                  <Store className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  فروشنده‌ای ثبت نشده است
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-[hsl(var(--secondary)/0.25)]">
                  <td className="px-4 py-3 font-medium">{vendor.name}</td>
                  <td className="px-4 py-3 text-xs" dir="ltr">
                    {vendor.slug}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded px-2 py-0.5 text-[10px] font-medium',
                        STATUS_STYLES[vendor.status],
                      )}
                    >
                      {VENDOR_STATUS_LABELS[vendor.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(vendor)}
                        className="flex items-center gap-1 rounded border border-[hsl(var(--border))] px-2 py-1 text-xs hover:bg-[hsl(var(--secondary))]"
                      >
                        <Edit3 className="h-3 w-3" />
                        ویرایش
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`فروشندهٔ «${vendor.name}» حذف شود؟`))
                            deleteVendor.mutate(vendor.id);
                        }}
                        disabled={deleteVendor.isPending}
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

      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
        حذف فروشنده تنها زمانی ممکن است که هیچ محصولی به آن وابسته نباشد.
      </p>
    </div>
  );
}
