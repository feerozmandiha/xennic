'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowRight, Clock, User, Calendar, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { KnowledgeRenderer } from './knowledge-editor';

const STATUS_FA: Record<string, string> = {
  published: 'منتشرشده',
  draft: 'پیش‌نویس',
  review: 'در انتظار بررسی',
  archived: 'آرشیو',
};

const DIFFICULTY_FA: Record<string, string> = {
  beginner: 'مبتدی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
  expert: 'متخصص',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  advanced: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  expert: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
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
  authorId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}

interface Props {
  slug: string;
}

export function PublicKnowledgeDetailClient({ slug }: Props) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  const { data, isLoading } = useQuery({
    queryKey: ['public-knowledge', slug],
    queryFn: () =>
      apiClient.get<{ success: boolean; data: Article }>(`/public/knowledge/${slug}`),
    retry: false,
  });

  const article = data?.data;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-16 space-y-6">
        <div className="h-8 w-64 bg-[hsl(var(--muted)/0.5)] rounded-lg animate-pulse" />
        <div className="h-64 bg-[hsl(var(--muted)/0.3)] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <BookOpen className="h-16 w-16 mx-auto text-[hsl(var(--muted-foreground))] opacity-20 mb-4" />
        <h3 className="text-lg font-semibold mb-2">مقاله یافت نشد</h3>
        <Link
          href={`/${locale}/knowledge`}
          className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--primary))] hover:underline mt-4"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به دانشنامه
        </Link>
      </div>
    );
  }

  const title = (article as any).content?.title || article.slug;

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <Link
        href={`/${locale}/knowledge`}
        className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-8"
      >
        <ArrowRight className="h-4 w-4" />
        بازگشت به دانشنامه
      </Link>

      <article>
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
            {article.difficulty && (
              <Badge className={DIFFICULTY_COLOR[article.difficulty] ?? ''}>
                {DIFFICULTY_FA[article.difficulty] ?? article.difficulty}
              </Badge>
            )}
            {article.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readingTime} دقیقه مطالعه
              </span>
            )}
            {article.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(article.publishedAt).toLocaleDateString('fa-IR')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              نسخه {article.version}
            </span>
          </div>
        </header>

        <div className="prose prose-sm max-w-none dark:prose-invert">
          {article.content && Object.keys(article.content).length > 0 ? (
            <KnowledgeRenderer content={article.content} />
          ) : (
            <p className="text-[hsl(var(--muted-foreground))] italic">
              محتوایی ثبت نشده است
            </p>
          )}
        </div>
      </article>

      <div className="mt-16 pt-8 border-t border-[hsl(var(--border))]">
        <Link
          href={`/${locale}/knowledge`}
          className="inline-flex items-center gap-2 text-sm text-[hsl(var(--primary))] hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          سایر مقالات دانشنامه
        </Link>
      </div>
    </div>
  );
}
