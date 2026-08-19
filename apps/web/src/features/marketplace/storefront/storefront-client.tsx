'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { StorefrontProductCard, type StorefrontProduct } from './storefront-product-card';

export function StorefrontClient() {
  const t = useTranslations('marketplace');
  const tCommon = useTranslations('common');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [vendorId, setVendorId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['storefront', 'products', locale, search, category, vendorId],
    queryFn: () => {
      const q = new URLSearchParams();
      if (search) q.set('q', search);
      if (category) q.set('category', category);
      if (vendorId) q.set('vendorId', vendorId);
      q.set('locale', locale);
      q.set('limit', '60');
      return apiClient.get<{
        data: StorefrontProduct[];
        meta: { total: number };
      }>(`/public/marketplace/products?${q.toString()}`);
    },
    retry: false,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['storefront', 'categories'],
    queryFn: () =>
      apiClient.get<{ category: string; count: number }[]>('/public/marketplace/categories'),
    retry: false,
  });

  const { data: vendorsData } = useQuery({
    queryKey: ['storefront', 'vendors', locale],
    queryFn: () =>
      apiClient.get<{ data: { id: string; name: string }[] }>(
        '/public/marketplace/vendors?limit=100',
      ),
    retry: false,
  });

  const products = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const categories = categoriesData ?? [];
  const vendors = vendorsData?.data ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3">
        <Input
          placeholder={tCommon('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startIcon={<Search className="h-4 w-4" />}
          className="max-w-xl"
        />

        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <button
            onClick={() => setCategory('')}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              category === ''
                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
            )}
          >
            {t('all')}
          </button>
          {categories.map((c) => (
            <button
              key={c.category}
              onClick={() => setCategory(category === c.category ? '' : c.category)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                category === c.category
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
              )}
            >
              {c.category}
              <span className="ms-1 text-[10px] opacity-60">({c.count})</span>
            </button>
          ))}
        </div>

        {vendors.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">{t('vendor')}:</span>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="h-8 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-xs"
            >
              <option value="">{t('all')}</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
        {total} {t('products')}
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <StorefrontProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package className="mb-4 h-12 w-12 text-[hsl(var(--muted-foreground))] opacity-30" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noProducts')}</p>
        </div>
      )}
    </div>
  );
}
