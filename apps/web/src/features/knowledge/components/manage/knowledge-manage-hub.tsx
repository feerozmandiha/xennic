'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  Archive,
  Send,
  Sparkles,
  TrendingUp,
  FileText,
  Layers,
  BarChart3,
  Upload,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { manageKnowledgeApi } from '@/features/knowledge/lib/manage-api';
import { getArticleTitle } from '@/features/knowledge/lib/knowledge-api';
import { DIFFICULTY_META } from '@/features/knowledge/lib/taxonomy-data';
import { cn } from '@/lib/utils';
import { useToast } from '@/stores/toast.store';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  published: {
    label: 'منتشرشده',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  draft: { label: 'پیش‌نویس', color: 'bg-gray-100 text-gray-700', icon: FileText },
  review: {
    label: 'در انتظار بررسی',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock,
  },
  archived: { label: 'آرشیو', color: 'bg-red-100 text-red-700', icon: Archive },
};

export function KnowledgeManageHub() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: statsData } = useQuery({
    queryKey: ['knowledge', 'dashboard'],
    queryFn: () => manageKnowledgeApi.dashboardStats().then((r) => r.data),
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['manage-knowledge', debounced, statusFilter, page],
    queryFn: () =>
      manageKnowledgeApi.list({
        page,
        limit: 20,
        q: debounced || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => manageKnowledgeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-knowledge'] });
      toast.success('مقاله حذف شد');
    },
    onError: () => toast.error('خطا در حذف'),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => manageKnowledgeApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-knowledge'] });
      toast.success('منتشر شد');
    },
  });

  const articles = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, totalPages: 1, page: 1 };

  const stats = statsData?.data ?? {
    totalArticles: 0,
    totalViews: 0,
    publishedArticles: 0,
    draftArticles: 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="مدیریت دانشنامه فنی"
        description={`${meta.total.toLocaleString('fa-IR')} مقاله • ${stats.totalViews?.toLocaleString('fa-IR') ?? 0} بازدید کل`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['manage-knowledge'] })}
            >
              <RefreshCw className="h-4 w-4" />
              به‌روزرسانی
            </Button>
            <Button size="sm" onClick={() => router.push(`/${locale}/knowledge-manage/new`)}>
              <Plus className="h-4 w-4" />
              مقاله جدید
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">کل مقالات</p>
                <p className="text-2xl font-bold">{stats.totalArticles ?? meta.total}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600">
              <TrendingUp className="h-3 w-3" /> +12% این ماه
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">منتشرشده</p>
                <p className="text-2xl font-bold">{stats.publishedArticles ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              {((stats.publishedArticles / (stats.totalArticles || 1)) * 100).toFixed(0)}% از کل
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">پیش‌نویس / بررسی</p>
                <p className="text-2xl font-bold">
                  {(stats.draftArticles ?? 0) + (statsData?.data?.mostViewed?.length ? 0 : 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-amber-600">نیاز به بررسی</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-violet-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">بازدید کل</p>
                <p className="text-2xl font-bold">
                  {(stats.totalViews ?? 0).toLocaleString('fa-IR')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-violet-600" />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-violet-600 flex items-center gap-1">
              <Eye className="h-3 w-3" /> میانگین{' '}
              {(stats.totalViews && stats.totalArticles
                ? Math.round(stats.totalViews / stats.totalArticles)
                : 0
              ).toLocaleString('fa-IR')}{' '}
              / مقاله
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="جستجوی عنوان، اسلاگ، محتوا..."
              className="w-full h-10 pr-10 pl-3 rounded-xl border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { key: 'all', label: 'همه' },
              { key: 'published', label: 'منتشرشده' },
              { key: 'draft', label: 'پیش‌نویس' },
              { key: 'review', label: 'در بررسی' },
              { key: 'archived', label: 'آرشیو' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  setStatusFilter(s.key);
                  setPage(1);
                }}
                className={cn(
                  'px-3 h-9 rounded-xl text-xs font-medium whitespace-nowrap border transition-colors',
                  statusFilter === s.key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card hover:bg-secondary',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
            <h3 className="font-semibold mb-1">مقاله‌ای یافت نشد</h3>
            <p className="text-xs text-muted-foreground mb-4">اولین مقاله دانشنامه را ایجاد کنید</p>
            <Button size="sm" onClick={() => router.push(`/${locale}/knowledge-manage/new`)}>
              <Plus className="h-4 w-4" /> مقاله جدید
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {articles.map((article: any) => {
              const status = STATUS_CONFIG[article.status] ?? STATUS_CONFIG.draft;
              const diff = article.difficulty ? DIFFICULTY_META[article.difficulty] : null;
              const Icon = status.icon;
              return (
                <Card
                  key={article.id}
                  className="group overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div
                    className={cn(
                      'h-1 w-full',
                      article.status === 'published'
                        ? 'bg-emerald-500'
                        : article.status === 'review'
                          ? 'bg-amber-500'
                          : 'bg-gray-300',
                    )}
                  />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <Badge className={cn('text-[10px] border', status.color)}>
                          <Icon className="h-3 w-3 ml-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/${locale}/knowledge-manage/${article.id}`)}
                          className="w-7 h-7 rounded-lg border bg-card hover:bg-secondary flex items-center justify-center"
                          title="مشاهده"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/${locale}/knowledge-manage/${article.id}/edit`)
                          }
                          className="w-7 h-7 rounded-lg border bg-card hover:bg-secondary flex items-center justify-center"
                          title="ویرایش"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('حذف شود؟')) deleteMutation.mutate(article.id);
                          }}
                          className="w-7 h-7 rounded-lg border bg-card hover:bg-red-50 text-red-500 flex items-center justify-center"
                          title="حذف"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary mb-2">
                      {getArticleTitle(article)}
                    </h3>

                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {diff && (
                        <Badge className={cn('text-[10px] border-0', diff.color)}>{diff.fa}</Badge>
                      )}
                      {article.language && (
                        <Badge variant="outline" className="text-[10px]">
                          {article.language === 'fa' ? 'فارسی' : 'EN'}
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">v{article.version}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-3">
                      <span>{new Date(article.createdAt).toLocaleDateString('fa-IR')}</span>
                      <div className="flex items-center gap-2">
                        {article.status === 'draft' && (
                          <button
                            onClick={() => publishMutation.mutate(article.id)}
                            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-xs font-medium"
                          >
                            <Send className="h-3 w-3" /> انتشار
                          </button>
                        )}
                        <span className="flex items-center gap-1">
                          <MoreHorizontal className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-muted-foreground">
              صفحه {meta.page} از {meta.totalPages} • {meta.total.toLocaleString('fa-IR')} مقاله
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                قبلی
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                بعدی
              </Button>
            </div>
          </div>

          {isFetching && (
            <p className="text-[11px] text-center text-muted-foreground">در حال به‌روزرسانی...</p>
          )}
        </>
      )}
    </div>
  );
}
