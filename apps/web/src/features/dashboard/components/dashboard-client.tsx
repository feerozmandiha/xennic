'use client';

import { useTranslations } from 'next-intl';
import { useQuery }        from '@tanstack/react-query';
import { useParams }       from 'next/navigation';
import {
  FolderKanban, Zap, HardDrive, CreditCard,
  TrendingUp, Clock, ArrowUpRight, BarChart3,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge }    from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';
import { usePlan } from '@/features/subscription/hooks/use-plan';

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ title, value, sub, icon: Icon, colorClass, href, loading, trend }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; colorClass: string; href?: string;
  loading?: boolean; trend?: 'up' | 'down' | null;
}) {
  if (loading) return <Skeleton className="h-28 rounded-[var(--radius-lg)]" />;

  return (
    <Card className={cn('card-hover group overflow-hidden relative')}>
      {/* Subtle gradient strip */}
      <div className={cn('absolute inset-x-0 top-0 h-0.5', colorClass, 'opacity-60')} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium truncate">{title}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            {sub && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{sub}</p>
            )}
          </div>
          <div className={cn(
            'w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0',
            colorClass,
          )}>
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

// ── Usage Progress Bar ─────────────────────────────────────────────────────────

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const color = pct >= 90 ? 'bg-[hsl(var(--destructive))]'
    : pct >= 70 ? 'bg-[hsl(var(--warning))]'
    : 'bg-[hsl(var(--primary))]';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-[hsl(var(--muted-foreground))]">{label}</span>
        <span className="font-medium tabular-nums">
          {used}{unlimited ? '' : ` / ${limit}`}
          {unlimited && ' (نامحدود)'}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1.5 rounded-full bg-[hsl(var(--secondary))] overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', color)}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Project Row ────────────────────────────────────────────────────────────────

