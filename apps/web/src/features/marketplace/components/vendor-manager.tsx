'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/stores/toast.store';
import { apiClient } from '@/lib/api/client';

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'destructive'> = {
  active: 'success',
  inactive: 'secondary',
  suspended: 'destructive',
};

export function VendorManager() {
  const t = useTranslations('marketplace');
  const toast = useToast();
  const queryClient = useQueryClient();
  const wsId = useAuthStore(s => s.workspaceId);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['marketplace', 'vendors', wsId],
    queryFn: () => apiClient.get<any>('/vendors?limit=100'),
    enabled: !!wsId,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => apiClient.post('/vendors', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      toast.success(t('vendorCreated'));
      setShowForm(false);
      setName('');
    },
    onError: () => toast.error(t('error')),
  });

  const vendors = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[hsl(var(--muted-foreground))]">{vendors.length} {t('vendors')}</span>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          {t('newVendor')}
        </button>
      </div>

      {showForm && (
        <div className="flex gap-2 mb-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('vendorName')}
            className="flex-1 h-10 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 text-sm"
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter' && name.trim()) createMutation.mutate({ name: name.trim() });
            }}
          />
          <button
            onClick={() => { if (name.trim()) createMutation.mutate({ name: name.trim() }); }}
            className="h-10 px-4 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-sm font-medium"
          >
            {t('create')}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : vendors.length > 0 ? (
        <div className="space-y-2">
          {vendors.map((v: any) => (
            <Card key={v.id} className="card-hover">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[var(--radius)] bg-[hsl(var(--primary)/0.08)] flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{v.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{v.slug}</p>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[v.status] ?? 'secondary'} className="text-[10px]">
                  {v.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Building2 className="h-12 w-12 text-[hsl(var(--muted-foreground))] opacity-30 mb-4" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('noVendors')}</p>
        </div>
      )}
    </div>
  );
}
