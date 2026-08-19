'use client';

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
    </div>
  );
}

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
  );
}
