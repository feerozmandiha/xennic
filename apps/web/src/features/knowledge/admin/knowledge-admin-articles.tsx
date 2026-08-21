'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Layers,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { useToast } from '@/stores/toast.store';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { ACCESS_TIERS, TIER_BADGE_COLORS, type AccessTier } from '../lib/access-tiers';
import { NewKnowledgeDialog } from '../components/knowledge-form';
import { KnowledgeQueryState } from './knowledge-query-state';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminArticleRow {
  id: string;
  slug: string;
  title: string | null;
  status: string;
  accessTier: AccessTier;
  language: string;
  version: number;
  visibility: string;
  workspaceId: string;
  workspaceName: string | null;
  authorId: string | null;
  authorName: string | null;
  views: number;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
}

interface ListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AdminArticlesResponse {
  success: boolean;
  data: AdminArticleRow[];
  meta: ListMeta;
}

interface AdminStats {
  totalArticles: number;
  totalViews: number;
  byStatus: Record<string, number>;
  byTier: Record<string, number>;
  recentArticles: Array<{
    id: string;
    slug: string;
    title: string | null;
    status: string;
    accessTier: AccessTier;
    publishedAt: string | null;
    updatedAt: string;
  }>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUSES = ['draft', 'review', 'published', 'archived'] as const;
const LANGUAGES = ['fa', 'en'] as const;
const PAGE_SIZES = [10, 20, 50];

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  published: 'success',
  draft: 'secondary',
  review: 'warning',
  archived: 'destructive',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(value: string | null, locale: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatNumber(value: number, locale: string): string {
  return value.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof BookOpen;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">{label}</span>
        <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-[hsl(var(--primary)/0.08)]">
          <Icon className="size-4 text-[hsl(var(--primary))]" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">{hint}</p> : null}
    </div>
  );
}

function TierBadge({ tier, label }: { tier: AccessTier; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium',
        TIER_BADGE_COLORS[tier] ?? TIER_BADGE_COLORS.free,
      )}
    >
      {label}
    </span>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-[hsl(var(--muted-foreground))]">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-36 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2.5 text-sm text-[hsl(var(--foreground))] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ConfirmDeleteDialog({
  name,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  title,
  question,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel: string;
  cancelLabel: string;
  title: string;
  question: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-[var(--radius-xl)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-lg)]">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[hsl(var(--destructive)/0.1)]">
          <Trash2 className="size-5 text-[hsl(var(--destructive))]" />
        </div>
        <h3 className="mb-2 text-center text-base font-semibold">{title}</h3>
        <p className="mb-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
          {question} <span className="font-medium text-[hsl(var(--foreground))]">«{name}»</span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="h-9 flex-1 rounded-[var(--radius)] border border-[hsl(var(--border))] text-sm transition-colors hover:bg-[hsl(var(--secondary))]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="h-9 flex-1 rounded-[var(--radius)] bg-[hsl(var(--destructive))] text-sm text-white transition-opacity hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Platform-wide article table for the Knowledge admin console.
 *
 * Replaces the old card grid that had to request `limit=100` and could not
 * filter by access tier: data comes from `/knowledge/admin/all` with real
 * server-side pagination, multi-filtering and search, while the counters on
 * top come from `/knowledge/admin/stats` (platform-wide, not workspace-scoped).
 */
