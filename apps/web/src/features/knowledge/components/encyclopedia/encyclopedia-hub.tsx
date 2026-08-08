'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Zap,
  TrendingUp,
  Layers,
  Cpu,
  Shield,
  Lightbulb,
  ArrowUpRight,
  Sparkles,
  GraduationCap,
  Library,
  SearchX,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  publicKnowledgeApi,
  getArticleTitle,
  getArticleSummary,
} from '@/features/knowledge/lib/knowledge-api';
import { KnowledgeSearchBar } from './search/knowledge-search-bar';
import { KnowledgeFilters, FilterState } from './search/knowledge-filters';
import { KnowledgeCardModern, KnowledgeCardSkeleton } from './search/knowledge-card-modern';
import { StandardsMatrixView } from './standards/standards-matrix-view';
import { EquipmentDirectory } from './equipment/equipment-directory';
import { EncyclopediaAiAssistant, FloatingAiButton } from './ai/encyclopedia-ai-assistant';
import { EQUIPMENT_CATEGORIES } from '@/features/knowledge/lib/equipment-registry';
import { TAXONOMY_META } from '@/features/knowledge/lib/taxonomy-data';

type Tab = 'all' | 'standards' | 'equipment' | 'taxonomy' | 'ai';

const SUGGESTIONS = [
  'محاسبه افت ولتاژ کابل',
  'IEC 60364-5-52 سایزینگ',
  'IEEE 80 طراحی زمین',
  'ترانسفورماتور قدرت 1250kVA',
  'بانک خازنی و هارمونیک',
  'حفاظت موتور با رله',
];

