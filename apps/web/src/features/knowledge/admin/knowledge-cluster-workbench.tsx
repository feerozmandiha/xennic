'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Boxes,
  CircleDot,
  GitMerge,
  RefreshCw,
  SearchCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { knowledgeApi } from './knowledge-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { KnowledgeQueryState, InlineError } from './knowledge-query-state';
import type { DuplicateAnalysis, KnowledgeCluster } from './knowledge-intelligence.types';

function percent(value: number) {
  return `${Math.round(value <= 1 ? value * 100 : value)}٪`;
}

export function KnowledgeClusterWorkbench() {
  const [clusters, setClusters] = useState<KnowledgeCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<KnowledgeCluster | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [threshold, setThreshold] = useState('0.60');
  const [nodeId, setNodeId] = useState('');
  const [duplicateAnalysis, setDuplicateAnalysis] = useState<DuplicateAnalysis | null>(null);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  const loadClusters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await knowledgeApi.get<KnowledgeCluster[]>('/knowledge-intelligence/clusters');
      setClusters(data);
      setSelectedCluster((current) => {
        if (!current) return data[0] ?? null;
        return data.find((cluster) => cluster.id === current.id) ?? data[0] ?? null;
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'دریافت خوشه‌ها ناموفق بود.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClusters();
  }, [loadClusters]);

  const handleCompute = async () => {
    const value = Number(threshold);
    if (Number.isNaN(value) || value < 0 || value > 1) {
      setActionError('آستانه باید عددی بین صفر و یک باشد.');
      return;
    }
    setComputing(true);
    setActionError(null);
    try {
      const data = await knowledgeApi.post<KnowledgeCluster[]>(
        `/knowledge-intelligence/clusters/compute?threshold=${value}`,
        {},
      );
      setClusters(data);
      setSelectedCluster(data[0] ?? null);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : 'محاسبه خوشه‌ها ناموفق بود.',
      );
    } finally {
      setComputing(false);
    }
  };

  const handleDuplicateCheck = async () => {
    const normalized = nodeId.trim();
    if (!normalized) return;
    setCheckingDuplicates(true);
    setActionError(null);
    try {
      setDuplicateAnalysis(
        await knowledgeApi.get<DuplicateAnalysis>(
          `/knowledge-intelligence/duplicates/${encodeURIComponent(normalized)}`,
        ),
      );
    } catch (requestError) {
      setActionError(
        requestError instanceof Error ? requestError.message : 'تحلیل تکرار ناموفق بود.',
      );
      setDuplicateAnalysis(null);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const summary = useMemo(() => {
    const nodeIds = new Set(clusters.flatMap((cluster) => cluster.nodeIds));
    const thresholds = clusters
      .map((cluster) => cluster.properties.threshold)
      .filter((value): value is number => typeof value === 'number');
    const average = thresholds.length
      ? thresholds.reduce((sum, value) => sum + value, 0) / thresholds.length
      : 0;
    return { nodes: nodeIds.size, average };
  }, [clusters]);

  if (loading && clusters.length === 0) return <KnowledgeQueryState kind="loading" />;
  if (error && clusters.length === 0) {
    return (
      <KnowledgeQueryState kind="error" description={error} onRetry={() => void loadClusters()} />
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="تعداد خوشه‌ها"
          value={clusters.length.toLocaleString('fa-IR')}
          icon={Boxes}
        />
        <SummaryCard
          label="گره‌های خوشه‌بندی‌شده"
          value={summary.nodes.toLocaleString('fa-IR')}
          icon={CircleDot}
        />
        <SummaryCard label="میانگین آستانه" value={percent(summary.average)} icon={GitMerge} />
      </section>

      {actionError ? <InlineError message={actionError} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(330px,0.75fr)_minmax(0,1.25fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal className="size-5 text-violet-600" />
                محاسبه خوشه‌ها
              </CardTitle>
              <CardDescription>
                گروه‌بندی خودکار گره‌ها بر اساس شباهت؛ آستانه بالاتر یعنی خوشه‌های سخت‌گیرانه‌تر.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label
                className="block text-xs font-medium text-muted-foreground"
                htmlFor="cluster-threshold"
              >
                آستانه شباهت (۰ تا ۱)
              </label>
              <div className="flex gap-2" dir="ltr">
                <Input
                  id="cluster-threshold"
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={threshold}
                  onChange={(event) => setThreshold(event.target.value)}
                />
                <Button onClick={() => void handleCompute()} disabled={computing} className="gap-2">
                  <RefreshCw className={computing ? 'size-4 animate-spin' : 'size-4'} />
                  محاسبه
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Boxes className="size-5 text-blue-600" />
                فهرست خوشه‌ها
              </CardTitle>
              <CardDescription>یک خوشه را برای بررسی اعضا انتخاب کنید.</CardDescription>
            </CardHeader>
            <CardContent>
              {clusters.length === 0 ? (
                <KnowledgeQueryState
                  kind="empty"
                  compact
                  title="هنوز خوشه‌ای ایجاد نشده"
                  description="اگر گراف داده دارد، محاسبه خوشه‌ها را با آستانه مناسب اجرا کنید."
                />
              ) : (
                <div className="max-h-[500px] space-y-2 overflow-y-auto pe-1">
                  {clusters.map((cluster) => (
                    <button
                      key={cluster.id}
                      type="button"
                      onClick={() => setSelectedCluster(cluster)}
                      className={`w-full rounded-xl border p-3 text-start transition hover:border-primary/30 hover:bg-muted/30 ${selectedCluster?.id === cluster.id ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{cluster.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {typeof cluster.properties.algorithm === 'string'
                              ? cluster.properties.algorithm
                              : 'semantic_threshold'}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {cluster.nodeIds.length.toLocaleString('fa-IR')} گره
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          آستانه{' '}
                          {typeof cluster.properties.threshold === 'number'
                            ? percent(cluster.properties.threshold)
                            : '—'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          {!selectedCluster ? (
            <KnowledgeQueryState
              kind="empty"
              icon={Boxes}
              title="خوشه‌ای برای بررسی وجود ندارد"
              description="ابتدا خوشه‌ها را محاسبه کنید یا یک خوشه موجود را انتخاب کنید."
            />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{selectedCluster.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedCluster.description || 'خوشه محاسبه‌شده از روابط و شباهت گره‌ها'}
                    </CardDescription>
                  </div>
                  <Badge>
                    {typeof selectedCluster.properties.threshold === 'number'
                      ? `${percent(selectedCluster.properties.threshold)} آستانه`
                      : 'آستانه ثبت نشده'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Detail
                    label="الگوریتم"
                    value={
                      typeof selectedCluster.properties.algorithm === 'string'
                        ? selectedCluster.properties.algorithm
                        : 'semantic_threshold'
                    }
                  />
                  <Detail
                    label="تعداد اعضا"
                    value={selectedCluster.nodeIds.length.toLocaleString('fa-IR')}
                  />
                  <Detail
                    label="تاریخ محاسبه"
                    value={new Date(selectedCluster.updatedAt).toLocaleDateString('fa-IR')}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold">اعضای خوشه</p>
                  <div className="grid max-h-[480px] gap-2 overflow-y-auto pe-1 sm:grid-cols-2">
                    {selectedCluster.nodeIds.map((id, index) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setNodeId(id)}
                        className="flex items-center gap-2 rounded-xl border p-3 text-start transition hover:border-primary/30"
                      >
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">
                          {(index + 1).toLocaleString('fa-IR')}
                        </span>
                        <span className="truncate font-mono text-[11px]" dir="ltr">
                          {id}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <SearchCheck className="size-5 text-rose-600" />
                بررسی تکراری‌ها
              </CardTitle>
              <CardDescription>
                شناسه یک گره ـ یا یکی از اعضای خوشه بالا ـ را برای تحلیل شباهت انتخاب کنید.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2" dir="ltr">
                <Input
                  value={nodeId}
                  onChange={(event) => setNodeId(event.target.value)}
                  placeholder="شناسه گره"
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  disabled={!nodeId.trim() || checkingDuplicates}
                  onClick={() => void handleDuplicateCheck()}
                  className="gap-2"
                >
                  <SearchCheck className={checkingDuplicates ? 'size-4 animate-pulse' : 'size-4'} />
                  تحلیل
                </Button>
              </div>

              {duplicateAnalysis ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Detail
                      label="تکراری قطعی"
                      value={duplicateAnalysis.duplicates.length.toLocaleString('fa-IR')}
                    />
                    <Detail
                      label="نزدیک به تکراری"
                      value={duplicateAnalysis.nearDuplicates.length.toLocaleString('fa-IR')}
                    />
                    <Detail label="اطمینان" value={percent(duplicateAnalysis.confidence)} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <DuplicateList
                      title="تکراری‌های قطعی"
                      ids={duplicateAnalysis.duplicates}
                      tone="rose"
                    />
                    <DuplicateList
                      title="موارد نزدیک"
                      ids={duplicateAnalysis.nearDuplicates}
                      tone="amber"
                    />
                  </div>
                </div>
              ) : (
                <KnowledgeQueryState
                  kind="empty"
                  compact
                  icon={ArrowLeftRight}
                  title="هنوز تحلیلی اجرا نشده"
                  description="شناسه گره را وارد کرده و دکمه تحلیل را بزنید."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Boxes;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="grid size-10 place-items-center rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-black">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function DuplicateList({
  title,
  ids,
  tone,
}: {
  title: string;
  ids: string[];
  tone: 'rose' | 'amber';
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      {ids.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
          موردی یافت نشد
        </p>
      ) : (
        <div className="space-y-2">
          {ids.map((id) => (
            <div
              key={id}
              className={`truncate rounded-xl border p-3 font-mono text-xs ${tone === 'rose' ? 'border-rose-500/20 bg-rose-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}
              dir="ltr"
            >
              {id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
