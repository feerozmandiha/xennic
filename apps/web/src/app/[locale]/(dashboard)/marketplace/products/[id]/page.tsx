'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';

export default function ProductDetailPage() {
  const t = useTranslations('marketplace');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const id = params?.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['marketplace', 'product', id],
    queryFn: () => apiClient.get<any>(`/products/${id}`),
    enabled: !!id,
    retry: false,
  });

  if (isLoading) return <Skeleton className="h-64" />;
  if (!data) return <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('notFound')}</p>;

  const p = data;

  return (
    <div>
      <Link
        href={`/${locale}/marketplace`}
        className="inline-flex items-center gap-1 text-sm text-[hsl(var(--primary))] hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToMarketplace')}
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[hsl(var(--primary)/0.08)] flex items-center justify-center">
              <Package className="h-7 w-7 text-[hsl(var(--primary))]" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold">{p.sku}</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{p.type}</p>
            </div>
            <Badge variant={p.status === 'active' ? 'success' : 'secondary'} className="text-xs">
              {p.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{t('price')}</p>
              <p className="text-lg font-bold">
                {Number(p.price).toLocaleString('fa-IR')} {p.currency}
              </p>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">SKU</p>
              <p className="text-sm font-medium">{p.sku}</p>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{t('vendor')}</p>
              <p className="text-sm font-medium">{p.vendorId}</p>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{t('createdAt')}</p>
              <p className="text-sm font-medium">{new Date(p.createdAt).toLocaleDateString('fa-IR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
