'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Search, Loader2, BookOpen, Sparkles, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { manageKnowledgeApi } from '@/features/knowledge/lib/manage-api';
import { standardsApi } from '@/features/knowledge/lib/knowledge-api';
import { STANDARDS_REGISTRY } from '@/features/knowledge/lib/standards-data';
import { StandardBadge } from '../encyclopedia/standards/standard-badge';
import { useToast } from '@/stores/toast.store';

export function StandardsManagerModern({ articleId }: { articleId: string }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { data: linkedData, isLoading: linkedLoading } = useQuery({
    queryKey: ['knowledge', articleId, 'standards'],
    queryFn: () => manageKnowledgeApi.getStandards(articleId).then((r) => r.data),
  });

  const { data: searchData, isLoading: searching } = useQuery({
    queryKey: ['standards-search-modern', search],
    queryFn: async () => {
      // Try API first
      try {
        const res = await standardsApi.list({ q: search, limit: 8 });
        if (res.data?.length) return res.data;
      } catch {}
      // Fallback to local registry
      return STANDARDS_REGISTRY.filter(
        (s) => s.code.toLowerCase().includes(search.toLowerCase()) || s.titleFa.includes(search),
      )
        .slice(0, 8)
        .map((s) => ({
          id: s.code,
          code: s.code,
          title: s.titleFa,
          organization: s.organization,
          version: s.year ?? '2023',
          status: 'active',
        }));
    },
    enabled: search.length >= 2,
  });

  const linkMutation = useMutation({
    mutationFn: async (standardIdOrCode: string) => {
      // If id is actually code, resolve to real id via API
      let realId = standardIdOrCode;
      if (
        !standardIdOrCode.includes('-') ||
        standardIdOrCode.startsWith('IEC') ||
        standardIdOrCode.startsWith('IEEE')
      ) {
        try {
          const res = await standardsApi.list({ q: standardIdOrCode, limit: 1 });
          if (res.data?.[0]?.id) realId = res.data[0].id;
        } catch {}
      }
      return manageKnowledgeApi.linkStandard(articleId, realId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'standards'] });
      toast.success('استاندارد متصل شد');
    },
    onError: () =>
      toast.error('خطا در اتصال — شاید استاندارد در دیتابیس نیست، ابتدا از پنل ادمین اضافه کن'),
  });

  const unlinkMutation = useMutation({
    mutationFn: (standardId: string) => manageKnowledgeApi.unlinkStandard(articleId, standardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'standards'] });
      toast.success('جدا شد');
    },
  });

  const linked = linkedData ?? [];
  const searchResults = ((searchData as any[]) ?? []).filter(
    (s: any) => !linked.find((l) => l.id === s.id || l.code === s.code),
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4" /> استانداردهای مهندسی
          <Badge variant="secondary" className="text-[10px]">
            {linked.length}
          </Badge>
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowSearch(!showSearch)}>
          <Plus className="h-4 w-4" /> افزودن
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {linkedLoading ? (
          <p className="text-xs text-muted-foreground">در حال بارگذاری...</p>
        ) : linked.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-xl">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground opacity-20 mb-2" />
            <p className="text-xs text-muted-foreground">هنوز استانداردی لینک نشده</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              مثلا IEC 60364-5-52 برای کابل LV
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {linked.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-2.5 rounded-xl border bg-card hover:border-primary/20 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <StandardBadge code={s.code} organization={s.organization} size="xs" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{s.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {s.organization} • {s.version}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('جدا شود؟')) unlinkMutation.mutate(s.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showSearch && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو: IEC 60364, IEEE 80, NEC..."
                className="w-full h-10 pr-10 pl-3 rounded-xl border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>

            {search.length >= 2 && (
              <div className="rounded-xl border bg-card max-h-64 overflow-y-auto">
                {searching ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    نتیجه‌ای یافت نشد
                  </p>
                ) : (
                  <div className="p-1">
                    {searchResults.map((s: any) => (
                      <button
                        key={s.id || s.code}
                        onClick={() => linkMutation.mutate(s.id || s.code)}
                        disabled={linkMutation.isPending}
                        className="w-full text-right p-2.5 rounded-xl hover:bg-secondary flex items-center gap-2 transition-colors"
                      >
                        <StandardBadge code={s.code} organization={s.organization} size="xs" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{s.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {s.organization} • {s.version}
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="border-t p-2 bg-muted/30 text-[10px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> پیشنهاد هوشمند بر اساس محاسبات مرتبط
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
