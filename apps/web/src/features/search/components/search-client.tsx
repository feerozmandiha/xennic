'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Loader2, FolderKanban, BookOpen, MessageSquare,
  HardDrive, FileText, Bell, ArrowLeft, X,
  Filter, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: 'project' | 'standard' | 'conversation' | 'article' | 'file' | 'notification';
  id: string;
  title: string;
  description: string;
  url: string;
  workspaceId: string | null;
  createdAt: string | null;
}

interface SearchMeta {
  total: number;
  page: number;
  limit: number;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  project:      FolderKanban,
  standard:     FileText,
  conversation: MessageSquare,
  article:      BookOpen,
  file:         HardDrive,
  notification: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  project:      'text-blue-500 bg-blue-50 border-blue-200',
  standard:     'text-purple-500 bg-purple-50 border-purple-200',
  conversation: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  article:      'text-amber-500 bg-amber-50 border-amber-200',
  file:         'text-rose-500 bg-rose-50 border-rose-200',
  notification: 'text-sky-500 bg-sky-50 border-sky-200',
};

const TYPE_LABELS: Record<string, string> = {
  project:      'پروژه',
  standard:     'استاندارد',
  conversation: 'مکالمه',
  article:      'مقاله',
  file:         'فایل',
  notification: 'اعلان',
};

const ALL_TYPES = ['project', 'standard', 'conversation', 'article', 'file', 'notification'] as const;

export function SearchClient() {
  const locale = useLocale();
  const router = useRouter();
  const wsId = useAuthStore(s => s.workspaceId);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { data, isFetching } = useQuery({
    queryKey: ['search', searchQ, [...selectedTypes], page, wsId],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('q', searchQ);
      params.set('page', String(page));
      params.set('limit', String(LIMIT));
      selectedTypes.forEach(t => params.append('type', t));
      return apiClient.get<{ success: boolean; data: SearchResult[]; meta: SearchMeta }>(
        `/search?${params.toString()}`,
      );
    },
    enabled: searchQ.length >= 2 && !!wsId,
    staleTime: 15_000,
  });

  const results = data?.data ?? [];
  const meta = data?.meta;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(() => {
    if (query.trim().length >= 2) {
      setSearchQ(query.trim());
      setPage(1);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch();
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
    setPage(1);
  };

  const clearAll = () => {
    setQuery('');
    setSearchQ('');
    setSelectedTypes(new Set());
    setPage(1);
    inputRef.current?.focus();
  };

  const navigateTo = (url: string) => {
    router.push(`/${locale}${url}`);
  };

  const totalPages = meta ? Math.ceil(meta.total / LIMIT) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-black flex items-center gap-2">
          <Search className="h-5 w-5 text-[hsl(var(--primary))]" />
          جستجو
        </h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
          جستجوی سراسری در پروژه‌ها، مقالات، استانداردها، فایل‌ها و...
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="جستجو کنید..."
          className={cn(
            'w-full h-11 pr-10 pl-12 rounded-xl border border-[hsl(var(--border))]',
            'bg-[hsl(var(--background))] text-sm outline-none',
            'focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)]',
            'transition-all',
          )}
        />
        {query && (
          <button onClick={() => setQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-lg hover:bg-[hsl(var(--secondary))]">
            <X className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          </button>
        )}
        <button onClick={doSearch}
          disabled={query.trim().length < 2}
          className="absolute left-12 top-1/2 -translate-y-1/2 h-7 px-3 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-medium hover:opacity-90 disabled:opacity-40">
          جستجو
        </button>
      </div>

      {/* Type filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
        {ALL_TYPES.map(type => {
          const Icon = TYPE_ICONS[type];
          const isSelected = selectedTypes.size === 0 || selectedTypes.has(type);
          return (
            <button key={type} onClick={() => toggleType(type)}
              className={cn(
                'flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[10px] font-medium border transition-all',
                isSelected
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                  : 'bg-[hsl(var(--secondary)/0.3)] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]',
              )}>
              <Icon className="h-3 w-3" />
              {TYPE_LABELS[type]}
            </button>
          );
        })}
        {searchQ && (
          <button onClick={clearAll}
            className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-[10px] font-medium border border-red-200 text-red-500 hover:bg-red-50">
            <X className="h-3 w-3" />
            پاک کردن
          </button>
        )}
      </div>

      {/* Results */}
      {searchQ.length >= 2 && (
        <div className="space-y-3">
          {/* Meta info */}
          {meta && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {meta.total} نتیجه برای &quot;{searchQ}&quot;
                {meta.page > 1 && ` (صفحه ${meta.page})`}
              </p>
              {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin text-[hsl(var(--muted-foreground))]" />}
            </div>
          )}

          {/* Results list */}
          <div className="space-y-2">
            {isFetching && results.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-[hsl(var(--secondary)/0.5)] animate-pulse" />
              ))
            ) : results.length === 0 ? (
              <div className="py-12 text-center">
                <Search className="h-10 w-10 mx-auto text-[hsl(var(--muted-foreground))] opacity-20 mb-3" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  نتیجه‌ای برای &quot;{searchQ}&quot; یافت نشد
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  عبارتی دیگر را امتحان کنید یا فیلترها را تغییر دهید
                </p>
              </div>
            ) : (
              results.map((result, i) => {
                const Icon = TYPE_ICONS[result.type] ?? FileText;
                const colorClass = TYPE_COLORS[result.type] ?? 'text-gray-500 bg-gray-50 border-gray-200';
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => navigateTo(result.url)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-xl border border-[hsl(var(--border))]',
                      'hover:bg-[hsl(var(--secondary)/0.3)] hover:border-[hsl(var(--primary)/0.3)]',
                      'transition-all text-right',
                      'group',
                    )}
                  >
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center border shrink-0', colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                        {result.title}
                      </p>
                      {result.description && (
                        <p className="text-[11px] text-[hsl(var(--muted-foreground))] line-clamp-2 mt-0.5">
                          {result.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'text-[10px] font-medium px-1.5 py-0.5 rounded',
                          'bg-[hsl(var(--secondary)/0.5)] text-[hsl(var(--muted-foreground))]',
                        )}>
                          {TYPE_LABELS[result.type] ?? result.type}
                        </span>
                        {result.createdAt && (
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                            {new Date(result.createdAt).toLocaleDateString('fa-IR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowLeft className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)}
                    className={cn(
                      'h-8 w-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all',
                      pageNum === page
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                        : 'border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]',
                    )}>
                    {pageNum.toLocaleString('fa-IR')}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Initial state */}
      {searchQ.length < 2 && (
        <div className="py-16 text-center">
          <Search className="h-16 w-16 mx-auto text-[hsl(var(--muted-foreground))] opacity-10 mb-4" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            حداقل ۲ کاراکتر برای جستجو وارد کنید
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            در پروژه‌ها، مقالات، استانداردها، فایل‌ها، مکالمات و اعلان‌ها جستجو کنید
          </p>
        </div>
      )}
    </div>
  );
}
