'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Search, Loader2, BookOpen } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/stores/toast.store';
import { Badge } from '@/components/ui/badge';

interface Standard {
  id: string;
  code: string;
  title: string;
  organization: string;
  version: string;
  status: string;
}

interface Props {
  articleId: string;
  linked: Standard[];
  onLinkedChange: () => void;
}

export function StandardsManager({ articleId, linked, onLinkedChange }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { data: searchData, isLoading: searching } = useQuery({
    queryKey: ['standards-search', search],
    queryFn: () =>
      apiClient.get<{ success: boolean; data: Standard[] }>(
        `/standards?q=${encodeURIComponent(search)}&limit=10`,
      ),
    enabled: search.length >= 2,
  });

  const linkMutation = useMutation({
    mutationFn: (standardId: string) =>
      apiClient.post(`/knowledge/${articleId}/standards`, { standardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'standards'] });
      toast.success('استاندارد متصل شد');
      onLinkedChange();
    },
    onError: () => toast.error('خطا در اتصال استاندارد'),
  });

  const unlinkMutation = useMutation({
    mutationFn: (standardId: string) =>
      apiClient.delete(`/knowledge/${articleId}/standards/${standardId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'standards'] });
      toast.success('استاندارد جدا شد');
      onLinkedChange();
    },
    onError: () => toast.error('خطا در جداسازی استاندارد'),
  });

  const searchResults = (searchData?.data ?? []).filter(
    (s) => !linked.find((l) => l.id === s.id),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {linked.length} استاندارد متصل شده
        </p>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="text-xs flex items-center gap-1 px-2 py-1 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition-colors"
        >
          <Plus className="h-3 w-3" />
          افزودن استاندارد
        </button>
      </div>

      {linked.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {linked.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[hsl(var(--secondary)/0.2)] text-xs group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="h-3 w-3 shrink-0 text-[hsl(var(--muted-foreground))]" />
                <span className="font-mono font-bold text-[hsl(var(--primary))] shrink-0">
                  {s.code}
                </span>
                <span className="truncate text-[hsl(var(--muted-foreground))]">{s.title}</span>
                <Badge variant="outline" className="text-[9px] h-4 shrink-0">
                  {s.organization}
                </Badge>
              </div>
              <button
                onClick={() => { if (confirm('جدا شود؟')) unlinkMutation.mutate(s.id); }}
                disabled={unlinkMutation.isPending}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-red-400 transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showSearch && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی استاندارد با کد یا عنوان..."
              className="w-full h-8 pr-8 pl-2 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs outline-none focus:border-[hsl(var(--primary))]"
              autoFocus
            />
          </div>

          {search.length >= 2 && (
            <div className="max-h-40 overflow-y-auto space-y-0.5 border border-[hsl(var(--border))] rounded-[var(--radius)] p-1">
              {searching ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--muted-foreground))]" />
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-xs text-[hsl(var(--muted-foreground))] text-center py-3">
                  استانداردی یافت نشد
                </p>
              ) : (
                searchResults.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => linkMutation.mutate(s.id)}
                    disabled={linkMutation.isPending}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-[hsl(var(--secondary))] transition-colors text-right"
                  >
                    <span className="font-mono font-bold text-[hsl(var(--primary))] shrink-0">
                      {s.code}
                    </span>
                    <span className="truncate">{s.title}</span>
                    <Badge variant="outline" className="text-[9px] h-4 mr-auto shrink-0">
                      {s.organization}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
