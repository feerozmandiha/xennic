'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/stores/toast.store';
import { apiClient } from '@/lib/api/client';

const ENGINEERING_CATEGORIES = [
  { value: '', label: '—' },
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
  { value: 'grounding', label: 'زمین' },
  { value: 'ppe', label: 'PPE / تجهیزات ایمنی' },
];

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: any;
}

export function ProductForm({ open, onClose, product }: ProductFormProps) {
  const t = useTranslations('marketplace');
  const toast = useToast();
  const wsId = useAuthStore(s => s.workspaceId);

  const [vendorId, setVendorId] = useState(product?.vendorId ?? '');
  const [type, setType] = useState(product?.type ?? 'physical');
  const [category, setCategory] = useState(product?.category ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [price, setPrice] = useState(String(product?.price ?? ''));
  const [currency, setCurrency] = useState(product?.currency ?? 'USD');
  const [specsJson, setSpecsJson] = useState(
    product?.specifications ? JSON.stringify(product.specifications, null, 2) : '',
  );

  const { data: vendorsData } = useQuery({
    queryKey: ['marketplace', 'vendors', wsId],
    queryFn: () => apiClient.get<any>('/vendors?limit=100'),
    enabled: !!wsId && open,
  });

  const createMutation = useMutation({
    mutationFn: (body: any) =>
      product
        ? apiClient.patch(`/products/${product.id}`, body)
        : apiClient.post('/products', body),
    onSuccess: () => {
      toast.success(product ? t('productUpdated') : t('productCreated'));
      onClose();
    },
    onError: () => toast.error(t('error')),
  });

  if (!open) return null;

  const handleSubmit = () => {
    if (!vendorId) { toast.error(t('selectVendorFirst')); return; }

    let specifications: Record<string, any> | undefined;
    if (specsJson.trim()) {
      try {
        specifications = JSON.parse(specsJson);
      } catch {
        toast.error('فرمت specifications نامعتبر است (JSON معتبر وارد کنید)');
        return;
      }
    }

    createMutation.mutate({
      vendorId, type, category: category || undefined,
      sku, price: Number(price), currency,
      specifications,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[hsl(var(--card))] rounded-[var(--radius-xl)] border border-[hsl(var(--border))] shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-6">{product ? t('editProduct') : t('newProduct')}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('vendor')}</label>
            <select
              value={vendorId}
              onChange={e => setVendorId(e.target.value)}
              className="w-full h-10 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 text-sm"
            >
              <option value="">{t('selectVendor')}</option>
              {(vendorsData?.data ?? []).map((v: any) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">{t('type')}</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full h-10 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 text-sm"
              >
                <option value="digital">Digital</option>
                <option value="physical">Physical</option>
                <option value="service">Service</option>
                <option value="course">Course</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">دسته‌بندی مهندسی</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full h-10 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 text-sm"
              >
                {ENGINEERING_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input
              value={sku}
              onChange={e => setSku(e.target.value)}
              className="w-full h-10 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 text-sm"
              placeholder="e.g. CABLE-35MM2-1KV"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">{t('price')}</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full h-10 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 text-sm"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium mb-1">{t('currency')}</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full h-10 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="IRR">IRR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              مشخصات فنی (JSON) <span className="text-[hsl(var(--muted-foreground))]">اختیاری</span>
            </label>
            <textarea
              value={specsJson}
              onChange={e => setSpecsJson(e.target.value)}
              className="w-full h-24 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm font-mono"
              placeholder='{"cable_size_mm2": 35, "current_rating_a": 150, "voltage_rating_v": 1000}'
              dir="ltr"
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              مشخصات فنی محصول را به صورت JSON وارد کنید. مثال: voltage_rating_v, current_rating_a, cable_size_mm2, rated_power_kva
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-[var(--radius)] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 h-9 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {product ? t('update') : t('create')}
          </button>
        </div>
      </div>
    </div>
  );
}