export function KnowledgeAdminArticles() {
  const t = useTranslations('knowledgeAdmin');
  const tCommon = useTranslations('common');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const toast = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [showNew, setShowNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Any filter change must bring the user back to the first page, otherwise
  // an out-of-range page would render an empty table.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, tierFilter, statusFilter, languageFilter, limit]);

  const queryString = useMemo(() => {
    const qs = new URLSearchParams();
    if (debouncedSearch) qs.set('q', debouncedSearch);
    if (statusFilter !== 'all') qs.set('status', statusFilter);
    if (tierFilter !== 'all') qs.set('accessTier', tierFilter);
    if (languageFilter !== 'all') qs.set('language', languageFilter);
    qs.set('page', String(page));
    qs.set('limit', String(limit));
    return qs.toString();
  }, [debouncedSearch, statusFilter, tierFilter, languageFilter, page, limit]);

  const listQuery = useQuery({
    queryKey: ['knowledge', 'admin', 'list', queryString],
    queryFn: () => apiClient.get<AdminArticlesResponse>(`/knowledge/admin/all?${queryString}`),
    placeholderData: keepPreviousData,
    retry: false,
  });

  const statsQuery = useQuery({
    queryKey: ['knowledge', 'admin', 'stats'],
    queryFn: () => apiClient.get<{ data: AdminStats }>('/knowledge/admin/stats'),
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/knowledge/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      toast.success(t('articleDeleted'));
      setDeleteTarget(null);
    },
    onError: () => toast.error(t('articleDeleteFailed')),
  });

  const rows = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const stats = statsQuery.data?.data;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const hasFilters =
    !!debouncedSearch || statusFilter !== 'all' || tierFilter !== 'all' || languageFilter !== 'all';

  const statusOptions = [
    { value: 'all', label: t('filters.allStatuses') },
    ...STATUSES.map((status) => ({ value: status, label: t(`status.${status}`) })),
  ];
  const tierOptions = [
    { value: 'all', label: t('filters.allTiers') },
    ...ACCESS_TIERS.map((tier) => ({ value: tier, label: t(`tier.${tier}`) })),
  ];
  const languageOptions = [
    { value: 'all', label: t('filters.allLanguages') },
    ...LANGUAGES.map((language) => ({ value: language, label: t(`language.${language}`) })),
  ];

  const languageLabel = (code: string) =>
    (LANGUAGES as readonly string[]).includes(code) ? t(`language.${code}`) : code;
  const statusLabel = (status: string) =>
    (STATUSES as readonly string[]).includes(status) ? t(`status.${status}`) : status;
  const tierLabel = (tier: string) =>
    (ACCESS_TIERS as readonly string[]).includes(tier) ? t(`tier.${tier}`) : tier;

  const resetFilters = () => {
    setSearch('');
    setTierFilter('all');
    setStatusFilter('all');
    setLanguageFilter('all');
  };

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('subtitle', { count: formatNumber(total, locale) })}
        action={
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex h-9 items-center gap-2 rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 text-sm font-medium text-white shadow-[0_2px_8px_hsl(var(--primary)/0.3)] transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            {t('newArticle')}
          </button>
        }
      />

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statsQuery.isLoading || !stats ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24" />)
        ) : (
          <>
            <StatCard
              label={t('stats.totalArticles')}
              value={formatNumber(stats.totalArticles, locale)}
              hint={t('stats.acrossWorkspaces')}
              icon={BookOpen}
            />
            <StatCard
              label={t('stats.published')}
              value={formatNumber(stats.byStatus?.published ?? 0, locale)}
              hint={t('stats.draftsCount', {
                count: formatNumber(stats.byStatus?.draft ?? 0, locale),
              })}
              icon={FileText}
            />
            <StatCard
              label={t('stats.totalViews')}
              value={formatNumber(stats.totalViews, locale)}
              hint={t('stats.allTime')}
              icon={Eye}
            />
            <StatCard
              label={t('stats.gatedArticles')}
              value={formatNumber(
                (stats.byTier?.basic ?? 0) +
                  (stats.byTier?.pro ?? 0) +
                  (stats.byTier?.enterprise ?? 0),
                locale,
              )}
              hint={t('stats.freeCount', { count: formatNumber(stats.byTier?.free ?? 0, locale) })}
              icon={Layers}
            />
          </>
        )}
      </div>

      {/* ── Recently updated ───────────────────────────────────────────────── */}
      {stats?.recentArticles?.length ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[hsl(var(--border))] px-3 py-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
            <Clock className="size-3.5" />
            {t('stats.recentlyUpdated')}
          </span>
          {stats.recentArticles.map((article) => (
            <a
              key={article.id}
              href={`/${locale}/knowledge-manage/${article.id}`}
              className="inline-flex max-w-[220px] items-center gap-1.5 rounded-full bg-[hsl(var(--secondary))] px-2.5 py-1 text-[11px] text-[hsl(var(--secondary-foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
              title={article.title ?? article.slug}
            >
              <span className="truncate">{article.title || article.slug}</span>
              <span className="text-[hsl(var(--muted-foreground))]">
                {formatDate(article.updatedAt, locale)}
              </span>
            </a>
          ))}
        </div>
      ) : null}

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <label className="flex flex-1 flex-col gap-1 text-xs text-[hsl(var(--muted-foreground))] sm:max-w-xs">
          <span>{t('filters.search')}</span>
          <Input
            placeholder={t('filters.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startIcon={<Search className="size-4" />}
            className="h-9"
          />
        </label>
        <FilterSelect
          label={t('filters.tier')}
          value={tierFilter}
          onChange={setTierFilter}
          options={tierOptions}
        />
        <FilterSelect
          label={t('filters.status')}
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
        <FilterSelect
          label={t('filters.language')}
          value={languageFilter}
          onChange={setLanguageFilter}
          options={languageOptions}
        />
        {hasFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 text-xs font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))]"
          >
            <RotateCcw className="size-3.5" />
            {t('filters.reset')}
          </button>
        ) : null}
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      {listQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12" />
          ))}
        </div>
      ) : listQuery.isError ? (
        <KnowledgeQueryState
          kind="error"
          title={t('loadFailed')}
          description={t('loadFailedHint')}
          onRetry={() => listQuery.refetch()}
        />
      ) : rows.length === 0 ? (
        <KnowledgeQueryState
          kind="empty"
          title={tCommon('noData')}
          description={hasFilters ? t('emptyFiltered') : t('emptyAll')}
        />
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.4)] text-xs text-[hsl(var(--muted-foreground))]">
                <th className="px-4 py-3 text-start font-medium">{t('columns.title')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('columns.status')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('columns.tier')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('columns.workspace')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('columns.author')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('columns.publishedAt')}</th>
                <th className="px-4 py-3 text-end font-medium">{tCommon('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[hsl(var(--border))] last:border-0 transition-colors hover:bg-[hsl(var(--secondary)/0.35)]"
                >
                  <td className="max-w-[320px] px-4 py-3">
                    <a
                      href={`/${locale}/knowledge-manage/${row.id}`}
                      className="block truncate font-medium hover:text-[hsl(var(--primary))] hover:underline"
                    >
                      {row.title || row.slug}
                    </a>
                    <span className="mt-0.5 block truncate text-[11px] text-[hsl(var(--muted-foreground))]">
                      {row.slug} · v{row.version} · {languageLabel(row.language)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={STATUS_VARIANT[row.status] ?? 'secondary'}
                      className="text-[10px]"
                    >
                      {statusLabel(row.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <TierBadge tier={row.accessTier} label={tierLabel(row.accessTier)} />
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-[hsl(var(--muted-foreground))]">
                    {row.workspaceName ?? '—'}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-[hsl(var(--muted-foreground))]">
                    {row.authorName ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[hsl(var(--muted-foreground))]">
                    {formatDate(row.publishedAt, locale)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <span
                        className="me-2 inline-flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]"
                        title={t('columns.views')}
                      >
                        <Eye className="size-3.5" />
                        {formatNumber(row.views, locale)}
                      </span>
                      <a
                        href={`/${locale}/knowledge-manage/${row.id}/edit`}
                        className="rounded-[var(--radius)] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--primary)/0.08)] hover:text-[hsl(var(--primary))]"
                        title={tCommon('edit')}
                      >
                        <Pencil className="size-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: row.id, name: row.title || row.slug })}
                        className="rounded-[var(--radius)] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--destructive)/0.08)] hover:text-[hsl(var(--destructive))]"
                        title={tCommon('delete')}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {rows.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <span>
              {t('pagination.summary', {
                page: formatNumber(meta?.page ?? page, locale),
                totalPages: formatNumber(totalPages, locale),
                total: formatNumber(total, locale),
              })}
            </span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="h-8 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-xs text-[hsl(var(--foreground))]"
              aria-label={t('pagination.pageSize')}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {t('pagination.perPage', { count: formatNumber(size, locale) })}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || listQuery.isFetching}
              className="inline-flex h-8 items-center gap-1 rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 text-xs font-medium transition-colors hover:bg-[hsl(var(--secondary))] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="size-3.5 rtl:hidden" />
              <ChevronLeft className="hidden size-3.5 rtl:block" />
              {t('pagination.previous')}
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages || listQuery.isFetching}
              className="inline-flex h-8 items-center gap-1 rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 text-xs font-medium transition-colors hover:bg-[hsl(var(--secondary))] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('pagination.next')}
              <ChevronLeft className="size-3.5 rtl:hidden" />
              <ChevronRight className="hidden size-3.5 rtl:block" />
            </button>
          </div>
        </div>
      ) : null}

      <NewKnowledgeDialog open={showNew} onClose={() => setShowNew(false)} />

      {deleteTarget ? (
        <ConfirmDeleteDialog
          name={deleteTarget.name}
          title={t('deleteTitle')}
          question={t('deleteQuestion')}
          confirmLabel={tCommon('delete')}
          cancelLabel={tCommon('cancel')}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}
