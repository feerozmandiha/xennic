'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Network, Search, Zap, BookOpen, Cpu, Shield, Layers, Loader2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { graphApi, GraphNode, GraphEdge } from '@/features/knowledge/lib/graph-api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const NODE_TYPE_ICON: Record<string, any> = {
  knowledge: BookOpen,
  document: FileTextIcon,
  standard: Shield,
  equipment: Cpu,
  concept: Layers,
  calculation: Zap,
};

function FileTextIcon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export function KnowledgeGraphView() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [search, setSearch] = useState('');

  const { data: nodesData, isLoading } = useQuery({
    queryKey: ['graph-nodes', search],
    queryFn: () => graphApi.listNodes(30).then((r) => r.data as GraphNode[]),
  });

  const { data: neighborsData, isLoading: neighborsLoading } = useQuery({
    queryKey: ['graph-neighbors', selectedNode?.id],
    queryFn: () =>
      selectedNode ? graphApi.getNeighbors(selectedNode.id).then((r) => r.data) : null,
    enabled: !!selectedNode,
  });

  const nodes = (nodesData ?? []).filter(
    (n) => !search || n.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-blue-500/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Network className="h-5 w-5 text-violet-600" /> گراف دانش (Knowledge Graph)
            </h2>
            <p className="text-xs text-muted-foreground mt-2 max-w-2xl leading-relaxed">
              بر اساس ماژول <code>knowledge-intelligence</code> — گره‌ها: مقالات، استانداردها،
              تجهیزات، مفاهیم. یال‌ها: وابستگی، استناد، تضاد، تشابه. این گراف با رویداد{' '}
              <code>DocumentPublished</code> به صورت خودکار پر می‌شود.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            <Zap className="h-3 w-3 mr-1" /> Beta
          </Badge>
        </div>

        <div className="mt-4 relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی گره: مثلا کابل، IEC 60364..."
            className="w-full h-10 pr-10 pl-3 rounded-xl border bg-background/80 text-sm outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">گره‌ها ({nodes.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
              ))
            ) : nodes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                گره‌ای یافت نشد — ابتدا مقاله منتشر کنید تا گراف پر شود
              </p>
            ) : (
              nodes.map((node) => {
                const Icon =
                  NODE_TYPE_ICON[node.type] ?? NODE_TYPE_ICON[node.entity_type] ?? BookOpen;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`w-full text-right p-3 rounded-xl border text-xs transition-colors flex items-start gap-3 ${selectedNode?.id === node.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-secondary'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedNode?.id === node.id ? 'bg-white/20' : 'bg-secondary'}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{node.label}</p>
                      <p className="text-[10px] opacity-70 truncate">
                        {node.entity_type} • {node.type}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {selectedNode ? (
                  <>
                    <Eye className="h-4 w-4" /> جزئیات گره: {selectedNode.label}
                  </>
                ) : (
                  'یک گره را انتخاب کنید'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedNode ? (
                <div className="py-12 text-center">
                  <Network className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-3" />
                  <p className="text-xs text-muted-foreground">
                    از لیست سمت راست یک گره انتخاب کنید تا همسایه‌ها و مسیرها را ببینید
                  </p>
                </div>
              ) : neighborsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border p-3">
                      <p className="text-[10px] text-muted-foreground">شناسه</p>
                      <p className="font-mono text-[11px] truncate">{selectedNode.id}</p>
                    </div>
                    <div className="rounded-xl border p-3">
                      <p className="text-[10px] text-muted-foreground">نوع</p>
                      <p>
                        {selectedNode.entity_type} / {selectedNode.type}
                      </p>
                    </div>
                    <div className="rounded-xl border p-3 col-span-2">
                      <p className="text-[10px] text-muted-foreground">ویژگی‌ها</p>
                      <pre className="text-[10px] mt-1 bg-muted/50 p-2 rounded-lg overflow-x-auto">
                        {JSON.stringify(selectedNode.properties ?? {}, null, 2).slice(0, 500)}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold mb-2">
                      همسایه‌ها ({neighborsData?.nodes?.length ?? 0} گره،{' '}
                      {neighborsData?.edges?.length ?? 0} یال)
                    </h4>
                    {neighborsData?.nodes && neighborsData.nodes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {neighborsData.nodes.slice(0, 10).map((n: GraphNode) => (
                          <div key={n.id} className="p-2 rounded-xl border bg-card text-xs">
                            <p className="font-medium truncate">{n.label}</p>
                            <p className="text-[10px] text-muted-foreground">{n.entity_type}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">همسایه‌ای یافت نشد</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/${locale}/knowledge/${(selectedNode.properties as any)?.slug ?? selectedNode.entity_id}`}
                      className="h-8 px-3 rounded-lg border bg-card hover:bg-secondary text-xs flex items-center gap-1"
                    >
                      <BookOpen className="h-3.5 w-3.5" /> مشاهده مقاله
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setSelectedNode(null)}
                    >
                      بستن
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4 text-xs text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground mb-1">چطور گراف پر می‌شود؟</p>
              <ol className="list-decimal pr-5 space-y-1">
                <li>
                  سند در Knowledge Factory آپلود می‌شود → <code>DocumentUploaded</code>
                </li>
                <li>
                  پس از publish → رویداد <code>DocumentPublished</code> به outbox می‌رود
                </li>
                <li>
                  <code>OutboxRelayService</code> هر ۵ ثانیه آن را به <code>SemanticEventBus</code>{' '}
                  می‌دهد
                </li>
                <li>
                  <code>DocumentPublishedHandler</code> گره گراف + متریک‌ها (confidence, freshness)
                  می‌سازد
                </li>
                <li>
                  گراف از طریق <code>GraphTraversalService</code> قابل کاوش است
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
