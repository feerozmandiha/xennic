'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  BookOpen, Plus, Search, ArrowUpRight, Trash2, Filter,
  Globe, Lock, Eye,
} from 'lucide-react';
import { Input }      from '@/components/ui/input';
import { Badge }      from '@/components/ui/badge';
import { Skeleton }   from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { useToast }     from '@/stores/toast.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';
import { NewKnowledgeDialog } from './knowledge-form';

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  published: 'success',
  draft:     'secondary',
  review:    'warning',
  archived:  'destructive',
};

const STATUS_FA: Record<string, string> = {
  published: 'منتشرشده',
  draft:     'پیش‌نویس',
  review:    'در انتظار بررسی',
  archived:  'آرشیو',
};

const DIFFICULTY_FA: Record<string, string> = {
  beginner:     'مبتدی',
  intermediate: 'متوسط',
  advanced:     'پیشرفته',
  expert:       'متخصص',
};

const DIFFICULTIES = [
  { value: '',            label: 'همه سطوح' },
  { value: 'beginner',    label: 'مبتدی' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced',    label: 'پیشرفته' },
  { value: 'expert',      label: 'متخصص' },
];

function ConfirmDialog({ name, onConfirm, onCancel }: {
  name: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in-fast" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-[hsl(var(--card))] rounded-[var(--radius-xl)] border border-[hsl(var(--border))] shadow-[var(--shadow-lg)] p-6 animate-scale-in">
        <div className="w-12 h-12 rounded-full bg-[hsl(var(--destructive)/0.1)] flex items-center justify-center mx-auto mb-4">
          <Trash2 className="h-5 w-5 text-[hsl(var(--destructive))]" />
        </div>
        <h3 className="text-base font-semibold text-center mb-2">حذف مقاله</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] text-center mb-6">
          آیا از حذف <span className="font-medium text-[hsl(var(--foreground))]">«{name}»</span> مطمئن هستید؟
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-9 rounded-[var(--radius)] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-9 rounded-[var(--radius)] bg-[hsl(var(--destructive))] text-white text-sm hover:opacity-90 transition-opacity"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, locale, onDelete, views = 0 }: {
  article: any; locale: string; onDelete: (id: string, name: string) => void; views?: number;
}) {
  return (
    <Card className="card-hover group overflow-hidden">
      <div className={cn(
        'h-0.5 w-full',
        article.status === 'published' && 'bg-[hsl(var(--success))]',
        article.status === 'draft'     && 'bg-[hsl(var(--muted-foreground))]',
        article.status === 'review'    && 'bg-[hsl(var(--warning))]',
        article.status === 'archived'  && 'bg-[hsl(var(--destructive))]',
      )} />
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[hsl(var(--primary)/0.08)] flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm leading-tight truncate">{article.content?.title || article.slug}</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              {article.language === 'fa' ? 'نسخه فارسی' : 'English version'} · v{article.version}
              {article.difficulty && ` · ${DIFFICULTY_FA[article.difficulty] ?? article.difficulty}`}
            </p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(article.id, article.content?.title || article.slug); }}
            className="p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--muted-foreground)/0.4)] hover:text-[hsl(var(--destructive))] opacity-0 group-hover:opacity-100 transition-all shrink-0"
            title="حذف مقاله"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge variant={STATUS_VARIANT[article.status] ?? 'secondary'} className="text-[10px]">
            {STATUS_FA[article.status] ?? article.status}
          </Badge>
          {article.visibility === 'private' && (
            <Lock className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
          )}
          {article.visibility === 'public' && (
            <Globe className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
              {new Date(article.createdAt).toLocaleDateString('fa-IR')}
            </span>
            {views > 0 && (
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {views.toLocaleString('fa-IR')}
              </span>
            )}
          </div>
          <a
            href={`/${locale}/knowledge/${article.id}`}
            className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--primary))] hover:underline font-medium"
          >
            جزئیات <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

const STATUS_FILTERS = [
  { key: 'all',       label: 'همه' },
  { key: 'published', label: 'منتشرشده' },
  { key: 'draft',     label: 'پیش‌نویس' },
  { key: 'review',    label: 'در انتظار بررسی' },
  { key: 'archived',  label: 'آرشیو' },
];

export function KnowledgeClient() {
  const t           = useTranslations('knowledge');
  const tCommon     = useTranslations('common');
  const params      = useParams();
  const locale      = (params?.locale as string) ?? 'fa';
  const wsId        = useAuthStore(s => s.workspaceId);
  const toast       = useToast();
  const queryClient = useQueryClient();

  const [search,          setSearch]      = useState('');
  const [statusFilter,    setStatus]      = useState('all');
  const [difficultyFilter, setDifficulty] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showNew,         setShowNew]     = useState(false);
  const [deleteTarget,    setDelete]      = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const searchParams = new URLSearchParams();
  if (debouncedSearch) searchParams.set('q', debouncedSearch);
  if (statusFilter !== 'all') searchParams.set('status', statusFilter);
  if (difficultyFilter) searchParams.set('difficulty', difficultyFilter);
  searchParams.set('limit', '100');

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', wsId, debouncedSearch, statusFilter, difficultyFilter],
    queryFn:  () => apiClient.get<any>(`/knowledge/search?${searchParams.toString()}`),
    enabled:  !!wsId,
    retry: false,
  });

  const { data: viewsData } = useQuery({
    queryKey: ['knowledge', 'analytics', 'dashboard', wsId],
    queryFn:  () => apiClient.get<{ data: any }>('/knowledge/analytics/dashboard'),
    enabled:  !!wsId,
  });

  const viewsMap: Record<string, number> = {};
  if (viewsData?.data?.mostViewed) {
    for (const item of viewsData.data.mostViewed) {
      viewsMap[item.id] = item.views;
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/knowledge/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      toast.success('مقاله حذف شد');
      setDelete(null);
    },
    onError: () => toast.error('خطا در حذف مقاله'),
  });

  const articles = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={`${total} ${tCommon('total')}`}
        action={
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-[0_2px_8px_hsl(var(--primary)/0.3)]"
          >
            <Plus className="h-4 w-4" />
            {t('newArticle')}
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 mb-5">
        <Input
          placeholder={tCommon('search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          startIcon={<Search className="h-4 w-4" />}
          className="max-w-xs"
        />
        <select
          value={difficultyFilter}
          onChange={e => setDifficulty(e.target.value)}
          className="h-10 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        >
          {DIFFICULTIES.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-5">
        <Filter className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
        {STATUS_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setStatus(f.key)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
              statusFilter === f.key
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--muted))]',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map((a: any) => (
            <ArticleCard
              key={a.id}
              article={a}
              locale={locale}
              onDelete={(id, name) => setDelete({ id, name })}
              views={viewsMap[a.id] ?? 0}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center mb-5">
            <BookOpen className="h-9 w-9 text-[hsl(var(--muted-foreground))] opacity-30" />
          </div>
          <h3 className="font-semibold text-base mb-2">{tCommon('noData')}</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-xs">
            {search || statusFilter !== 'all' || difficultyFilter
              ? 'هیچ مقاله‌ای با این فیلتر پیدا نشد'
              : 'اولین مقاله دانش فنی خود را ایجاد کنید'}
          </p>
          {!search && statusFilter === 'all' && !difficultyFilter && (
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-2 h-9 px-5 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              {t('newArticle')}
            </button>
          )}
        </div>
      )}

      <NewKnowledgeDialog open={showNew} onClose={() => setShowNew(false)} />

      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.name}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDelete(null)}
        />
      )}
    </div>
  );
}
