'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Package, Trash2, ArrowUpRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/stores/toast.store';
import { apiClient } from '@/lib/api/client';
import { ProductForm } from './product-form';

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  active: 'success',
  inactive: 'secondary',
  archived: 'destructive',
};

export function ProductList() {
  const t = useTranslations('marketplace');
  const tCommon = useTranslations('common');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const wsId = useAuthStore(s => s.workspaceId);
  const toast = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['marketplace', 'products', wsId, search],
    queryFn: () => apiClient.get<any>(`/products?q=${encodeURIComponent(search)}&limit=100`),
    enabled: !!wsId,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      toast.success(t('productDeleted'));
    },
    onError: () => toast.error(t('error')),
  });

  const products = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder={tCommon('search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            startIcon={<Search className="h-4 w-4" />}
            className="max-w-xs"
          />
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {total} {t('products')}
          </span>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          {t('newProduct')}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((p: any) => (
            <Card key={p.id} className="card-hover group">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[hsl(var(--primary)/0.08)] flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{p.sku}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{p.type}</p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(p.id)}
                    className="p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--muted-foreground)/0.4)] hover:text-[hsl(var(--destructive))] opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'} className="text-[10px]">
                      {p.status}
                    </Badge>
                    <span className="text-sm font-semibold">
                      {Number(p.price).toLocaleString('fa-IR')} {p.currency}
                    </span>
                  </div>
                  <a
                    href={`/${locale}/marketplace/products/${p.id}`}
                    className="inline-flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
                  >
                    {tCommon('details')} <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package className="h-12 w-12 text-[hsl(var(--muted-foreground))] opacity-30 mb-4" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noProducts')}</p>
        </div>
      )}

      <ProductForm open={showForm} onClose={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['marketplace'] }); }} />
    </div>
  );
}
