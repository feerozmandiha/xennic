'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, Clock, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  advanced: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  expert: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const DIFFICULTY_FA: Record<string, string> = {
  beginner: 'مبتدی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
  expert: 'متخصص',
};

interface Article {
  id: string;
  slug: string;
  status: string;
  visibility: string;
  language: string;
  version: number;
  content?: { title?: string; doc?: unknown };
  readingTime?: number | null;
  difficulty?: string | null;
  publishedAt?: string | null;
}

export function PublicKnowledgeClient() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['public-knowledge', page],
    queryFn: () =>
      apiClient.get<{ success: boolean; data: Article[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
        `/public/knowledge?page=${page}&limit=12&locale=${locale}`,
      ),
  });

  const articles = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, limit: 12, total: 0, totalPages: 0 };

  const filtered = search
    ? articles.filter((a) => {
        const title = a.content?.title || a.slug;
        return title.toLowerCase().includes(search.toLowerCase());
      })
    : articles;

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--primary)/0.05)] to-transparent">
        <div className="max-w-7xl mx-auto px-5 py-16 md:py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center mx-auto mb-6 shadow-[0_0_32px_hsl(var(--primary)/0.3)]">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            دانشنامه فنی برق
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-8">
            مرجع تخصصی مقالات، استانداردها و فرمول‌های مهندسی برق
          </p>

          <div className="relative max-w-md mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی مقالات..."
              className="w-full h-12 pr-12 pl-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] backdrop-blur-sm text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="h-16 w-16 mx-auto text-[hsl(var(--muted-foreground))] opacity-20 mb-4" />
            <h3 className="text-lg font-semibold mb-2">مقاله‌ای یافت نشد</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {search ? 'جستجوی خود را تغییر دهید' : 'هنوز مقاله‌ای منتشر نشده است'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article) => {
                const title = article.content?.title || article.slug;
                return (
                  <Link
                    key={article.id}
                    href={`/${locale}/knowledge/${article.slug}`}
                    className="group relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 hover:border-[hsl(var(--primary)/0.3)] hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.05)] transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.08)] flex items-center justify-center group-hover:bg-[hsl(var(--primary)/0.12)] transition-colors">
                        <Zap className="h-5 w-5 text-[hsl(var(--primary))]" />
                      </div>
                      {article.difficulty && (
                        <Badge className={`text-[10px] ${DIFFICULTY_COLOR[article.difficulty] ?? ''}`}>
                          {DIFFICULTY_FA[article.difficulty] ?? article.difficulty}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-base leading-snug mb-2 group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
                      {title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                      {article.readingTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readingTime} دقیقه
                        </span>
                      )}
                      {article.publishedAt && (
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString('fa-IR')}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-10 w-10 rounded-xl border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--secondary))] disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="text-sm text-[hsl(var(--muted-foreground))] px-4">
                  صفحه {meta.page} از {meta.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="h-10 w-10 rounded-xl border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--secondary))] disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