export function EncyclopediaHub() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    difficulty: '',
    standard: '',
    equipmentCategory: '',
    language: locale,
    taxonomyType: '',
  });
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<Tab>('all');
  const [showAi, setShowAi] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Hub overview
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['encyclopedia', 'overview'],
    queryFn: () => publicKnowledgeApi.hubOverview().then((r) => r.data),
  });

  // Articles list
  const {
    data: articlesData,
    isLoading: articlesLoading,
    isFetching,
  } = useQuery({
    queryKey: ['public-knowledge', debounced, filters, page],
    queryFn: () =>
      publicKnowledgeApi.list({
        page,
        limit: 12,
        locale: filters.language || undefined,
        q: debounced || undefined,
        difficulty: filters.difficulty || undefined,
        standard: filters.standard || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const articles = useMemo(() => {
    return (articlesData?.data ?? []).map((a) => ({
      id: a.id,
      slug: a.slug,
      title: getArticleTitle(a as any),
      summary: getArticleSummary(a as any),
      difficulty: a.difficulty,
      readingTime: a.readingTime,
      publishedAt: a.publishedAt,
      views: (a as any).views ?? 0,
      // placeholder standards - will be enriched via related endpoint later
      standards: [] as { code: string; organization?: string }[],
    }));
  }, [articlesData]);

  const total = articlesData?.meta?.total ?? 0;
  const totalPages = articlesData?.meta?.totalPages ?? 1;

  const handleAiSearch = (q: string) => {
    setSearch(q);
    setTab('all');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/5 to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-5 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Library className="h-3.5 w-3.5" />
              دانشنامه فنی مهندسی برق • نسخه 2.0 — AI Powered
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-4">
              دانشنامه فنی برق
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mt-1">
                هوشمند، استانداردمحور
              </span>
            </h1>

            <p className="text-[15px] md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              مرجع تخصصی مقالات، استانداردهای IEC/IEEE/NEC، تجهیزات، مقررات و محاسبات مهندسی برق —
              با جستجوی معنایی و دستیار هوش مصنوعی
            </p>

            <div className="flex justify-center mb-8">
              <KnowledgeSearchBar
                value={search}
                onChange={setSearch}
                onAiSearch={handleAiSearch}
                suggestions={SUGGESTIONS}
                placeholder="جستجو: مثلاً سایزینگ کابل LV بر اساس IEC 60364..."
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              <div className="rounded-2xl border bg-card/60 backdrop-blur p-4 text-center">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-1">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <p className="font-bold text-lg">{overview?.stats?.totalArticles ?? '—'}</p>
                <p className="text-[11px] text-muted-foreground">مقاله فنی</p>
              </div>
              <div className="rounded-2xl border bg-card/60 backdrop-blur p-4 text-center">
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-1">
                  <Shield className="h-4 w-4 text-violet-600" />
                </div>
                <p className="font-bold text-lg">{overview?.stats?.totalStandards ?? '—'}</p>
                <p className="text-[11px] text-muted-foreground">استاندارد</p>
              </div>
              <div className="rounded-2xl border bg-card/60 backdrop-blur p-4 text-center">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-1">
                  <Cpu className="h-4 w-4 text-amber-600" />
                </div>
                <p className="font-bold text-lg">{Object.keys(EQUIPMENT_CATEGORIES).length}</p>
                <p className="text-[11px] text-muted-foreground">نوع تجهیز</p>
              </div>
              <div className="rounded-2xl border bg-card/60 backdrop-blur p-4 text-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-1">
                  <Zap className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="font-bold text-lg">55+</p>
                <p className="text-[11px] text-muted-foreground">محاسبه مهندسی</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            {[
              { id: 'all', label: 'همه مقالات', icon: BookOpen },
              { id: 'standards', label: 'استانداردها', icon: Shield },
              { id: 'equipment', label: 'تجهیزات', icon: Cpu },
              { id: 'taxonomy', label: 'دسته‌بندی', icon: Layers },
              { id: 'ai', label: 'دستیار AI', icon: Sparkles },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`inline-flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">
        {tab === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    پر بازدیدترین
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {overviewLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)
                  ) : (overview?.mostViewed ?? []).length === 0 ? (
                    <p className="text-xs text-muted-foreground">آماری موجود نیست</p>
                  ) : (
                    overview?.mostViewed?.map((item, idx) => (
                      <a
                        key={item.id}
                        href={`/${locale}/knowledge/${item.slug ?? item.id}`}
                        className="flex items-start gap-2 p-2 rounded-xl hover:bg-secondary transition-colors group"
                      >
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium line-clamp-2 group-hover:text-primary leading-snug">
                            {item.title ?? item.slug}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.views.toLocaleString('fa-IR')} بازدید
                          </p>
                        </div>
                      </a>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    دسته‌بندی‌ها
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {overviewLoading ? (
                    <Skeleton className="h-20" />
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {(overview?.categories ?? []).slice(0, 8).map((cat: any) => (
                        <Badge
                          key={cat.id}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-[11px]"
                          onClick={() => {
                            setFilters((f) => ({ ...f, taxonomyType: 'category' }));
                            setTab('all');
                          }}
                        >
                          {cat.name ?? cat.slug}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">نکته هوشمند</h4>
                      <p className="text-xs opacity-90 mt-1 leading-relaxed">
                        از فیلتر استاندارد برای یافتن مقالات منطبق با IEC 60364 یا IEEE 80 استفاده
                        کنید. دستیار AI هم می‌تواند مقالات مرتبط را پیشنهاد دهد.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAi(true)}
                    className="mt-3 w-full h-9 rounded-xl bg-white text-violet-600 text-xs font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="h-4 w-4" />
                    پرسش از دستیار هوشمند
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Main */}
            <div className="lg:col-span-3 space-y-6">
              <KnowledgeFilters
                filters={filters}
                onChange={(f) => {
                  setFilters(f);
                  setPage(1);
                }}
                totalResults={total}
              />

              {articlesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <KnowledgeCardSkeleton key={i} />
                  ))}
                </div>
              ) : articles.length === 0 ? (
                <Card className="py-16 text-center">
                  <CardContent>
                    <SearchX className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                    <h3 className="font-semibold text-sm mb-1">مقاله‌ای یافت نشد</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      {debounced
                        ? `برای "${debounced}" نتیجه‌ای پیدا نشد. فیلترها را پاک کنید یا عبارت دیگری جستجو کنید.`
                        : 'هنوز مقاله‌ای منتشر نشده است.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {articles.map((a) => (
                      <KnowledgeCardModern key={a.id} article={a} locale={locale} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="h-9 px-4 rounded-xl border bg-card text-sm disabled:opacity-40 hover:bg-secondary"
                      >
                        قبلی
                      </button>
                      <span className="text-xs text-muted-foreground px-3">
                        صفحه {page} از {totalPages} — {total.toLocaleString('fa-IR')} مقاله
                      </span>
                      <button
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="h-9 px-4 rounded-xl border bg-card text-sm disabled:opacity-40 hover:bg-secondary"
                      >
                        بعدی
                      </button>
                    </div>
                  )}

                  {isFetching && !articlesLoading && (
                    <p className="text-[11px] text-muted-foreground text-center">
                      در حال به‌روزرسانی...
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {tab === 'standards' && (
          <div>
            <StandardsMatrixView
              onSelectStandard={(s) => {
                setFilters((f) => ({ ...f, standard: s.code }));
                setTab('all');
              }}
            />
          </div>
        )}

        {tab === 'equipment' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                فهرست تجهیزات الکتریکی
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                تجهیزات مرتبط با استانداردها، محاسبات و مقالات دانشنامه
              </p>
            </div>
            <EquipmentDirectory
              onSelectEquipment={(eq) => {
                setFilters((f) => ({ ...f, equipmentCategory: eq.category }));
                setTab('all');
              }}
            />
          </div>
        )}

        {tab === 'taxonomy' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(TAXONOMY_META).map(([type, meta]) => (
              <Card key={type} className="hover:border-primary/30 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{meta.icon}</span>
                    {meta.labelFa}
                    <Badge variant="outline" className="text-[10px] mr-auto">
                      {meta.labelEn}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">{meta.descriptionFa}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(overview?.categories ?? []).slice(0, 5).map((c: any) => (
                      <Badge key={c.id ?? c.slug} variant="secondary" className="text-[10px]">
                        {c.name ?? c.slug}
                      </Badge>
                    ))}
                  </div>
                  <button
                    onClick={() => setFilters((f) => ({ ...f, taxonomyType: type }))}
                    className="mt-3 text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    مشاهده مقالات <ArrowUpRight className="h-3 w-3" />
                  </button>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-8 w-8 mx-auto text-muted-foreground opacity-30 mb-2" />
                <h4 className="font-semibold text-sm">سطوح دشواری</h4>
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {Object.entries({
                    beginner: 'مبتدی',
                    intermediate: 'متوسط',
                    advanced: 'پیشرفته',
                    expert: 'متخصص',
                  }).map(([k, fa]) => (
                    <Badge
                      key={k}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-[11px]"
                      onClick={() => {
                        setFilters((f) => ({ ...f, difficulty: k }));
                        setTab('all');
                      }}
                    >
                      {fa}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'ai' && (
          <div className="max-w-3xl mx-auto">
            <EncyclopediaAiAssistant />
            <Card className="mt-6 bg-gradient-to-br from-card to-muted/30">
              <CardContent className="p-5">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  قابلیت‌های دستیار هوشمند
                </h4>
                <ul className="mt-3 space-y-2 text-xs text-muted-foreground list-disc pr-5">
                  <li>توضیح استانداردها و تفاوت IEC/IEEE/NEC</li>
                  <li>پیشنهاد تجهیزات متناسب با محاسبات</li>
                  <li>معرفی مقالات مرتبط با جستجوی معنایی</li>
                  <li>پاسخ به سوالات فنی بر اساس دانشنامه</li>
                  <li>خلاصه‌سازی خودکار مقالات طولانی</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {showAi && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-start p-4 bg-black/20 backdrop-blur-sm"
          onClick={() => setShowAi(false)}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <EncyclopediaAiAssistant onClose={() => setShowAi(false)} />
          </div>
        </div>
      )}

      {!showAi && tab !== 'ai' && <FloatingAiButton onClick={() => setShowAi(true)} />}
    </div>
  );
}
