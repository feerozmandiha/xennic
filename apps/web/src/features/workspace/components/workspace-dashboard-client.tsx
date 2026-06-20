'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2, Users, FolderKanban, Zap, HardDrive,
  ChevronRight, Plus, Settings, ArrowUpRight, Clock,
  UserPlus, BarChart3, TrendingUp, Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';

// ── Stat Card ──

function StatCard({ title, value, sub, icon: Icon, colorClass, loading, href }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; colorClass: string; loading?: boolean; href?: string;
}) {
  if (loading) return <Skeleton className="h-28 rounded-[var(--radius-lg)]" />;

  return (
    <Card className="group overflow-hidden relative card-hover">
      <div className={cn('absolute inset-x-0 top-0 h-0.5', colorClass, 'opacity-60')} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium truncate">{title}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            {sub && <p className="text-xs text-[hsl(var(--muted-foreground))]">{sub}</p>}
          </div>
          <div className={cn('w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0', colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {href && (
          <div className="mt-3 pt-3 border-t border-[hsl(var(--border))]">
            <a href={href} className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline font-medium">
              مشاهده <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Component ──

export function WorkspaceDashboardClient() {
  const wsId   = useAuthStore(s => s.workspaceId);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  // ── Single aggregated dashboard query ──

  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['workspace-dashboard', wsId],
    queryFn:  () => apiClient.get<any>(`/workspaces/${wsId}/dashboard`),
    enabled:  !!wsId,
    retry: false,
  });

  const d       = dashData?.data;
  const ws      = d?.workspace;
  const stats   = d?.stats;
  const members = stats?.members?.items ?? [];
  const projects = stats?.projects?.items ?? [];
  const memberCount = stats?.members?.total ?? 0;
  const projectCount = stats?.projects?.total ?? 0;
  const calcCount = stats?.calculations?.used ?? 0;
  const calcLimit = stats?.calculations?.limit;
  const storageBytes = Number(stats?.storage?.totalSizeBytes ?? 0);
  const storageUsed = storageBytes > 0
    ? (storageBytes / (1024 * 1024 * 1024)).toFixed(1)
    : '0';

  const loadAll = dashLoading;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <PageHeader
        title={ws?.name ?? 'Workspace'}
        description={ws?.code ? `کد: ${ws.code}` : undefined}
        badge={ws && <Badge variant="success" className="text-[10px]">فعال</Badge>}
        action={
          <a
            href={`/${locale}/settings`}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius)] border border-[hsl(var(--border))] text-xs hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            تنظیمات
          </a>
        }
      />

      {/* ── Members Bar ── */}
      {!loadAll && memberCount > 0 && (
        <div className="flex items-center gap-2 -mt-4">
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((m: any) => (
              <div
                key={m.id}
                className="w-7 h-7 rounded-full bg-[hsl(var(--secondary))] border-2 border-[hsl(var(--background))] flex items-center justify-center"
                title={m.userId}
              >
                <span className="text-[9px] font-bold">{m.userId?.slice(0, 2).toUpperCase()}</span>
              </div>
            ))}
            {memberCount > 5 && (
              <div className="w-7 h-7 rounded-full bg-[hsl(var(--muted)/0.5)] border-2 border-[hsl(var(--background))] flex items-center justify-center">
                <span className="text-[9px] font-medium text-[hsl(var(--muted-foreground))]">+{memberCount - 5}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">{memberCount} عضو</span>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="اعضا"
          value={memberCount}
          icon={Users}
          colorClass="bg-blue-500/10 text-blue-600"
          loading={loadAll}
          href={`/${locale}/settings?tab=workspace`}
        />
        <StatCard
          title="پروژه‌ها"
          value={projectCount}
          icon={FolderKanban}
          colorClass="bg-emerald-500/10 text-emerald-600"
          loading={loadAll}
          href={`/${locale}/projects`}
        />
        <StatCard
          title="محاسبات"
          value={calcCount}
          sub={calcLimit && calcLimit !== -1 ? `از ${calcLimit} مجاز` : undefined}
          icon={Zap}
          colorClass="bg-amber-500/10 text-amber-600"
          loading={loadAll}
          href={`/${locale}/engineering`}
        />
        <StatCard
          title="فضای ذخیره‌سازی"
          value={`${storageUsed} GB`}
          icon={HardDrive}
          colorClass="bg-purple-500/10 text-purple-600"
          loading={loadAll}
          href={`/${locale}/storage`}
        />
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Projects */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              پروژه‌های اخیر
            </CardTitle>
            <a
              href={`/${locale}/projects`}
              className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
            >
              همه <ChevronRight className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent className="p-0">
            {loadAll ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center">
                <FolderKanban className="h-8 w-8 mx-auto text-[hsl(var(--muted-foreground)/0.4)] mb-2" />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">هنوز پروژه‌ای ایجاد نشده</p>
                <a
                  href={`/${locale}/projects/new`}
                  className="inline-flex items-center gap-1 mt-3 text-xs text-[hsl(var(--primary))] hover:underline"
                >
                  <Plus className="h-3 w-3" /> ایجاد پروژه
                </a>
              </div>
            ) : (
              <ul className="divide-y divide-[hsl(var(--border))]">
                {projects.slice(0, 5).map((p: any) => (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3 group hover:bg-[hsl(var(--secondary)/0.3)] transition-colors">
                    <div className="w-8 h-8 rounded-[var(--radius)] bg-[hsl(var(--primary)/0.08)] flex items-center justify-center shrink-0">
                      <FolderKanban className="h-4 w-4 text-[hsl(var(--primary))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        {p.status === 'active' ? 'فعال' : p.status}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground)/0.4)] shrink-0" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Members */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              اعضای اخیر
            </CardTitle>
            <a
              href={`/${locale}/settings?tab=workspace`}
              className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
            >
              مدیریت <ChevronRight className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent className="p-0">
            {loadAll ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : members.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-8 w-8 mx-auto text-[hsl(var(--muted-foreground)/0.4)] mb-2" />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">هیچ عضوی وجود ندارد</p>
              </div>
            ) : (
              <ul className="divide-y divide-[hsl(var(--border))]">
                {members.slice(0, 5).map((m: any) => (
                  <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold">{m.userId?.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.userId}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        {m.role === 'OWNER' ? 'مالک' : m.role === 'ADMIN' ? 'ادمین' : 'عضو'}
                      </p>
                    </div>
                    <Badge variant={m.role === 'OWNER' ? 'default' : m.role === 'ADMIN' ? 'secondary' : 'outline'} className="text-[10px]">
                      {m.role}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── Quick Actions ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            اقدامات سریع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <a
              href={`/${locale}/projects/new`}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-xs font-medium hover:opacity-90 transition-all"
            >
              <Plus className="h-4 w-4" />
              پروژه جدید
            </a>
            <a
              href={`/${locale}/engineering`}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] text-xs font-medium hover:bg-[hsl(var(--primary)/0.12)] transition-colors"
            >
              <Zap className="h-4 w-4" />
              محاسبات مهندسی
            </a>
            <a
              href={`/${locale}/settings?tab=workspace`}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius)] border border-[hsl(var(--border))] text-xs hover:bg-[hsl(var(--secondary))] transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              دعوت عضو
            </a>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
