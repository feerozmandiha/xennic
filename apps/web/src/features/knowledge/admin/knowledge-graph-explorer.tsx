'use client';

import { FormEvent, useCallback, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  BookOpenCheck,
  Boxes,
  ChevronLeft,
  GitBranch,
  Link2,
  LocateFixed,
  Network,
  Route,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { knowledgeApi } from './knowledge-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { KnowledgeQueryState, InlineError } from './knowledge-query-state';
import type {
  CitationGraphItem,
  ConflictResult,
  DependencyResult,
  DuplicateAnalysis,
  GraphNeighbor,
  GraphSearchResult,
  GraphSubgraph,
  GraphTraversalItem,
  NodeInvestigation,
  NodeMetrics,
  ProvenanceItem,
  ProvenanceResult,
  RelatedGraphNode,
  ShortestPathResult,
  CitationExpansion,
} from './knowledge-intelligence.types';

type InspectorSection = 'overview' | 'relations' | 'lineage' | 'risks';

const sectionOptions: Array<{ id: InspectorSection; label: string }> = [
  { id: 'overview', label: 'نمای کلی' },
  { id: 'relations', label: 'روابط' },
  { id: 'lineage', label: 'تبار و ارجاع' },
  { id: 'risks', label: 'ریسک و تکرار' },
];

function scoreLabel(value: number | null | undefined) {
  if (value == null) return '—';
  return `${Math.round(value <= 1 ? value * 100 : value)}٪`;
}

function getProvenanceItems(value: ProvenanceResult | ProvenanceItem[]): ProvenanceItem[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.provenance)) return value.provenance;
  if (Array.isArray(value.chain)) return value.chain;
  if (Array.isArray(value.nodes)) {
    return value.nodes.map((node) => ({ nodeId: node.id, label: node.label }));
  }
  return [];
}

async function safely<T>(request: Promise<T>, fallback: T): Promise<{ data: T; failed: boolean }> {
  try {
    return { data: await request, failed: false };
  } catch {
    return { data: fallback, failed: true };
  }
}

