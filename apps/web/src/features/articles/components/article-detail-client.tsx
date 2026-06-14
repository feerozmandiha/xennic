'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft, Clock, Eye, Heart, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { CommentsSection } from './comments-section';
import { cn } from '@/lib/utils';

interface Article {
  id: string; title: string; slug: string; summary: string; content: string;
  category: string; tags: string[]; authorName: string;
  readMinutes: number; viewCount: number; likeCount: number;
  publishedAt: string | null;
}

interface ArticleResponse { success: boolean; data: Article; }

export function ArticleDetailClient({ params: _p }: { params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string } }) {
  const router = useRouter();
  const routeParams = useParams();
  const slug  = (routeParams?.slug as string) ?? '';
  const locale = (routeParams?.locale as string) ?? 'fa';
  const [liked, setLiked] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn:  () => apiClient.get<ArticleResponse>(`/articles/${slug}`),
    enabled:  !!slug,
  });

  const likeMutation = useMutation({
    mutationFn: () => apiClient.post(`/articles/${slug}/like`),
    onSuccess:  () => setLiked(true),
  });

  const article = data?.data;

  if (isLoading) return (
    <div className="min-h-screen bg-[#050b14] flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-white/50" />
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center gap-4 text-center px-5">
      <h1 className="text-2xl font-bold text-white">مقاله یافت نشد</h1>
      <p className="text-white/50 text-sm">مقاله مورد نظر شما وجود ندارد یا حذف شده است.</p>
      <button onClick={() => router.push(`/${locale}/articles`)} className="flex items-center gap-2 text-sm text-[#3b82f6] hover:underline">
        <ChevronLeft className="h-4 w-4" />بازگشت به مقالات
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050b14]">
      <div className="max-w-3xl mx-auto px-5 py-16 space-y-6">
        <button onClick={() => router.push(`/${locale}/articles`)}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4" />بازگشت به مقالات
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#3b82f6]/20 text-[#93c5fd]">
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Clock className="h-3.5 w-3.5" />{article.readMinutes} دقیقه مطالعه
            </span>
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Eye className="h-3.5 w-3.5" />{article.viewCount} بازدید
            </span>
          </div>
          <h1 className="text-3xl font-black leading-relaxed text-white">{article.title}</h1>
          <p className="text-sm text-white/50 leading-relaxed">{article.summary}</p>
          <p className="text-xs text-white/30">
            نوشته: {article.authorName}
            {article.publishedAt && ` • ${new Date(article.publishedAt).toLocaleDateString('fa-IR')}`}
          </p>
        </div>

        <Card className="border-white/5 bg-white/5">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-1 text-white/80" style={{ direction: 'rtl' }}>
              {article.content.split('\n').map((line, i) => {
                if (line.startsWith('# '))  return <h1  key={i} className="text-xl font-black mt-6 mb-3 text-white">{line.slice(2)}</h1>;
                if (line.startsWith('## ')) return <h2  key={i} className="text-lg font-bold mt-5 mb-2 text-[#93c5fd]">{line.slice(3)}</h2>;
                if (line.startsWith('### '))return <h3  key={i} className="text-base font-bold mt-4 mb-2 text-white">{line.slice(4)}</h3>;
                if (line.startsWith('```') || line === '```') return null;
                if (line.startsWith('| '))  return <div key={i} className="font-mono text-xs bg-white/10 px-3 py-1 rounded text-left" dir="ltr">{line}</div>;
                if (/^`[^`]+`$/.test(line)) return <code key={i} className="block font-mono text-xs bg-white/10 px-3 py-2 rounded text-left" dir="ltr">{line.replace(/`/g, '')}</code>;
                if (line.startsWith('- ') || line.startsWith('• ')) return <li key={i} className="text-sm leading-relaxed mr-4 list-disc text-white/70">{line.slice(2)}</li>;
                if (line.trim() === '') return <div key={i} className="h-2" />;
                return <p key={i} className="text-sm leading-relaxed">{line}</p>;
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <button
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending || liked}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all',
              liked
                ? 'bg-red-500/20 text-red-400'
                : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white',
            )}
          >
            <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
            {liked ? 'پسندیدم' : 'پسندیدن'} ({article.likeCount + (liked ? 1 : 0)})
          </button>
        </div>

        {/* Comments Section */}
        <div className="pt-8 border-t border-white/10">
          <CommentsSection articleId={article.id} />
        </div>

        {/* Membership CTA */}
        <div className="rounded-xl border border-[#3b82f6]/20 bg-gradient-to-r from-[#3b82f6]/5 to-[#6366f1]/5 p-6 text-center space-y-3">
          <p className="text-sm text-white/70">
            برای دسترسی به مقالات تخصصی‌تر، راهنماهای محاسباتی و ویدئوهای آموزشی، عضو شوید
          </p>
          <a
            href={`/${locale}/register`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#6366f1] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all"
          >
            عضویت رایگان
          </a>
        </div>
      </div>
    </div>
  );
}
