'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Search, FolderKanban, BookOpen, MessageSquare, HardDrive,
  FileText, Bell, ArrowRight, Loader2,
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
  project:      'text-blue-500',
  standard:     'text-purple-500',
  conversation: 'text-emerald-500',
  article:      'text-amber-500',
  file:         'text-rose-500',
  notification: 'text-sky-500',
};

export function CommandPalette({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const wsId = useAuthStore(s => s.workspaceId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data, isFetching } = useQuery({
    queryKey: ['global-search', query, wsId],
    queryFn: () => apiClient.get<{ success: boolean; data: SearchResult[] }>(`/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2 && !!wsId,
    staleTime: 30_000,
  });

  const results = data?.data ?? [];

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      const r = results[selectedIndex];
      const path = r.url ? `/${locale}${r.url}` : `/${locale}`;
      router.push(path);
      onOpenChange(false);
    }
  }, [results, selectedIndex, router, locale, onOpenChange]);

  function ResultIcon({ type }: { type: string }) {
    const Icon = TYPE_ICONS[type] ?? FileText;
    return <Icon className={cn('h-4 w-4 shrink-0', TYPE_COLORS[type] ?? 'text-[hsl(var(--muted-foreground))]')} />;
  }

  function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      project:      'Project',
      standard:     'Standard',
      conversation: 'Conversation',
      article:      'Article',
      file:         'File',
      notification: 'Notification',
    };
    return labels[type] ?? type;
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in-fast"
        />
        <Dialog.Content
          className={cn(
            'fixed z-50 top-[15%] start-1/2 -translate-x-1/2',
            'w-[90vw] max-w-[580px]',
            'rounded-[var(--radius-lg)] border border-[hsl(var(--border))]',
            'bg-[hsl(var(--background)/0.98)] backdrop-blur-xl',
            'shadow-[var(--shadow-2xl)]',
            'animate-scale-in',
            'focus:outline-none',
          )}
          onKeyDown={onKeyDown}
        >
          <Dialog.Title className="sr-only">Command Palette</Dialog.Title>
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 h-12 border-b border-[hsl(var(--border))]">
            {isFetching ? (
              <Loader2 className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] animate-spin" />
            ) : (
              <Search className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('search')}
              className={cn(
                'flex-1 bg-transparent text-sm outline-none',
                'placeholder:text-[hsl(var(--muted-foreground)/0.6)]',
              )}
              dir="auto"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius)] text-[10px] font-mono border bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
              <span>{navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl'}</span>
              <span>K</span>
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[320px] overflow-y-auto p-2 space-y-0.5">
            {query.length >= 2 && results.length === 0 && !isFetching && (
              <div className="py-8 text-center">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {t('noData')}
                </p>
              </div>
            )}

            {query.length < 2 && (
              <div className="py-8 text-center">
                <Search className="h-8 w-8 mx-auto text-[hsl(var(--muted-foreground))] opacity-30 mb-2" />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {t('searchMinChars', { defaultValue: 'Type at least 2 characters to search' })}
                </p>
              </div>
            )}

            {results.map((result, i) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => {
                  const path = result.url ? `/${locale}${result.url}` : `/${locale}`;
                  router.push(path);
                  onOpenChange(false);
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={cn(
                  'w-full flex items-start gap-3 px-3 py-2.5 rounded-[var(--radius)] text-start transition-colors',
                  selectedIndex === i
                    ? 'bg-[hsl(var(--secondary))]'
                    : 'hover:bg-[hsl(var(--secondary)/0.5)]',
                )}
              >
                <ResultIcon type={result.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{result.title}</p>
                  {result.description && (
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate mt-0.5">
                      {result.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono uppercase">
                    {getTypeLabel(result.type)}
                  </span>
                  <ArrowRight className="h-3 w-3 text-[hsl(var(--muted-foreground))] rtl:rotate-180" />
                </div>
              </button>
            ))}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-3 px-4 h-8 border-t border-[hsl(var(--border))]">
            <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground)/0.6)]">
              <span>↑↓</span>
              <span className="text-xs">Navigate</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground)/0.6)]">
              <kbd className="px-1 py-0.5 rounded-[2px] text-[9px] font-mono border bg-[hsl(var(--secondary))]">↵</kbd>
              <span className="text-xs">Open</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground)/0.6)] ms-auto">
              <kbd className="px-1 py-0.5 rounded-[2px] text-[9px] font-mono border bg-[hsl(var(--secondary))]">ESC</kbd>
              <span className="text-xs">Close</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
