'use client';

import Link from 'next/link';
import { Clock, Eye, Zap, BookOpen, ArrowUpRight, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DIFFICULTY_META } from '@/features/knowledge/lib/taxonomy-data';
import { StandardsList } from '../standards/standard-badge';
import { cn } from '@/lib/utils';

interface Props {
  article: {
    id: string;
    slug: string;
    title: string;
    summary?: string;
    difficulty?: string | null;
    readingTime?: number | null;
    publishedAt?: string | null;
    views?: number;
    standards?: { code: string; organization?: string }[];
    category?: string;
  };
  locale: string;
}

export function KnowledgeCardModern({ article, locale }: Props) {
  const diff = article.difficulty ? DIFFICULTY_META[article.difficulty] : null;
  const isAiEnhanced = !!article.standards?.length;

  return (
    <Link href={`/${locale}/knowledge/${article.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 card-hover">
        <div className="h-1 w-full bg-gradient-to-r from-primary to-accent opacity-60 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-5 flex flex-col h-[calc(100%-4px)]">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-1.5">
              {isAiEnhanced && (
                <div
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center"
                  title="AI Enhanced"
                >
                  <Zap className="h-3 w-3 text-white" />
                </div>
              )}
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>

          <h3 className="font-semibold text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {article.title}
          </h3>

          {article.summary && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
              {article.summary}
            </p>
          )}

          {article.standards && article.standards.length > 0 && (
            <div className="mb-3">
              <StandardsList standards={article.standards} />
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              {diff && <Badge className={cn('text-[10px] border-0', diff.color)}>{diff.fa}</Badge>}
              {article.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readingTime}′
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {article.views !== undefined && article.views > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {article.views.toLocaleString('fa-IR')}
                </span>
              )}
            </div>
          </div>

          {article.category && (
            <div className="mt-2 flex">
              <Badge variant="secondary" className="text-[10px]">
                {article.category}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function KnowledgeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 w-full bg-muted" />
      <CardContent className="p-5 space-y-3">
        <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-3 bg-muted rounded animate-pulse w-full" />
        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
      </CardContent>
    </Card>
  );
}