export function KnowledgeGraphExplorer() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GraphSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [nodeIdInput, setNodeIdInput] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphSearchResult | null>(null);
  const [investigation, setInvestigation] = useState<NodeInvestigation | null>(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [inspectorWarning, setInspectorWarning] = useState<string | null>(null);
  const [section, setSection] = useState<InspectorSection>('overview');
  const [pathTarget, setPathTarget] = useState('');
  const [pathResult, setPathResult] = useState<ShortestPathResult | null | undefined>();
  const [pathLoading, setPathLoading] = useState(false);
  const [pathError, setPathError] = useState<string | null>(null);
  const [subgraph, setSubgraph] = useState<GraphSubgraph | null>(null);
  const [subgraphLoading, setSubgraphLoading] = useState(false);
  const [citations, setCitations] = useState<CitationGraphItem[] | null>(null);
  const [citationsLoading, setCitationsLoading] = useState(false);

  const inspectNode = useCallback(async (node: GraphSearchResult) => {
    setSelectedNode(node);
    setNodeIdInput(node.id);
    setInspectorLoading(true);
    setInspectorWarning(null);
    setInvestigation(null);
    setPathResult(undefined);
    setSubgraph(null);

    const encodedId = encodeURIComponent(node.id);
    const requests = await Promise.all([
      safely(
        knowledgeApi.get<NodeMetrics | null>(`/knowledge-intelligence/metrics/${encodedId}`),
        null,
      ),
      safely(
        knowledgeApi.get<GraphNeighbor[]>(
          `/knowledge-intelligence/graph/neighbors/${encodedId}?direction=both`,
        ),
        [],
      ),
      safely(
        knowledgeApi.get<RelatedGraphNode[]>(
          `/knowledge-intelligence/search/related/${encodedId}?limit=20`,
        ),
        [],
      ),
      safely(
        knowledgeApi.get<GraphTraversalItem[]>(
          `/knowledge-intelligence/graph/ancestors/${encodedId}?maxDepth=8`,
        ),
        [],
      ),
      safely(
        knowledgeApi.get<GraphTraversalItem[]>(
          `/knowledge-intelligence/graph/descendants/${encodedId}?maxDepth=8`,
        ),
        [],
      ),
      safely(
        knowledgeApi.get<ProvenanceResult | ProvenanceItem[]>(
          `/knowledge-intelligence/graph/provenance/${encodedId}?maxDepth=8`,
        ),
        [],
      ),
      safely(
        knowledgeApi.get<DependencyResult>(
          `/knowledge-intelligence/graph/dependencies/${encodedId}?maxDepth=6`,
        ),
        { nodes: [], edges: [] },
      ),
      safely(
        knowledgeApi.get<ConflictResult>(`/knowledge-intelligence/graph/conflicts/${encodedId}`),
        { superseded: [], equivalents: [] },
      ),
      safely(
        knowledgeApi.get<DuplicateAnalysis>(`/knowledge-intelligence/duplicates/${encodedId}`),
        { nodeId: node.id, duplicates: [], nearDuplicates: [], confidence: 0 },
      ),
      safely(
        knowledgeApi.get<CitationExpansion[]>(
          `/knowledge-intelligence/citations/expand/${encodedId}?maxDepth=4`,
        ),
        [],
      ),
    ] as const);

    setInvestigation({
      metrics: requests[0].data,
      neighbors: requests[1].data,
      related: requests[2].data,
      ancestors: requests[3].data,
      descendants: requests[4].data,
      provenance: requests[5].data,
      dependencies: requests[6].data,
      conflicts: requests[7].data,
      duplicates: requests[8].data,
      citations: requests[9].data,
    });

    const failedCount = requests.filter((item) => item.failed).length;
    if (failedCount > 0) {
      setInspectorWarning(
        `${failedCount.toLocaleString('fa-IR')} بخش از تحلیل در دسترس نبود؛ سایر نتایج نمایش داده شده‌اند.`,
      );
    }
    setInspectorLoading(false);

    void knowledgeApi
      .post(`/knowledge-intelligence/metrics/${encodedId}/access`, {})
      .catch(() => undefined);
  }, []);

  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    setSearching(true);
    setSearchAttempted(true);
    setSearchError(null);
    try {
      const data = await knowledgeApi.get<GraphSearchResult[]>(
        `/knowledge-intelligence/search/graph?query=${encodeURIComponent(normalized)}`,
      );
      setResults(data);
    } catch (requestError) {
      setSearchError(
        requestError instanceof Error ? requestError.message : 'جست‌وجوی گراف ناموفق بود.',
      );
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleDirectInspect = () => {
    const id = nodeIdInput.trim();
    if (!id) return;
    void inspectNode({
      id,
      label: null,
      type: 'unknown',
      entityType: 'unknown',
      entityId: '',
      score: 0,
      neighbors: 0,
      citations: 0,
    });
  };

  const handleShortestPath = async () => {
    if (!selectedNode || !pathTarget.trim()) return;
    setPathLoading(true);
    setPathError(null);
    try {
      const result = await knowledgeApi.get<ShortestPathResult | null>(
        `/knowledge-intelligence/graph/shortest-path/${encodeURIComponent(selectedNode.id)}/${encodeURIComponent(pathTarget.trim())}?maxDepth=12`,
      );
      setPathResult(result);
    } catch (requestError) {
      setPathError(
        requestError instanceof Error ? requestError.message : 'محاسبه مسیر ناموفق بود.',
      );
    } finally {
      setPathLoading(false);
    }
  };

  const handleSubgraph = async () => {
    if (!selectedNode || !investigation) return;
    const ids = [
      selectedNode.id,
      ...investigation.neighbors.slice(0, 20).map((item) => item.nodeId),
    ];
    setSubgraphLoading(true);
    try {
      const data = await knowledgeApi.get<GraphSubgraph>(
        `/knowledge-intelligence/graph/subgraph?nodeIds=${encodeURIComponent(ids.join(','))}`,
      );
      setSubgraph(data);
    } catch (requestError) {
      setInspectorWarning(
        requestError instanceof Error ? requestError.message : 'دریافت زیرگراف ناموفق بود.',
      );
    } finally {
      setSubgraphLoading(false);
    }
  };

  const handleCitationGraph = async () => {
    setCitationsLoading(true);
    try {
      const path = selectedNode
        ? `/knowledge-intelligence/citations/graph?sourceId=${encodeURIComponent(selectedNode.id)}`
        : '/knowledge-intelligence/citations/graph';
      setCitations(await knowledgeApi.get<CitationGraphItem[]>(path));
    } catch (requestError) {
      setInspectorWarning(
        requestError instanceof Error ? requestError.message : 'دریافت شبکه ارجاعات ناموفق بود.',
      );
    } finally {
      setCitationsLoading(false);
    }
  };

  const provenanceItems = useMemo(
    () => getProvenanceItems(investigation?.provenance ?? []),
    [investigation],
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.7fr)_minmax(0,1.3fr)]">
      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="size-5 text-blue-600" />
              جست‌وجوی معنایی گراف
            </CardTitle>
            <CardDescription>
              مفهوم، استاندارد یا تجهیز را جست‌وجو کنید؛ رتبه‌بندی با روابط، ارجاعات و سنجه‌ها انجام
              می‌شود.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={(event) => void handleSearch(event)} className="flex gap-2">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="مثلاً حفاظت قوس الکتریکی"
                className="h-10"
              />
              <Button type="submit" disabled={searching || !query.trim()} className="gap-2">
                <Search className={searching ? 'size-4 animate-pulse' : 'size-4'} />
                جست‌وجو
              </Button>
            </form>

            <div className="border-t pt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">یا شناسه دقیق گره</p>
              <div className="flex gap-2" dir="ltr">
                <Input
                  value={nodeIdInput}
                  onChange={(event) => setNodeIdInput(event.target.value)}
                  placeholder="node UUID"
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  onClick={handleDirectInspect}
                  disabled={!nodeIdInput.trim()}
                >
                  <LocateFixed className="size-4" />
                </Button>
              </div>
            </div>

            {searchError ? <InlineError message={searchError} /> : null}
            {searching ? <KnowledgeQueryState kind="loading" compact /> : null}
            {!searching && searchAttempted && results.length === 0 && !searchError ? (
              <KnowledgeQueryState
                kind="empty"
                compact
                title="نتیجه‌ای در گراف پیدا نشد"
                description="عبارت دیگری امتحان کنید یا شناسه گره را مستقیماً وارد کنید."
              />
            ) : null}

            {!searching && results.length > 0 ? (
              <div className="max-h-[560px] space-y-2 overflow-y-auto pe-1">
                {results.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => void inspectNode(result)}
                    className={`w-full rounded-xl border p-3 text-start transition hover:border-primary/40 hover:bg-muted/40 ${selectedNode?.id === result.id ? 'border-primary bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300">
                        <Network className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold">
                            {result.label || 'گره بدون عنوان'}
                          </p>
                          <Badge variant="secondary">{scoreLabel(result.score)}</Badge>
                        </div>
                        <p
                          className="mt-1 truncate font-mono text-[11px] text-muted-foreground"
                          dir="ltr"
                        >
                          {result.id}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                          <span>{result.neighbors.toLocaleString('fa-IR')} رابطه</span>
                          <span>•</span>
                          <span>{result.citations.toLocaleString('fa-IR')} ارجاع</span>
                          <span>•</span>
                          <span>{result.type}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Route className="size-5 text-violet-600" />
              کوتاه‌ترین مسیر
            </CardTitle>
            <CardDescription>مسیر رابطه‌ای میان گره انتخاب‌شده و گره مقصد</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              dir="ltr"
              value={pathTarget}
              onChange={(event) => setPathTarget(event.target.value)}
              placeholder="شناسه گره مقصد"
              className="font-mono text-xs"
            />
            <Button
              variant="outline"
              className="w-full gap-2"
              disabled={!selectedNode || !pathTarget.trim() || pathLoading}
              onClick={() => void handleShortestPath()}
            >
              <ArrowLeftRight className={pathLoading ? 'size-4 animate-pulse' : 'size-4'} />
              محاسبه مسیر
            </Button>
            {pathError ? <InlineError message={pathError} /> : null}
            {pathResult === null ? (
              <KnowledgeQueryState
                kind="empty"
                compact
                title="در محدوده تعیین‌شده مسیری وجود ندارد"
              />
            ) : null}
            {pathResult?.path?.length ? (
              <div className="space-y-1 rounded-xl border bg-muted/20 p-3">
                {pathResult.path.map((id, index) => (
                  <div key={`${id}-${index}`} className="flex items-center gap-2 text-xs">
                    <span className="grid size-6 place-items-center rounded-full bg-background font-bold ring-1 ring-border">
                      {(index + 1).toLocaleString('fa-IR')}
                    </span>
                    <span className="truncate font-mono" dir="ltr">
                      {id}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="min-w-0 space-y-5">
        {!selectedNode ? (
          <KnowledgeQueryState
            kind="empty"
            className="min-h-[420px]"
            icon={LocateFixed}
            title="یک گره را برای بررسی انتخاب کنید"
            description="از جست‌وجوی معنایی یا شناسه مستقیم استفاده کنید تا سنجه‌ها، روابط، منشأ، وابستگی‌ها، تعارض‌ها و موارد مشابه یکجا نمایش داده شوند."
          />
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="border-b bg-gradient-to-l from-blue-500/10 via-violet-500/5 to-transparent p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge>{selectedNode.type}</Badge>
                      {selectedNode.entityType !== 'unknown' ? (
                        <Badge variant="outline">{selectedNode.entityType}</Badge>
                      ) : null}
                    </div>
                    <h2 className="truncate text-xl font-black">
                      {selectedNode.label || 'گره انتخاب‌شده'}
                    </h2>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground" dir="ltr">
                      {selectedNode.id}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      disabled={!investigation || subgraphLoading}
                      onClick={() => void handleSubgraph()}
                    >
                      <Boxes className={subgraphLoading ? 'size-4 animate-pulse' : 'size-4'} />
                      زیرگراف همسایه‌ها
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      disabled={citationsLoading}
                      onClick={() => void handleCitationGraph()}
                    >
                      <BookOpenCheck
                        className={citationsLoading ? 'size-4 animate-pulse' : 'size-4'}
                      />
                      شبکه ارجاع
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted/60 p-1">
                  {sectionOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSection(option.id)}
                      className={`min-w-max rounded-lg px-3 py-2 text-sm transition ${section === option.id ? 'bg-background font-semibold shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {inspectorWarning ? <InlineError message={inspectorWarning} /> : null}
            {inspectorLoading || !investigation ? (
              <KnowledgeQueryState kind="loading" />
            ) : (
              <>
                {section === 'overview' ? <OverviewSection data={investigation} /> : null}
                {section === 'relations' ? (
                  <RelationsSection
                    data={investigation}
                    onInspect={(id) =>
                      void inspectNode({
                        id,
                        label: null,
                        type: 'unknown',
                        entityType: 'unknown',
                        entityId: '',
                        score: 0,
                        neighbors: 0,
                        citations: 0,
                      })
                    }
                  />
                ) : null}
                {section === 'lineage' ? (
                  <LineageSection data={investigation} provenanceItems={provenanceItems} />
                ) : null}
                {section === 'risks' ? <RiskSection data={investigation} /> : null}
              </>
            )}

            {subgraph ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Boxes className="size-5 text-blue-600" />
                    زیرگراف انتخابی
                  </CardTitle>
                  <CardDescription>
                    {subgraph.nodes.length.toLocaleString('fa-IR')} گره و{' '}
                    {subgraph.edges.length.toLocaleString('fa-IR')} یال
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 sm:grid-cols-2">
                  {subgraph.nodes.slice(0, 20).map((node) => (
                    <div key={node.id} className="rounded-xl border p-3">
                      <p className="truncate text-sm font-medium">{node.label || node.id}</p>
                      <p
                        className="mt-1 truncate font-mono text-[11px] text-muted-foreground"
                        dir="ltr"
                      >
                        {node.id}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {citations ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpenCheck className="size-5 text-emerald-600" />
                    شبکه ارجاعات
                  </CardTitle>
                  <CardDescription>
                    {citations.length.toLocaleString('fa-IR')} رابطه ارجاعی
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {citations.length === 0 ? (
                    <KnowledgeQueryState
                      kind="empty"
                      compact
                      title="ارجاعی برای این گره ثبت نشده است"
                    />
                  ) : (
                    <div className="space-y-2">
                      {citations.slice(0, 30).map((citation) => (
                        <div key={citation.id} className="rounded-xl border p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="truncate font-medium">
                              {citation.source.label || citation.source.id}
                            </span>
                            <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
                            <span className="truncate font-medium">
                              {citation.target.label || citation.target.id}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{citation.method}</span>
                            <span>اعتماد {scoreLabel(citation.confidence)}</span>
                            {citation.location ? <span>{citation.location}</span> : null}
                          </div>
                          {citation.context ? (
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                              {citation.context}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function OverviewSection({ data }: { data: NodeInvestigation }) {
  const metrics = data.metrics;
  const items = [
    ['اعتماد', metrics?.confidence],
    ['تازگی', metrics?.freshness],
    ['اعتبار', metrics?.authority],
    ['کامل‌بودن', metrics?.completeness],
  ] as const;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-black">{scoreLabel(value)}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-blue-500"
                  style={{ width: `${Math.max(0, Math.min(100, (value ?? 0) * 100))}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <CountPanel icon={Link2} label="همسایه مستقیم" count={data.neighbors.length} />
        <CountPanel icon={Sparkles} label="محتوای مرتبط" count={data.related.length} />
        <CountPanel icon={BookOpenCheck} label="ارجاع توسعه‌یافته" count={data.citations.length} />
      </div>
      {!metrics ? (
        <KnowledgeQueryState
          kind="empty"
          compact
          title="سنجه‌ای برای این گره موجود نیست"
          description="گره در گراف وجود دارد اما محاسبه سنجه‌های کیفیت هنوز انجام نشده است."
        />
      ) : (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-sm">
            <span>
              امتیاز ترکیبی: <strong>{scoreLabel(metrics.compositeScore)}</strong>
            </span>
            <span>
              تعداد مشاهده: <strong>{metrics.accessCount.toLocaleString('fa-IR')}</strong>
            </span>
            <span className="text-muted-foreground">
              آخرین محاسبه: {new Date(metrics.computedAt).toLocaleDateString('fa-IR')}
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RelationsSection({
  data,
  onInspect,
}: {
  data: NodeInvestigation;
  onInspect: (id: string) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <RelationList
        title="همسایه‌های مستقیم"
        icon={Network}
        empty="این گره همسایه مستقیمی ندارد."
        items={data.neighbors.map((item) => ({
          id: item.nodeId,
          title: item.nodeId,
          meta: `${item.edgeType} · وزن ${item.weight.toLocaleString('fa-IR')}`,
        }))}
        onInspect={onInspect}
      />
      <RelationList
        title="محتوای مرتبط"
        icon={Sparkles}
        empty="محتوای مرتبطی پیدا نشد."
        items={data.related.map((item) => ({
          id: item.id,
          title: item.label || item.id,
          meta: `${item.connection || 'رابطه غیرمستقیم'} · ارتباط ${scoreLabel(item.relevance)}`,
        }))}
        onInspect={onInspect}
      />
      <RelationList
        title="نیاکان"
        icon={GitBranch}
        empty="نیایی برای این گره ثبت نشده است."
        items={data.ancestors.map((item) => ({
          id: item.nodeId,
          title: item.nodeId,
          meta: `${item.edgeType} · فاصله ${item.distance.toLocaleString('fa-IR')}`,
        }))}
        onInspect={onInspect}
      />
      <RelationList
        title="فرزندان"
        icon={GitBranch}
        empty="فرزندی برای این گره ثبت نشده است."
        items={data.descendants.map((item) => ({
          id: item.nodeId,
          title: item.nodeId,
          meta: `${item.edgeType} · فاصله ${item.distance.toLocaleString('fa-IR')}`,
        }))}
        onInspect={onInspect}
      />
    </div>
  );
}

function LineageSection({
  data,
  provenanceItems,
}: {
  data: NodeInvestigation;
  provenanceItems: ProvenanceItem[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="size-5 text-violet-600" />
            زنجیره منشأ
          </CardTitle>
          <CardDescription>ردیابی منبع و تبدیل‌های منتهی به این گره</CardDescription>
        </CardHeader>
        <CardContent>
          {provenanceItems.length === 0 ? (
            <KnowledgeQueryState kind="empty" compact title="زنجیره منشأ ثبت نشده است" />
          ) : (
            <div className="space-y-2">
              {provenanceItems.slice(0, 30).map((item, index) => (
                <div key={`${item.nodeId}-${index}`} className="flex gap-3 rounded-xl border p-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-700">
                    {(index + 1).toLocaleString('fa-IR')}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.label || item.nodeId}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.relation || item.source || 'منشأ گراف'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpenCheck className="size-5 text-emerald-600" />
            گسترش ارجاعات
          </CardTitle>
          <CardDescription>ارجاعات چندمرحله‌ای مرتب‌شده بر اساس اعتماد</CardDescription>
        </CardHeader>
        <CardContent>
          {data.citations.length === 0 ? (
            <KnowledgeQueryState kind="empty" compact title="ارجاع توسعه‌یافته‌ای وجود ندارد" />
          ) : (
            <div className="space-y-2">
              {data.citations.slice(0, 30).map((item) => (
                <div key={`${item.targetId}-${item.depth}`} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-mono text-xs" dir="ltr">
                      {item.targetId}
                    </p>
                    <Badge variant="secondary">{scoreLabel(item.confidence)}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    عمق {item.depth.toLocaleString('fa-IR')} · مسیر{' '}
                    {item.path.length.toLocaleString('fa-IR')} گره
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Boxes className="size-5 text-blue-600" />
            شبکه وابستگی
          </CardTitle>
          <CardDescription>
            {data.dependencies.nodes.length.toLocaleString('fa-IR')} گره و{' '}
            {data.dependencies.edges.length.toLocaleString('fa-IR')} رابطه وابستگی
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.dependencies.nodes.length === 0 ? (
            <KnowledgeQueryState kind="empty" compact title="وابستگی ثبت‌شده‌ای وجود ندارد" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.dependencies.nodes.slice(0, 50).map((id) => (
                <Badge
                  key={id}
                  variant="outline"
                  className="max-w-full truncate font-mono font-normal"
                  dir="ltr"
                >
                  {id}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RiskSection({ data }: { data: NodeInvestigation }) {
  const conflicts = [...data.conflicts.superseded, ...data.conflicts.equivalents];
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="size-5 text-amber-600" />
            تعارض‌های معنایی
          </CardTitle>
          <CardDescription>روابط جایگزینی و معادل‌های چندگانه</CardDescription>
        </CardHeader>
        <CardContent>
          {conflicts.length === 0 ? (
            <KnowledgeQueryState kind="empty" compact title="تعارضی شناسایی نشد" />
          ) : (
            <div className="space-y-2">
              {conflicts.map((item, index) => (
                <div
                  key={`${item.nodeId}-${index}`}
                  className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3"
                >
                  <p className="truncate font-mono text-xs" dir="ltr">
                    {item.nodeId}
                  </p>
                  <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                    {item.conflictType}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowLeftRight className="size-5 text-rose-600" />
            تحلیل تکرار
          </CardTitle>
          <CardDescription>موارد تکراری و نزدیک به تکراری بر پایه شباهت معنایی</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
            <span className="text-sm">اطمینان تشخیص</span>
            <Badge>{scoreLabel(data.duplicates.confidence)}</Badge>
          </div>
          <IdCollection title="تکراری قطعی" ids={data.duplicates.duplicates} />
          <IdCollection title="نزدیک به تکراری" ids={data.duplicates.nearDuplicates} />
        </CardContent>
      </Card>
    </div>
  );
}

function RelationList({
  title,
  icon: Icon,
  empty,
  items,
  onInspect,
}: {
  title: string;
  icon: typeof Network;
  empty: string;
  items: Array<{ id: string; title: string; meta: string }>;
  onInspect: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-5 text-blue-600" />
          {title}
          <Badge variant="secondary" className="ms-auto">
            {items.length.toLocaleString('fa-IR')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <KnowledgeQueryState kind="empty" compact title={empty} />
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto pe-1">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onInspect(item.id)}
                className="flex w-full items-center gap-3 rounded-xl border p-3 text-start transition hover:border-primary/30 hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
                </div>
                <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CountPanel({
  icon: Icon,
  label,
  count,
}: {
  icon: typeof Link2;
  label: string;
  count: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-700">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-black">{count.toLocaleString('fa-IR')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function IdCollection({ title, ids }: { title: string; ids: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted-foreground">{title}</p>
      {ids.length === 0 ? (
        <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
          موردی نیست
        </p>
      ) : (
        <div className="space-y-1.5">
          {ids.slice(0, 20).map((id) => (
            <p
              key={id}
              className="truncate rounded-lg bg-muted/50 px-3 py-2 font-mono text-xs"
              dir="ltr"
            >
              {id}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
