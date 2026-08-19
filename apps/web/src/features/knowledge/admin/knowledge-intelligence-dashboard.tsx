'use client';

<<<<<<< ours
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  GitBranch,
  Network,
  RefreshCw,
  Sparkles,
  TimerReset,
  TriangleAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/stores/toast.store';

interface CompletenessAnalysis {
  average: number;
  nodes: number;
  completeNodes: number;
  incompleteNodes: number;
}

interface FreshnessResult {
  nodeId: string;
  stale: boolean;
  daysSinceUpdate: number;
}

interface RankedNode {
  nodeId: string;
  label: string | null;
  score: number;
}

interface KnowledgeCluster {
  id: string;
  name: string;
  description: string | null;
  nodeIds: string[];
  properties: Record<string, unknown>;
}

interface IntelligenceOverview {
  completeness: CompletenessAnalysis;
  freshness: FreshnessResult[];
  confidence: RankedNode[];
  clusters: KnowledgeCluster[];
  components: string[][];
}

type ApiResponse<T> = { success: true; data: T };

const EMPTY_COMPLETENESS: CompletenessAnalysis = {
  average: 0,
  nodes: 0,
  completeNodes: 0,
  incompleteNodes: 0,
};

function percent(value: number): string {
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100).toLocaleString('fa-IR')}٪`;
}

function shortId(id: string): string {
  return `${id.slice(0, 8)}…`;
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = 'primary',
}: {
  title: string;
  value: string;
  hint: string;
  icon: typeof Activity;
  tone?: 'primary' | 'success' | 'warning';
}) {
  const toneClass = {
    primary: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]',
    success: 'bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]',
    warning: 'bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))]',
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{title}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
          <p className="mt-1 truncate text-[11px] text-[hsl(var(--muted-foreground))]">{hint}</p>
        </div>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            toneClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

export function KnowledgeIntelligenceDashboard() {
  const workspaceId = useAuthStore((state) => state.workspaceId);
  const queryClient = useQueryClient();
  const toast = useToast();

  const overviewQuery = useQuery({
    queryKey: ['knowledge-intelligence', 'overview', workspaceId],
    queryFn: async (): Promise<IntelligenceOverview> => {
      const [completeness, freshness, confidence, clusters, components] = await Promise.all([
        apiClient.get<ApiResponse<CompletenessAnalysis>>(
          '/knowledge-intelligence/metrics/workspace/completeness',
        ),
        apiClient.get<ApiResponse<FreshnessResult[]>>(
          '/knowledge-intelligence/metrics/workspace/freshness?thresholdDays=30',
        ),
        apiClient.get<ApiResponse<RankedNode[]>>(
          '/knowledge-intelligence/metrics/workspace/top/confidence?limit=8',
        ),
        apiClient.get<ApiResponse<KnowledgeCluster[]>>('/knowledge-intelligence/clusters'),
        apiClient.get<ApiResponse<{ components: string[][]; count: number }>>(
          '/knowledge-intelligence/graph/connected-components',
        ),
      ]);

      return {
        completeness: completeness.data ?? EMPTY_COMPLETENESS,
        freshness: freshness.data ?? [],
        confidence: confidence.data ?? [],
        clusters: clusters.data ?? [],
        components: components.data?.components ?? [],
      };
    },
    enabled: Boolean(workspaceId),
    retry: false,
    staleTime: 60_000,
  });

  const recomputeMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/knowledge-intelligence/metrics/workspace/confidence/recompute'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['knowledge-intelligence'] });
      toast.success('امتیازهای اطمینان دوباره محاسبه شد');
    },
    onError: () => toast.error('محاسبه دوباره امتیازها انجام نشد'),
  });

  const clusterMutation = useMutation({
    mutationFn: () => apiClient.post('/knowledge-intelligence/clusters/compute?threshold=0.6'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['knowledge-intelligence'] });
      toast.success('خوشه‌های دانش به‌روزرسانی شد');
    },
    onError: () => toast.error('به‌روزرسانی خوشه‌های دانش انجام نشد'),
  });

  const data = overviewQuery.data;
  const staleNodes = data?.freshness.filter((item) => item.stale) ?? [];
  const averageConfidence = data?.confidence.length
    ? data.confidence.reduce((sum, item) => sum + item.score, 0) / data.confidence.length
    : 0;

  return (
    <div>
      <PageHeader
        title="هوش دانش"
        description="نمای زنده‌ای از کیفیت، تازگی و ساختار معنایی دانشنامه"
        badge={<Badge variant="outline">گراف دانش</Badge>}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={overviewQuery.isFetching}
              disabled={!workspaceId}
              onClick={() => overviewQuery.refetch()}
            >
              <RefreshCw />
              تازه‌سازی
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={recomputeMutation.isPending}
              disabled={!workspaceId}
              onClick={() => recomputeMutation.mutate()}
            >
              <Sparkles />
              محاسبه اطمینان
            </Button>
            <Button
              type="button"
              size="sm"
              loading={clusterMutation.isPending}
              disabled={!workspaceId}
              onClick={() => clusterMutation.mutate()}
            >
              <GitBranch />
              خوشه‌بندی
            </Button>
          </div>
        }
      />

      {!workspaceId ? (
        <Card className="border-dashed">
          <CardContent className="flex min-h-48 flex-col items-center justify-center text-center">
            <Network className="mb-3 h-8 w-8 text-[hsl(var(--muted-foreground))]" />
            <p className="font-medium">ابتدا یک فضای کاری انتخاب کنید</p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              داده‌های هوش دانش برای فضای کاری فعال نمایش داده می‌شوند.
            </p>
          </CardContent>
        </Card>
      ) : overviewQuery.isLoading ? (
        <DashboardSkeleton />
      ) : overviewQuery.isError ? (
        <Card className="border-[hsl(var(--destructive)/0.35)]">
          <CardContent className="flex min-h-48 flex-col items-center justify-center text-center">
            <TriangleAlert className="mb-3 h-8 w-8 text-[hsl(var(--destructive))]" />
            <p className="font-medium">دریافت داده‌های هوش دانش انجام نشد</p>
            <p className="mt-1 max-w-md text-sm text-[hsl(var(--muted-foreground))]">
              دسترسی خود به مدیریت دانشنامه و اتصال سرویس را بررسی کنید.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              size="sm"
              onClick={() => overviewQuery.refetch()}
            >
              تلاش دوباره
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="گره‌های دانش"
              value={(data?.completeness.nodes ?? 0).toLocaleString('fa-IR')}
              hint="گره‌های ثبت‌شده در فضای کاری"
              icon={BrainCircuit}
            />
            <StatCard
              title="کامل بودن"
              value={percent(data?.completeness.average ?? 0)}
              hint={`${(data?.completeness.completeNodes ?? 0).toLocaleString('fa-IR')} گره کامل`}
              icon={CheckCircle2}
              tone="success"
            />
            <StatCard
              title="میانگین اطمینان"
              value={percent(averageConfidence)}
              hint="بر پایه برترین گره‌های رتبه‌بندی‌شده"
              icon={Activity}
            />
            <StatCard
              title="نیازمند بازبینی"
              value={staleNodes.length.toLocaleString('fa-IR')}
              hint="گره بدون به‌روزرسانی در ۳۰ روز"
              icon={TimerReset}
              tone={staleNodes.length ? 'warning' : 'success'}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>رتبه‌بندی اطمینان</CardTitle>
                    <CardDescription>دانش‌های دارای بالاترین امتیاز اعتبار ساختاری</CardDescription>
                  </div>
                  <Badge variant="secondary">{data?.confidence.length ?? 0}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {data?.confidence.length ? (
                  <div className="space-y-4">
                    {data.confidence.map((node) => (
                      <div key={node.nodeId}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                          <span className="truncate font-medium" title={node.label ?? node.nodeId}>
                            {node.label ?? shortId(node.nodeId)}
                          </span>
                          <span className="shrink-0 tabular-nums text-[hsl(var(--muted-foreground))]">
                            {percent(node.score)}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                          <div
                            className="h-full rounded-full bg-[hsl(var(--primary))] transition-all"
                            style={{ width: `${Math.max(0, Math.min(1, node.score)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="هنوز امتیاز اطمینانی محاسبه نشده است." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>اجزای متصل گراف</CardTitle>
                    <CardDescription>پیوستگی گره‌ها در شبکه معنایی دانش</CardDescription>
                  </div>
                  <Badge variant="secondary">{data?.components.length ?? 0}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {data?.components.length ? (
                  <div className="space-y-3">
                    {data.components.slice(0, 8).map((component, index) => {
                      const largest = Math.max(...data.components.map((item) => item.length), 1);
                      return (
                        <div
                          key={`${component[0] ?? 'component'}-${index}`}
                          className="flex items-center gap-3"
                        >
                          <span className="w-16 shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
                            جزء {(index + 1).toLocaleString('fa-IR')}
                          </span>
                          <div className="h-7 flex-1 overflow-hidden rounded-[var(--radius)] bg-[hsl(var(--secondary))]">
                            <div
                              className="flex h-full min-w-10 items-center justify-end rounded-[var(--radius)] bg-[hsl(var(--primary)/0.15)] px-2 text-[10px] font-semibold text-[hsl(var(--primary))]"
                              style={{
                                width: `${Math.max(12, (component.length / largest) * 100)}%`,
                              }}
                            >
                              {component.length.toLocaleString('fa-IR')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState text="برای نمایش ارتباطات، گره‌های بیشتری لازم است." />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>خوشه‌های معنایی</CardTitle>
                  <CardDescription>گروه‌های خودکار دانش با شباهت محتوایی</CardDescription>
                </div>
                <Badge variant="outline">{data?.clusters.length ?? 0} خوشه</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {data?.clusters.length ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {data.clusters.slice(0, 9).map((cluster) => (
                    <div
                      key={cluster.id}
                      className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.25)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{cluster.name}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-[hsl(var(--muted-foreground))]">
                            {cluster.description ?? 'خوشه‌ی معنایی خودکار'}
                          </p>
                        </div>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                          <GitBranch className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-xs">
                        <span className="text-[hsl(var(--muted-foreground))]">اندازه خوشه</span>
                        <span className="font-semibold tabular-nums">
                          {cluster.nodeIds.length.toLocaleString('fa-IR')} گره
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="هنوز خوشه‌ای ساخته نشده؛ عملیات خوشه‌بندی را اجرا کنید." />
              )}
            </CardContent>
          </Card>
        </div>
      )}
=======
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle2,
  Clock3,
  Network,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { knowledgeApi } from './knowledge-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KnowledgeQueryState, InlineError } from './knowledge-query-state';
import type {
  CompletenessAnalysis,
  ConfidenceRecomputeResult,
  ConnectedComponentsResult,
  FreshnessResult,
  RankedNode,
  WorkspaceMetric,
} from './knowledge-intelligence.types';

const metricOptions: Array<{ value: WorkspaceMetric; label: string }> = [
  { value: 'confidence', label: 'اعتماد' },
  { value: 'freshness', label: 'تازگی' },
  { value: 'authority', label: 'اعتبار' },
  { value: 'completeness', label: 'کامل‌بودن' },
];

const chartColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

function toPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}٪`;
}

export function KnowledgeIntelligenceDashboard() {
  const [completeness, setCompleteness] = useState<CompletenessAnalysis | null>(null);
  const [freshness, setFreshness] = useState<FreshnessResult[]>([]);
  const [components, setComponents] = useState<ConnectedComponentsResult | null>(null);
  const [ranking, setRanking] = useState<RankedNode[]>([]);
  const [metric, setMetric] = useState<WorkspaceMetric>('confidence');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [recomputing, setRecomputing] = useState(false);
  const [refreshingFreshness, setRefreshingFreshness] = useState(false);
  const [lastComputed, setLastComputed] = useState<number | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [completenessData, freshnessData, componentsData, rankingData] = await Promise.all([
        knowledgeApi.get<CompletenessAnalysis>(
          '/knowledge-intelligence/metrics/workspace/completeness',
        ),
        knowledgeApi.get<FreshnessResult[]>(
          '/knowledge-intelligence/metrics/workspace/freshness?thresholdDays=30',
        ),
        knowledgeApi.get<ConnectedComponentsResult>(
          '/knowledge-intelligence/graph/connected-components',
        ),
        knowledgeApi.get<RankedNode[]>(
          `/knowledge-intelligence/metrics/workspace/top/${metric}?limit=10`,
        ),
      ]);
      setCompleteness(completenessData);
      setFreshness(freshnessData);
      setComponents(componentsData);
      setRanking(rankingData);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'دریافت نمای کیفیت ناموفق بود.',
      );
    } finally {
      setLoading(false);
    }
  }, [metric]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const distribution = useMemo(() => {
    if (!completeness) return [];
    return [
      { label: 'کامل', value: completeness.completeNodes },
      { label: 'نیازمند تکمیل', value: completeness.incompleteNodes },
    ];
  }, [completeness]);

  const staleNodes = useMemo(() => freshness.filter((item) => item.stale), [freshness]);

  const handleRecompute = async () => {
    setRecomputing(true);
    setActionError(null);
    try {
      const result = await knowledgeApi.post<ConfidenceRecomputeResult>(
        '/knowledge-intelligence/metrics/workspace/confidence/recompute',
        {},
      );
      setLastComputed(result.computed);
      await loadOverview();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : 'محاسبه دوباره اعتماد ناموفق بود.',
      );
    } finally {
      setRecomputing(false);
    }
  };

  const handleFreshnessRefresh = async () => {
    setRefreshingFreshness(true);
    setActionError(null);
    try {
      const result = await knowledgeApi.get<FreshnessResult[]>(
        '/knowledge-intelligence/metrics/workspace/freshness?thresholdDays=30',
      );
      setFreshness(result);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : 'به‌روزرسانی تازگی ناموفق بود.',
      );
    } finally {
      setRefreshingFreshness(false);
    }
  };

  if (loading && !completeness) {
    return <KnowledgeQueryState kind="loading" />;
  }

  if (error && !completeness) {
    return (
      <KnowledgeQueryState kind="error" description={error} onRetry={() => void loadOverview()} />
    );
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <Activity className="size-5" />
            </span>
            <div>
              <h2 className="font-bold">مرکز کیفیت دانش</h2>
              <p className="text-sm text-muted-foreground">
                پایش کامل‌بودن، تازگی، اعتماد و پیوستگی گراف فضای کاری
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={refreshingFreshness}
            onClick={() => void handleFreshnessRefresh()}
          >
            <Clock3 className={refreshingFreshness ? 'size-4 animate-spin' : 'size-4'} />
            محاسبه تازگی
          </Button>
          <Button
            size="sm"
            className="gap-2"
            disabled={recomputing}
            onClick={() => void handleRecompute()}
          >
            <RefreshCw className={recomputing ? 'size-4 animate-spin' : 'size-4'} />
            باز‌محاسبه اعتماد
          </Button>
        </div>
      </section>

      {actionError ? <InlineError message={actionError} /> : null}
      {lastComputed != null ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="size-4" />
          امتیاز اعتماد {lastComputed.toLocaleString('fa-IR')} گره دوباره محاسبه شد.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={BarChart3}
          label="میانگین کامل‌بودن"
          value={toPercent(completeness?.average)}
          detail={`${(completeness?.completeNodes ?? 0).toLocaleString('fa-IR')} گره کامل`}
          tone="emerald"
        />
        <MetricCard
          icon={Clock3}
          label="گره‌های نیازمند تازگی"
          value={staleNodes.length.toLocaleString('fa-IR')}
          detail="آستانه ۳۰ روز"
          tone="amber"
        />
        <MetricCard
          icon={Network}
          label="اجزای متصل گراف"
          value={(components?.count ?? 0).toLocaleString('fa-IR')}
          detail={`${components?.components.reduce((sum, group) => sum + group.length, 0).toLocaleString('fa-IR') ?? '۰'} گره`}
          tone="blue"
        />
        <MetricCard
          icon={ShieldCheck}
          label="پوشش سنجه‌ها"
          value={(completeness?.nodes ?? 0).toLocaleString('fa-IR')}
          detail="کل گره‌های تحلیل‌شده"
          tone="violet"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-5 text-emerald-600" />
              توزیع کامل‌بودن محتوا
            </CardTitle>
            <CardDescription>تعداد گره‌ها در چهار سطح کیفیت محتوایی</CardDescription>
          </CardHeader>
          <CardContent>
            {distribution.every((item) => item.value === 0) ? (
              <KnowledgeQueryState
                kind="empty"
                compact
                title="هنوز سنجه‌ای محاسبه نشده"
                description="پس از انتشار اسناد و ایجاد گره‌های گراف، توزیع کیفیت در این بخش دیده می‌شود."
              />
            ) : (
              <div className="h-72 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={34} />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted) / 0.45)' }}
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: 'hsl(var(--border))',
                        background: 'hsl(var(--background))',
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 2, 2]}>
                      {distribution.map((entry, index) => (
                        <Cell key={entry.label} fill={chartColors[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="size-5 text-violet-600" />
                  برترین گره‌ها
                </CardTitle>
                <CardDescription>رتبه‌بندی عملیاتی بر اساس سنجه انتخاب‌شده</CardDescription>
              </div>
              <select
                value={metric}
                onChange={(event) => setMetric(event.target.value as WorkspaceMetric)}
                className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                aria-label="انتخاب سنجه رتبه‌بندی"
              >
                {metricOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <KnowledgeQueryState
                kind="empty"
                compact
                title="رتبه‌بندی خالی است"
                description="برای این سنجه هنوز امتیازی در فضای کاری ثبت نشده است."
              />
            ) : (
              <div className="space-y-2">
                {ranking.map((node, index) => (
                  <div
                    key={node.nodeId}
                    className="flex items-center gap-3 rounded-xl border bg-muted/15 p-3"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-background text-sm font-bold shadow-sm ring-1 ring-border">
                      {(index + 1).toLocaleString('fa-IR')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{node.label || node.nodeId}</p>
                      <p className="truncate font-mono text-[11px] text-muted-foreground" dir="ltr">
                        {node.nodeId}
                      </p>
                    </div>
                    <Badge variant="secondary">{toPercent(node.score)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Network className="size-5 text-blue-600" />
            اجزای متصل فضای کاری
          </CardTitle>
          <CardDescription>
            گروه‌های جدا از هم در گراف؛ اجزای کوچک می‌توانند نشان‌دهنده محتوای منزوی باشند.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!components || components.components.length === 0 ? (
            <KnowledgeQueryState kind="empty" compact title="گراف متصلی ثبت نشده است" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {components.components.slice(0, 12).map((group, index) => (
                <div key={`${index}-${group[0] ?? 'empty'}`} className="rounded-xl border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">
                      جزء {(index + 1).toLocaleString('fa-IR')}
                    </span>
                    <Badge variant={group.length === 1 ? 'outline' : 'secondary'}>
                      {group.length.toLocaleString('fa-IR')} گره
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {group.slice(0, 3).map((nodeId) => (
                      <p
                        key={nodeId}
                        className="truncate font-mono text-[11px] text-muted-foreground"
                        dir="ltr"
                      >
                        {nodeId}
                      </p>
                    ))}
                    {group.length > 3 ? (
                      <p className="text-xs text-muted-foreground">
                        و {(group.length - 3).toLocaleString('fa-IR')} گره دیگر
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
>>>>>>> theirs
    </div>
  );
}

<<<<<<< ours
function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[hsl(var(--border))] px-4 text-center">
      <Network className="mb-2 h-6 w-6 text-[hsl(var(--muted-foreground)/0.7)]" />
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{text}</p>
    </div>
=======
function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  detail: string;
  tone: 'emerald' | 'amber' | 'blue' | 'violet';
}) {
  const tones = {
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    violet: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
            <Icon className="size-5" />
          </span>
        </div>
      </CardContent>
    </Card>
>>>>>>> theirs
  );
}
