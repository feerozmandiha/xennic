'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BookOpen, Clock, Eye, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';

interface Article {
  id: string; title: string; slug: string; summary: string;
  category: string; authorName: string; readMinutes: number;
  viewCount: number; publishedAt: string | null;
}

const FALLBACK_ARTICLES: Article[] = [
  { id: '1', title: 'محاسبه سایز کابل بر اساس جریان و طول', slug: 'cable-sizing-guide', summary: 'راهنمای جامع سایزینگ کابل بر اساس استاندارد IEC 60364 — شامل جداول جریان مجاز و ضرایب تصحیح', category: 'cable', authorName: 'تیم فنی Xennic', readMinutes: 8, viewCount: 1240, publishedAt: null },
  { id: '2', title: 'تحلیل THD در سیستم‌های توزیع برق', slug: 'thd-analysis', summary: 'بررسی مفاهیم THD ولتاژ و جریان، محدودیت‌های IEEE 519 و روش‌های کاهش هارمونیک‌ها', category: 'power_quality', authorName: 'تیم فنی Xennic', readMinutes: 12, viewCount: 890, publishedAt: null },
  { id: '3', title: 'انتخاب ترانسفورماتور بر اساس بار', slug: 'transformer-selection', summary: 'روش محاسبه توان ترانسفورماتور، تلفات و تنظیم ولتاژ بر اساس استاندارد IEC 60076', category: 'transformer', authorName: 'تیم فنی Xennic', readMinutes: 10, viewCount: 1560, publishedAt: null },
];

export function ArticlesSection({ locale }: { locale: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['landing-articles'],
    queryFn: () => apiClient.get<{ success: boolean; data: Article[] }>('/articles?limit=3'),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const articles = data?.data?.length ? data.data.slice(0, 3) : FALLBACK_ARTICLES;

  return (
    <section id="articles" className="relative py-28 bg-[#050b14]">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-3">
            <p className="text-xs text-[#06b6d4] font-mono uppercase tracking-[0.2em]">// مقالات</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              آخرین مقالات مهندسی
            </h2>
            <p className="text-white/40 text-sm max-w-md">
              راهنماهای فنی، استانداردها و بهترین روش‌های مهندسی برق
            </p>
          </div>
          <Link
            href={`/${locale}/articles`}
            className="hidden sm:flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
          >
            همه مقالات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => (
              <Link key={article.id} href={`/${locale}/articles/${article.slug}`}>
                <Card className="h-full border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group">
                  <CardContent className="p-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#3b82f6]/20 text-[#93c5fd]">
                        {article.category}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-white/30">
                        <Clock className="h-3 w-3" />{article.readMinutes} دقیقه
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#3b82f6] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] text-white/30">{article.authorName}</span>
                      <span className="flex items-center gap-1 text-[10px] text-white/30">
                        <Eye className="h-3 w-3" />{article.viewCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link
            href={`/${locale}/articles`}
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
          >
            همه مقالات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