function ProjectRow({ project, locale }: { project: any; locale: string }) {
  const STATUS: Record<string, { label: string; variant: string }> = {
    active:    { label: 'فعال',       variant: 'success' },
    completed: { label: 'تکمیل‌شده', variant: 'secondary' },
    archived:  { label: 'آرشیو',      variant: 'secondary' },
    cancelled: { label: 'لغو',        variant: 'destructive' },
  };
  const s = STATUS[project.status] ?? STATUS.active;

  return (
    <a
      href={`/${locale}/projects/${project.id}`}
      className="flex items-center gap-3 px-5 py-3 hover:bg-[hsl(var(--secondary)/0.4)] transition-colors group"
    >
      <div className="w-8 h-8 rounded-[var(--radius)] bg-[hsl(var(--primary)/0.08)] flex items-center justify-center shrink-0">
        <FolderKanban className="h-4 w-4 text-[hsl(var(--primary))]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{project.name}</p>
        {project.description && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{project.description}</p>
        )}
      </div>
      <Badge variant={s.variant as any} className="shrink-0 text-[10px]">{s.label}</Badge>
      <ArrowUpRight className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

// ── Calculation Row ────────────────────────────────────────────────────────────

const CALC_LABELS: Record<string, string> = {
  'BASIC-001': 'قانون اهم',       'BASIC-002': 'توان اکتیو',
  'CABLE-001': 'سایزینگ کابل',    'CABLE-002': 'افت ولتاژ',
  'TRF-001':   'سایزینگ ترانس',   'TRF-002':   'تلفات ترانس',
  'PQ-001':    'THD جریان',        'PQ-002':    'TDD',
  'PQ-003':    'K-Factor',         'PQ-004':    'آنالیز رزونانس',
  'PQ-005':    'فیلتر پسیو',       'PQ-006':    'سایزینگ APF',
};

function CalcRow({ calc }: { calc: any }) {
  const isOk = calc.status === 'completed';
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-[hsl(var(--border))] last:border-0">
      <div className={cn(
        'w-8 h-8 rounded-[var(--radius)] flex items-center justify-center shrink-0',
        isOk ? 'bg-[hsl(var(--success)/0.1)]' : 'bg-[hsl(var(--destructive)/0.1)]',
      )}>
        {isOk
          ? <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
          : <AlertCircle  className="h-3.5 w-3.5 text-[hsl(var(--destructive))]" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">
          {CALC_LABELS[calc.type] ?? calc.type}
        </p>
        <p className="text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(calc.createdAt).toLocaleString('fa-IR')}
        </p>
      </div>
      <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono shrink-0">
        {calc.durationMs ?? 0}ms
      </span>
    </div>
  );
}

// ── Quick Action ───────────────────────────────────────────────────────────────

function QuickAction({ icon, label, href, pro }: {
  icon: string; label: string; href: string; pro?: boolean;
}) {
  return (
    <a
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)]',
        'hover:bg-[hsl(var(--secondary))] transition-colors',
        'border border-[hsl(var(--border))] group',
      )}
    >
      <span className="text-base">{icon}</span>
      <span className="text-sm flex-1">{label}</span>
      {pro && (
        <Badge variant="warning" className="text-[9px] py-0 px-1.5">Pro</Badge>
      )}
      <ArrowUpRight className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function DashboardClient() {
  const t      = useTranslations('dashboard');
  const user   = useAuthStore(s => s.user);
  const wsId   = useAuthStore(s => s.workspaceId);
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['usage', wsId],
    queryFn:  () => apiClient.get<any>(`/workspaces/${wsId}/subscription/usage`),
    enabled:  !!wsId,
    retry: false,
    staleTime: 60_000,
  });

  const { data: storage } = useQuery({
    queryKey: ['storage-stats', wsId],
    queryFn:  () => apiClient.get<any>('/storage/stats'),
    enabled:  !!wsId,
    retry: false,
    staleTime: 60_000,
  });

  const { data: projects, isLoading: projLoading } = useQuery({
    queryKey: ['projects-dash', wsId],
    queryFn:  () => apiClient.get<any>('/projects?limit=5'),
    enabled:  !!wsId,
    retry: false,
  });

  const { data: calcHistory, isLoading: calcLoading } = useQuery({
    queryKey: ['calc-history-dash', wsId],
    queryFn:  () => apiClient.get<any>('/engineering/calculations?limit=5'),
    enabled:  !!wsId,
    retry: false,
  });

  const { planSlug, calcUsed, calcLimit, aiUsed, aiLimit } = usePlan();
  const planLabel = planSlug === 'free' ? 'رایگان' : planSlug === 'pro' ? 'حرفه‌ای' : 'سازمانی';

  const isLoading = usageLoading;

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">
            {t('welcome')}، <span className="gradient-primary">{user?.firstName}</span> 👋
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            پلتفرم مهندسی برق و انرژی‌های نو
          </p>
        </div>
        <a
          href={`/${locale}/engineering`}
          className={cn(
            'inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius)]',
            'bg-[hsl(var(--primary))] text-white text-sm font-medium',
            'hover:opacity-90 transition-opacity shrink-0',
            'shadow-[0_2px_8px_hsl(var(--primary)/0.35)]',
          )}
        >
          <Zap className="h-4 w-4" />
          {t('quickCalculate')}
        </a>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 animate-fade-in stagger-1">
        <StatCard
          title={t('totalProjects')}
          value={isLoading ? '—' : (projects?.meta?.total ?? 0)}
          icon={FolderKanban}
          colorClass="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
          href={`/${locale}/projects`}
          loading={projLoading}
        />
        <StatCard
          title={t('totalCalculations')}
          value={isLoading ? '—' : calcUsed}
          sub={calcLimit === -1 ? 'نامحدود' : `از ${calcLimit} این ماه`}
          icon={Zap}
          colorClass="bg-[hsl(142_76%_36%/0.1)] text-[hsl(142_76%_36%)]"
          href={`/${locale}/engineering`}
          loading={isLoading}
        />
        <StatCard
          title={t('storageUsed')}
          value={storage?.data?.totalSizeHuman ?? '—'}
          sub={`${storage?.data?.totalFiles ?? 0} فایل`}
          icon={HardDrive}
          colorClass="bg-[hsl(280_65%_60%/0.1)] text-[hsl(280_65%_60%)]"
          href={`/${locale}/storage`}
          loading={!storage && isLoading}
        />
        <StatCard
          title={t('planName')}
          value={isLoading ? '—' : planLabel}
          sub={planSlug === 'free' ? 'ارتقا به Pro' : '✓ فعال'}
          icon={CreditCard}
          colorClass="bg-[hsl(38_92%_50%/0.1)] text-[hsl(38_92%_50%)]"
          href={`/${locale}/settings`}
          loading={isLoading}
        />
      </div>

      {/* ── Content Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 animate-fade-in stagger-2">

        {/* Recent Projects */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              {t('recentProjects')}
            </CardTitle>
            <a href={`/${locale}/projects`} className="text-xs text-[hsl(var(--primary))] hover:underline font-medium">
              همه پروژه‌ها
            </a>
          </CardHeader>
          <CardContent className="p-0">
            {projLoading ? (
              <div className="p-4 space-y-2.5">
                {[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}
              </div>
            ) : projects?.data?.length ? (
              <ul className="divide-y divide-[hsl(var(--border))]">
                {projects.data.slice(0, 5).map((proj: any) => (
                  <li key={proj.id}>
                    <ProjectRow project={proj} locale={locale} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FolderKanban className="h-8 w-8 text-[hsl(var(--muted-foreground))] opacity-20 mb-3" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">هنوز پروژه‌ای ندارید</p>
                <a
                  href={`/${locale}/projects`}
                  className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius)] border border-[hsl(var(--border))] text-xs hover:bg-[hsl(var(--secondary))] transition-colors"
                >
                  ایجاد اولین پروژه
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">

          {/* Quick Calculations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                محاسبه سریع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {[
                { icon: '⚡', label: 'قانون اهم',       href: `/${locale}/engineering?calc=BASIC-001` },
                { icon: '🔌', label: 'سایزینگ کابل',   href: `/${locale}/engineering?calc=CABLE-001` },
                { icon: '🔋', label: 'ترانسفورماتور',   href: `/${locale}/engineering?calc=TRF-001` },
                { icon: '📊', label: 'THD کیفیت توان',  href: `/${locale}/engineering?calc=PQ-001`, pro: true },
              ].map(item => (
                <QuickAction key={item.href} {...item} />
              ))}
            </CardContent>
          </Card>

          {/* Usage */}
          {!isLoading && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  مصرف این ماه
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <UsageBar used={calcUsed} limit={calcLimit} label="محاسبات" />
                <UsageBar used={aiUsed}   limit={aiLimit}   label="درخواست‌های AI" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Calculations */}
      {!calcLoading && (calcHistory?.data?.length ?? 0) > 0 && (
        <Card className="animate-fade-in stagger-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              آخرین محاسبات
            </CardTitle>
            <a href={`/${locale}/engineering`} className="text-xs text-[hsl(var(--primary))] hover:underline font-medium">
              مشاهده همه
            </a>
          </CardHeader>
          <CardContent className="p-0">
            <div>
              {calcHistory.data.map((calc: any) => (
                <CalcRow key={calc.id} calc={calc} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Banner */}
      {!isLoading && planSlug === 'free' && (
        <Card className="border-[hsl(var(--warning)/0.35)] bg-gradient-to-r from-[hsl(var(--warning)/0.06)] to-[hsl(var(--primary)/0.04)] animate-fade-in stagger-4">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[hsl(var(--warning)/0.15)] flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t('upgradePrompt')}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                  محاسبات نامحدود · کیفیت توان IEEE 519 · هوش مصنوعی مهندسی
                </p>
              </div>
            </div>
            <a
              href={`/${locale}/billing/checkout?plan=pro`}
              className={cn(
                'inline-flex items-center gap-2 h-9 px-5 rounded-[var(--radius)]',
                'bg-[hsl(var(--primary))] text-white text-sm font-semibold',
                'hover:opacity-90 transition-opacity shrink-0 whitespace-nowrap',
              )}
            >
              ارتقا به Pro ↑
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
