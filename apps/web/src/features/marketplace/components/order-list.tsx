'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/stores/toast.store';
import { apiClient } from '@/lib/api/client';

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  pending: 'secondary',
  confirmed: 'warning',
  processing: 'warning',
  shipped: 'success',
  delivered: 'success',
  cancelled: 'destructive',
  refunded: 'destructive',
};

export function OrderList() {
  const t = useTranslations('marketplace');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const wsId = useAuthStore(s => s.workspaceId);

  const { data, isLoading } = useQuery({
    queryKey: ['marketplace', 'orders', wsId],
    queryFn: () => apiClient.get<any>('/orders?limit=50'),
    enabled: !!wsId,
    retry: false,
  });

  const orders = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <div>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">{total} {t('orders')}</p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <Card key={o.id} className="card-hover">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[var(--radius)] bg-[hsl(var(--primary)/0.08)] flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{o.id.slice(0, 8)}...</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {new Date(o.createdAt).toLocaleDateString('fa-IR')} · {o.items?.length ?? 0} {t('items')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {Number(o.totalAmount).toLocaleString('fa-IR')} {o.currency}
                  </span>
                  <Badge variant={STATUS_VARIANT[o.status] ?? 'secondary'} className="text-[10px]">
                    {o.status}
                  </Badge>
                  <a
                    href={`/${locale}/marketplace/orders/${o.id}`}
                    className="p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingCart className="h-12 w-12 text-[hsl(var(--muted-foreground))] opacity-30 mb-4" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noOrders')}</p>
        </div>
      )}
    </div>
  );
}
