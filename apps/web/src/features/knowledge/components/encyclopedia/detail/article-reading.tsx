'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Clock,
  Calendar,
  Eye,
  BookOpen,
  Cpu,
  Calculator,
  Sparkles,
  FileText,
  Layers,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { publicKnowledgeApi, getArticleTitle } from '@/features/knowledge/lib/knowledge-api';
import { DIFFICULTY_META } from '@/features/knowledge/lib/taxonomy-data';
import { StandardBadge } from '../standards/standard-badge';
import { KnowledgeRenderer } from '../../knowledge-editor';
import { EncyclopediaAiAssistant } from '../ai/encyclopedia-ai-assistant';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function ArticleReading({ slug }: { slug: string }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const [showAi, setShowAi] = useState(false);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['public-knowledge-detail', slug],
    queryFn: () => publicKnowledgeApi.getBySlug(slug).then((r) => r.data),
  });

  const { data: relatedData, isLoading: relatedLoading } = useQuery({
    queryKey: ['public-knowledge-related', slug],
    queryFn: () => publicKnowledgeApi.getRelated(slug).then((r) => r.data),
    enabled: !!slug,
  });

  useEffect(() => {
    if (data?.id) {
      publicKnowledgeApi.recordView(slug);
    }
  }, [data?.id, slug]);

  // Extract TOC from content (simple)
  useEffect(() => {
    if (!data?.content) return;
    const doc = (data.content as any)?.doc;
    const headings: { id: string; text: string; level: number }[] = [];
    if (doc?.content) {
      for (const block of doc.content) {
        if (block.type === 'heading' && block.content?.[0]?.text) {
          const text = block.content[0].text;
          headings.push({
            id: text.toLowerCase().replace(/\s+/g, '-'),
            text,
            level: block.attrs?.level ?? 2,
          });
        }
      }
    }
    setToc(headings);
  }, [data?.content]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-10 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-semibold mb-2">مقاله یافت نشد</h3>
        <Link
          href={`/${locale}/knowledge`}
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          <ArrowRight className="h-4 w-4" /> بازگشت به دانشنامه
        </Link>
      </div>
    );
  }

  const title = getArticleTitle(data as any);
  const diffMeta = data.difficulty ? DIFFICULTY_META[data.difficulty] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Breadcrumb + Hero */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 py-6">
          <Link
            href={`/${locale}/knowledge`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            دانشنامه فنی
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug mb-3">
                {title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {diffMeta && (
                  <Badge className={cn('border-0 text-[11px]', diffMeta.color)}>
                    {diffMeta.fa}
                  </Badge>
                )}
                {data.readingTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {data.readingTime} دقیقه مطالعه
                  </span>
                )}
                {data.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />{' '}
                    {new Date(data.publishedAt).toLocaleDateString('fa-IR')}
                  </span>
                )}
                {relatedData?.analytics && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />{' '}
                    {relatedData.analytics.views.toLocaleString('fa-IR')} بازدید
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> نسخه {data.version}
                </span>
              </div>
              {relatedData?.standards && relatedData.standards.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {relatedData.standards.map((s) => (
                    <StandardBadge
                      key={s.id}
                      code={s.code}
                      organization={s.organization}
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAi(!showAi)}
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium flex items-center gap-1.5 hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                دستیار AI
              </button>
              <button
                onClick={() =>
                  navigator
                    .share?.({ title, url: window.location.href })
                    .catch(() => navigator.clipboard.writeText(window.location.href))
                }
                className="w-9 h-9 rounded-xl border bg-card flex items-center justify-center hover:bg-secondary"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {data.content && Object.keys(data.content).length > 0 ? (
                  <KnowledgeRenderer content={data.content} />
                ) : (
                  <p className="text-muted-foreground italic">محتوایی ثبت نشده است</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Formulas */}
          {relatedData?.formulas && relatedData.formulas.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  فرمول‌های کلیدی
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedData.formulas.map((f: any) => (
                  <div key={f.id} className="rounded-xl border bg-muted/20 p-3">
                    <p className="font-mono text-sm">{f.latex}</p>
                    {f.description_fa && (
                      <p className="text-xs text-muted-foreground mt-1">{f.description_fa}</p>
                    )}
                    {f.calculator_type && (
                      <Badge variant="outline" className="mt-2 text-[10px] font-mono">
                        {f.calculator_type}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Examples */}
          {relatedData?.examples && relatedData.examples.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  مثال‌های محاسباتی
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedData.examples.map((ex: any) => (
                  <div key={ex.id} className="rounded-xl border p-3">
                    <h5 className="font-semibold text-sm">{ex.title_fa}</h5>
                    <Badge variant="secondary" className="text-[10px] mt-1">
                      {ex.difficulty}
                    </Badge>
                    {ex.calculator_type && (
                      <Badge className="text-[10px] mr-1">{ex.calculator_type}</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Related Articles */}
          {relatedData?.related && relatedData.related.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  مقالات مرتبط
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {relatedData.related.map((rel: any) => (
                  <Link
                    key={rel.id}
                    href={`/${locale}/knowledge/${rel.slug}`}
                    className="p-3 rounded-xl border hover:border-primary/30 hover:bg-secondary/50 transition-colors block"
                  >
                    <p className="font-medium text-sm line-clamp-2">{rel.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                      {rel.readingTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {rel.readingTime}′
                        </span>
                      )}
                      {rel.difficulty && <Badge className="text-[9px]">{rel.difficulty}</Badge>}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-5">
          {/* TOC */}
          {toc.length > 0 && (
            <Card className="sticky top-20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">فهرست مطالب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={cn(
                      'block text-xs text-muted-foreground hover:text-primary transition-colors',
                      item.level === 1 ? 'font-semibold' : item.level === 2 ? 'pr-2' : 'pr-4',
                    )}
                  >
                    {item.text}
                  </a>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Standards */}
          {relatedData?.standards && relatedData.standards.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> استانداردهای مرتبط
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {relatedData.standards.map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <StandardBadge code={s.code} organization={s.organization} size="xs" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-tight">{s.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.organization} • {s.version}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Taxonomy */}
          {relatedData?.taxonomy && relatedData.taxonomy.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">دسته‌بندی</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1">
                {relatedData.taxonomy.map((t: any) => (
                  <Badge key={t.id} variant="secondary" className="text-[10px]">
                    {t.taxonomy_type}: {t.taxonomy_id.slice(0, 8)}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Assistant inline */}
          {showAi ? (
            <EncyclopediaAiAssistant articleSlug={slug} onClose={() => setShowAi(false)} />
          ) : (
            <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> دستیار هوشمند
                </h4>
                <p className="text-xs opacity-90 mt-1 leading-relaxed">
                  سوالی درباره این مقاله، استانداردها یا تجهیزات دارید؟
                </p>
                <button
                  onClick={() => setShowAi(true)}
                  className="mt-3 w-full h-8 rounded-xl bg-white text-violet-600 text-xs font-semibold hover:bg-white/90"
                >
                  شروع گفتگو
                </button>
              </CardContent>
            </Card>
          )}

          {/* Equipment hint */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <h4 className="font-semibold text-xs flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" /> تجهیزات مرتبط
              </h4>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                این مقاله ممکن است به ترانسفورماتور، کابل یا تابلو برق مرتبط باشد. از تب تجهیزات در
                دانشنامه برای کاوش بیشتر استفاده کنید.
              </p>
              <Link
                href={`/${locale}/knowledge?tab=equipment`}
                className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
              >
                فهرست تجهیزات <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
