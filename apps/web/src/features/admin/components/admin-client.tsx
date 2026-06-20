'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, Users, Building2, CreditCard,
  MessageSquare, BookOpen, Bell, Settings, Shield,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
  Search, Loader2, Send, Edit3,
  LogOut, Trash2,
  ToggleLeft, ToggleRight, Plus,
  Zap, Bot, Tags, Hash, Pencil, X, FolderTree,
  Key, Webhook, Flag,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge }     from '@/components/ui/badge';
import { useToast }  from '@/stores/toast.store';
import { apiClient } from '@/lib/api/client';
import { cn }        from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// types
// ─────────────────────────────────────────────────────────────
interface DashboardStats {
  users:         { total: number; new_30d: number; active: number; admins: number };
  workspaces:    { total: number; new_30d: number };
  calculations:  { total: number; new_30d: number; unique_types: number };
  consultations: { total: number; pending: number; answered: number };
  articles:      { total: number };
  revenue:       { total: number; monthly: number };
}

// ─────────────────────────────────────────────────────────────
// nav sections
// ─────────────────────────────────────────────────────────────
const SECTIONS = [
  { key: 'dashboard',      label: 'داشبورد',         icon: LayoutDashboard },
  { key: 'users',          label: 'کاربران',          icon: Users },
  { key: 'workspaces',     label: 'Workspace ها',     icon: Building2 },
  { key: 'plans',          label: 'پلن‌ها و تعرفه',   icon: CreditCard },
  { key: 'consultations',  label: 'تیکت‌ها',          icon: MessageSquare },
  { key: 'articles',       label: 'مقالات',           icon: BookOpen },
  { key: 'notifications',  label: 'اعلان‌ها',         icon: Bell },
  { key: 'settings',       label: 'تنظیمات',          icon: Settings },
  { key: 'taxonomy',       label: 'تاکسونومی',        icon: Tags },
  { key: 'api-keys',       label: 'کلید API',         icon: Key },
  { key: 'webhooks',       label: 'Webhook ها',       icon: Webhook },
  { key: 'feature-flags',  label: 'Feature Flag ها',  icon: Flag },
] as const;

type Section = typeof SECTIONS[number]['key'];

// ─────────────────────────────────────────────────────────────
// stat card
// ─────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon: Icon, color, trend }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: number;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{title}</p>
            <p className="text-2xl font-black">{typeof value === 'number' ? value.toLocaleString('fa-IR') : value}</p>
            {sub && <p className="text-xs text-[hsl(var(--muted-foreground))]">{sub}</p>}
          </div>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trend >= 0 ? 'text-green-600' : 'text-red-500')}>
            <TrendingUp className={cn('h-3 w-3', trend < 0 && 'rotate-180')} />
            {Math.abs(trend)} نفر جدید ۳۰ روز گذشته
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// dashboard section
// ─────────────────────────────────────────────────────────────
function DashboardSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn:  () => apiClient.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard'),
    refetchInterval: 30_000,
  });

  const s = data?.data;

  if (isLoading) return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-28 rounded-xl bg-[hsl(var(--secondary)/0.5)] animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="کاربران"        value={s?.users?.total ?? 0}        sub={`${s?.users?.active ?? 0} فعال`}          icon={Users}         color="bg-blue-500"   trend={s?.users?.new_30d} />
        <StatCard title="Workspace ها"   value={s?.workspaces?.total ?? 0}   sub={`${s?.workspaces?.new_30d ?? 0} ماه جاری`}icon={Building2}      color="bg-purple-500" />
        <StatCard title="محاسبات"        value={s?.calculations?.total ?? 0} sub={`${s?.calculations?.new_30d ?? 0} ماه جاری`}icon={Zap}          color="bg-orange-500" />
        <StatCard title="مشاوره‌ها"      value={s?.consultations?.total ?? 0} sub={`${s?.consultations?.pending ?? 0} در انتظار`} icon={MessageSquare} color="bg-yellow-500" />
        <StatCard title="درآمد ماهانه"   value={`${((s?.revenue?.monthly ?? 0)/1_000_000).toFixed(1)}M ریال`} sub="ماه جاری"  icon={CreditCard}    color="bg-green-500" />
        <StatCard title="مقالات"         value={s?.articles?.total ?? 0}     sub="منتشر شده"                               icon={BookOpen}       color="bg-teal-500" />
      </div>

      {s?.consultations?.pending ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              {s.consultations?.pending} تیکت در انتظار پاسخ
            </p>
            <p className="text-xs text-yellow-600">برای پاسخ به تیکت‌ها به بخش «تیکت‌ها» بروید</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// users section
// ─────────────────────────────────────────────────────────────
function UsersSection() {
  const toast = useToast();
  const qc    = useQueryClient();
  const [search,   setSearch]   = useState('');
  const [searchQ,  setSearchQ]  = useState('');
  const [page,     setPage]     = useState(1);
  const LIMIT = 20;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'users', searchQ, page],
    queryFn:  () => apiClient.get<any>(
      `/admin/users?limit=${LIMIT}&page=${page}&search=${encodeURIComponent(searchQ)}`
    ),
  });

  const users: any[] = data?.data ?? [];
  const total        = data?.meta?.total ?? 0;
  const totalPages   = Math.ceil(total / LIMIT);

  const updateUser = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiClient.patch(`/admin/users/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('کاربر آپدیت شد');
    },
    onError: () => toast.error('خطا در آپدیت'),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('کاربر حذف شد');
    },
    onError: () => toast.error('خطا در حذف'),
  });

  return (
    <div className="space-y-4">
      {/* search + filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setSearchQ(search); setPage(1); } }}
            placeholder="جستجو در ایمیل یا نام..."
            className="w-full h-9 pr-9 pl-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))]" />
        </div>
        <button onClick={() => { setSearchQ(search); setPage(1); }}
          className="h-9 px-4 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm hover:opacity-90">
          جستجو
        </button>
        {searchQ && (
          <button onClick={() => { setSearch(''); setSearchQ(''); setPage(1); }}
            className="h-9 px-3 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))]">
            ✕ پاک
          </button>
        )}
        <span className="flex items-center text-xs text-[hsl(var(--muted-foreground))] mr-auto">
          {isFetching && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
          {total.toLocaleString('fa-IR')} کاربر
        </span>
      </div>

      {/* table */}
      <div className="rounded-xl border border-[hsl(var(--border))] overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-[hsl(var(--secondary)/0.5)] sticky top-0">
            <tr>
              {['ایمیل', 'نام', 'Workspace', 'وضعیت', 'ادمین', 'عملیات'].map(h => (
                <th key={h} className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-4 py-3">
                    <div className="h-4 bg-[hsl(var(--secondary)/0.5)] rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))] text-sm">
                  کاربری یافت نشد
                </td>
              </tr>
            ) : users.map((u: any) => (
              <tr key={u.id} className="hover:bg-[hsl(var(--secondary)/0.3)] transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs">{u.email}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {u.first_name} {u.last_name}
                </td>
                <td className="px-4 py-3 text-center text-[hsl(var(--muted-foreground))] text-xs">
                  {u.workspace_count ?? 0}
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    u.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600',
                  )}>
                    {u.status === 'active' ? 'فعال' : 'معلق'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => updateUser.mutate({ id: u.id, body: { isAdmin: !u.is_admin } })}
                    disabled={updateUser.isPending}
                    title={u.is_admin ? 'کلیک کنید تا دسترسی ادمین حذف شود' : 'کلیک کنید تا ادمین شود'}
                    className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity disabled:opacity-40"
                  >
                    {u.is_admin
                      ? <ToggleRight className="h-5 w-5 text-[hsl(var(--primary))]" />
                      : <ToggleLeft  className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />}
                    <span className={u.is_admin ? 'text-[hsl(var(--primary))] font-medium' : 'text-[hsl(var(--muted-foreground))]'}>
                      {u.is_admin ? 'ادمین' : 'عادی'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateUser.mutate({
                        id:   u.id,
                        body: { status: u.status === 'active' ? 'suspended' : 'active' },
                      })}
                      disabled={updateUser.isPending}
                      className={cn(
                        'text-[10px] px-2 py-1 rounded border transition-colors disabled:opacity-40',
                        u.status === 'active'
                          ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50',
                      )}
                    >
                      {u.status === 'active' ? 'تعلیق' : 'فعال‌سازی'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`آیا از حذف ${u.email} مطمئن هستید؟`))
                          deleteUser.mutate(u.id);
                      }}
                      disabled={deleteUser.isPending}
                      className="text-[10px] px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="h-8 px-3 text-xs rounded border border-[hsl(var(--border))] disabled:opacity-40 hover:bg-[hsl(var(--secondary))]">
            ← قبلی
          </button>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            className="h-8 px-3 text-xs rounded border border-[hsl(var(--border))] disabled:opacity-40 hover:bg-[hsl(var(--secondary))]">
            بعدی →
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// workspaces section
// ─────────────────────────────────────────────────────────────
function WorkspacesSection() {
  const toast = useToast();
  const qc    = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'workspaces', search],
    queryFn:  () => apiClient.get<any>(`/admin/workspaces?limit=50&search=${encodeURIComponent(search)}`),
  });

  const workspaces: any[] = data?.data ?? [];
  const PLAN_SLUGS = ['free', 'starter', 'pro', 'enterprise'];

  const changePlan = useMutation({
    mutationFn: ({ id, planSlug }: { id: string; planSlug: string }) =>
      apiClient.patch(`/admin/workspaces/${id}/plan`, { planSlug }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'workspaces'] }); toast.success('پلن تغییر کرد'); },
    onError:   () => toast.error('خطا'),
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="جستجو..."
            className="w-full h-9 pr-9 pl-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))]" />
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--secondary)/0.5)]">
            <tr>
              {['نام', 'پلن فعلی', 'اعضا', 'محاسبات', 'تغییر پلن'].map(h => (
                <th key={h} className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-[hsl(var(--secondary)/0.5)] rounded animate-pulse" /></td></tr>
              ))
            ) : workspaces.map((ws: any) => (
              <tr key={ws.id} className="hover:bg-[hsl(var(--secondary)/0.3)]">
                <td className="px-4 py-3 font-medium">{ws.name}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    ws.plan_slug === 'enterprise' ? 'bg-purple-100 text-purple-700'
                    : ws.plan_slug === 'pro'      ? 'bg-blue-100 text-blue-700'
                    : ws.plan_slug === 'starter'  ? 'bg-green-100 text-green-700'
                    :                               'bg-gray-100 text-gray-600',
                  )}>
                    {ws.plan_slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{ws.member_count}</td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{Number(ws.calc_count ?? 0).toLocaleString('fa-IR')}</td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={ws.plan_slug}
                    onChange={e => changePlan.mutate({ id: ws.id, planSlug: e.target.value })}
                    className="h-7 px-2 text-xs rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none"
                  >
                    {PLAN_SLUGS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// plans section
// ─────────────────────────────────────────────────────────────
function PlansSection() {
  const toast = useToast();
  const qc    = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn:  () => apiClient.get<any>('/admin/plans'),
  });

  const plans: any[] = data?.data ?? [];

  const savePlan = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiClient.put(`/admin/plans/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'plans'] });
      toast.success('پلن ذخیره شد');
      setEditing(null);
    },
    onError: () => toast.error('خطا در ذخیره'),
  });

  const inputCls = 'w-full px-2 py-1 text-sm rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none focus:border-[hsl(var(--primary))]';

  return (
    <div className="space-y-4">
      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-[hsl(var(--secondary)/0.5)] animate-pulse" />
        ))
      ) : plans.map((plan: any) => (
        <Card key={plan.id} className={cn(editing === plan.id && 'border-[hsl(var(--primary)/0.4)]')}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold">{plan.name}</h3>
                  <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">{plan.slug}</span>
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold',
                    plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                    {plan.is_active ? 'فعال' : 'غیرفعال'}
                  </span>
                  {plan.subscriber_count > 0 && (
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{Number(plan.subscriber_count).toLocaleString('fa-IR')} مشترک</span>
                  )}
                </div>

                {editing === plan.id ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-0.5">قیمت ماهانه (ریال)</label>
                      <input type="number" className={inputCls}
                        value={editData.monthlyPrice ?? plan.monthly_price}
                        onChange={e => setEditData((d: any) => ({ ...d, monthlyPrice: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-0.5">قیمت سالانه (ریال)</label>
                      <input type="number" className={inputCls}
                        value={editData.yearlyPrice ?? plan.yearly_price}
                        onChange={e => setEditData((d: any) => ({ ...d, yearlyPrice: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-0.5">محاسبات/ماه (-1=نامحدود)</label>
                      <input type="number" className={inputCls}
                        value={editData.features?.calculations_month ?? plan.features?.calculations_month ?? 10}
                        onChange={e => setEditData((d: any) => ({
                          ...d, features: { ...(d.features ?? plan.features), calculations_month: Number(e.target.value) }
                        }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-0.5">AI requests/ماه</label>
                      <input type="number" className={inputCls}
                        value={editData.features?.ai_requests_month ?? plan.features?.ai_requests_month ?? 5}
                        onChange={e => setEditData((d: any) => ({
                          ...d, features: { ...(d.features ?? plan.features), ai_requests_month: Number(e.target.value) }
                        }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-0.5">پروژه‌ها (-1=نامحدود)</label>
                      <input type="number" className={inputCls}
                        value={editData.features?.projects ?? plan.features?.projects ?? 1}
                        onChange={e => setEditData((d: any) => ({
                          ...d, features: { ...(d.features ?? plan.features), projects: Number(e.target.value) }
                        }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-0.5">فضای ذخیره (GB)</label>
                      <input type="number" className={inputCls}
                        value={editData.features?.storage_gb ?? plan.features?.storage_gb ?? 1}
                        onChange={e => setEditData((d: any) => ({
                          ...d, features: { ...(d.features ?? plan.features), storage_gb: Number(e.target.value) }
                        }))} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                    <span>💰 {Number(plan.monthly_price).toLocaleString('fa-IR')} ریال/ماه</span>
                    <span>📊 {plan.features?.calculations_month === -1 ? 'نامحدود' : plan.features?.calculations_month} محاسبه</span>
                    <span>🤖 {plan.features?.ai_requests_month === -1 ? 'نامحدود' : plan.features?.ai_requests_month} AI</span>
                    <span>📁 {plan.features?.projects === -1 ? 'نامحدود' : plan.features?.projects} پروژه</span>
                    <span>💾 {plan.features?.storage_gb} GB</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {editing === plan.id ? (
                  <>
                    <button
                      onClick={() => savePlan.mutate({ id: plan.id, body: editData })}
                      disabled={savePlan.isPending}
                      className="h-8 px-3 text-xs rounded bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center gap-1"
                    >
                      {savePlan.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      ذخیره
                    </button>
                    <button onClick={() => { setEditing(null); setEditData({}); }}
                      className="h-8 px-3 text-xs rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]">
                      لغو
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setEditing(plan.id); setEditData({}); }}
                    className="h-8 px-3 text-xs rounded border border-[hsl(var(--border))] flex items-center gap-1 hover:bg-[hsl(var(--secondary))]">
                    <Edit3 className="h-3 w-3" />ویرایش
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// consultations (tickets) section
// ─────────────────────────────────────────────────────────────
function ConsultationsSection() {
  const toast = useToast();
  const qc    = useQueryClient();
  const [statusFilter, setStatus] = useState('');
  const [selected,     setSelected] = useState<any>(null);
  const [replyText,    setReply]    = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'consultations', statusFilter],
    queryFn:  () => apiClient.get<any>(`/admin/consultations?limit=100&status=${statusFilter}`),
    refetchInterval: 15_000,
  });

  const tickets: any[] = data?.data ?? [];

  const reply = useMutation({
    mutationFn: () => apiClient.post(`/admin/consultations/${selected.id}/reply`, { content: replyText }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'consultations'] });
      toast.success('پاسخ ارسال شد');
      setReply('');
      setSelected((prev: any) => prev ? { ...prev, status: 'answered' } : null);
    },
    onError: () => toast.error('خطا'),
  });

  const close = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/consultations/${id}/status`, { status: 'closed' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'consultations'] }); toast.success('تیکت بسته شد'); setSelected(null); },
  });

  const PRIORITY_COLOR: Record<string, string> = {
    urgent: 'text-red-600 font-bold', high: 'text-orange-500', normal: 'text-blue-500', low: 'text-gray-400',
  };

  if (selected) {
    return (
      <div className="space-y-4 max-w-3xl">
        <button onClick={() => setSelected(null)}
          className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center gap-1">
          ← بازگشت
        </button>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <h2 className="font-bold text-base">{selected.title}</h2>
              <div className="flex gap-2">
                <span className={cn('text-xs font-semibold', PRIORITY_COLOR[selected.priority])}>
                  {selected.priority}
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{selected.status}</span>
              </div>
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] space-y-1">
              <p>کاربر: {selected.user_email}</p>
              <p>Workspace: {selected.workspace_name}</p>
              <p>دسته: {selected.category}</p>
              <p>تاریخ: {new Date(selected.created_at).toLocaleString('fa-IR')}</p>
            </div>
            <p className="text-sm leading-relaxed bg-[hsl(var(--secondary)/0.3)] p-3 rounded-lg whitespace-pre-wrap">
              {selected.description}
            </p>
          </CardContent>
        </Card>

        {selected.status !== 'closed' && (
          <Card className="border-[hsl(var(--primary)/0.3)]">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-[hsl(var(--primary))]" />
                پاسخ ادمین
              </p>
              <textarea value={replyText} onChange={e => setReply(e.target.value)} rows={5}
                placeholder="پاسخ تخصصی خود را بنویسید..."
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))] resize-none" />
              <div className="flex justify-between">
                <button onClick={() => close.mutate(selected.id)}
                  className="h-8 px-3 text-xs rounded border border-red-200 text-red-500 hover:bg-red-50">
                  بستن تیکت
                </button>
                <button onClick={() => reply.mutate()} disabled={reply.isPending || !replyText.trim()}
                  className="h-8 px-5 text-xs rounded flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50">
                  {reply.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  ارسال پاسخ
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {[
          { key: '',         label: 'همه' },
          { key: 'pending',  label: '⏳ در انتظار' },
          { key: 'open',     label: '🔵 باز' },
          { key: 'answered', label: '✅ پاسخ داده شد' },
          { key: 'closed',   label: '🔒 بسته' },
        ].map(s => (
          <button key={s.key} onClick={() => setStatus(s.key)}
            className={cn('h-7 px-3 text-xs rounded-full border transition-all',
              statusFilter === s.key
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]')}>
            {s.label}
          </button>
        ))}
        <Badge variant="secondary" className="mr-auto">{data?.meta?.total ?? tickets.length} تیکت</Badge>
      </div>

      <div className="space-y-2">
        {isLoading ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-[hsl(var(--secondary)/0.5)] animate-pulse" />
        )) : tickets.map((t: any) => (
          <Card key={t.id} className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelected(t)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-[10px] font-bold', PRIORITY_COLOR[t.priority])}>{t.priority?.toUpperCase()}</span>
                    <span className="text-xs font-semibold truncate">{t.title}</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{t.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                    <span>{t.user_email}</span>
                    <span>•</span>
                    <span>{t.workspace_name}</span>
                    <span>•</span>
                    <span>{Number(t.reply_count ?? 0)} پاسخ</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    t.status === 'pending'  ? 'bg-yellow-100 text-yellow-700'
                    : t.status === 'answered' ? 'bg-green-100 text-green-700'
                    : t.status === 'closed'   ? 'bg-gray-100 text-gray-600'
                    :                          'bg-blue-100 text-blue-700')}>
                    {t.status}
                  </span>
                  <span className="text-[9px] text-[hsl(var(--muted-foreground))]">
                    {new Date(t.created_at).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// notifications section
// ─────────────────────────────────────────────────────────────
function NotificationsSection() {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', body: '', type: 'info', targetPlan: '' });

  const send = useMutation({
    mutationFn: () => apiClient.post<{ success: boolean; sent: number }>('/admin/notifications/broadcast', form),
    onSuccess: (res) => {
      toast.success(`اعلان برای ${res?.sent ?? 0} workspace ارسال شد`);
      setForm({ title: '', body: '', type: 'info', targetPlan: '' });
    },
    onError: () => toast.error('خطا'),
  });

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))]';

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-[hsl(var(--primary))]">
            <Bell className="h-4 w-4" />ارسال اعلان سراسری
          </CardTitle>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            به همه workspace ها یا یک پلن خاص اعلان ارسال کنید
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1">عنوان اعلان *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="مثال: بروزرسانی سیستم در ساعت ۲۴" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">متن اعلان *</label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              rows={4} placeholder="جزئیات اعلان را بنویسید..."
              className={cn(inputCls, 'resize-none')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1">نوع</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputCls}>
                <option value="info">📢 اطلاعیه</option>
                <option value="success">✅ موفقیت</option>
                <option value="warning">⚠️ هشدار</option>
                <option value="error">🔴 خطا</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">فیلتر پلن (اختیاری)</label>
              <select value={form.targetPlan} onChange={e => setForm(f => ({ ...f, targetPlan: e.target.value }))} className={inputCls}>
                <option value="">همه پلن‌ها</option>
                <option value="free">رایگان</option>
                <option value="starter">استارتر</option>
                <option value="pro">حرفه‌ای</option>
                <option value="enterprise">سازمانی</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => send.mutate()}
              disabled={send.isPending || !form.title || !form.body}
              className="h-9 px-5 text-sm rounded-lg flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
            >
              {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
              {send.isPending ? 'در حال ارسال...' : 'ارسال اعلان'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// settings section
// ─────────────────────────────────────────────────────────────
function SettingsSection() {
  const toast = useToast();
  const qc    = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  const { data } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn:  () => apiClient.get<{ success: boolean; data: Record<string, string> }>('/admin/settings'),
  });

  // sync settings into form on first load
  if (!loaded && data?.data && Object.keys(data.data).length > 0) {
    setForm(data.data);
    setLoaded(true);
  }

  const save = useMutation({
    mutationFn: () => apiClient.put<any>('/admin/settings', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'settings'] }); toast.success('تنظیمات ذخیره شد'); },
    onError: () => toast.error('خطا'),
  });

  const settings = data?.data ?? {};
  const merged   = { ...settings, ...form };

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))]';

  const FIELDS = [
    { key: 'platform_name',         label: 'نام پلتفرم',             hint: 'Xennic' },
    { key: 'support_email',         label: 'ایمیل پشتیبانی',         hint: 'support@xennic.ir' },
    { key: 'max_file_size_mb',      label: 'حداکثر حجم فایل (MB)',    hint: '10' },
    { key: 'free_calculations_day', label: 'محاسبات رایگان/روز',      hint: '5' },
    { key: 'ai_model',              label: 'مدل AI پیش‌فرض',          hint: 'llama-3.3-70b-versatile' },
    { key: 'groq_api_key',          label: 'Groq API Key',             hint: 'gsk_...' },
  ];

  const TOGGLES = [
    { key: 'registration_open', label: 'ثبت‌نام کاربر جدید' },
    { key: 'maintenance_mode',  label: 'حالت تعمیر و نگهداری' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />تنظیمات سیستم
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium block mb-1">{f.label}</label>
              <input
                type={f.key.includes('key') ? 'password' : 'text'}
                value={merged[f.key] ?? ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.hint}
                className={inputCls}
              />
            </div>
          ))}

          <div className="pt-2 border-t border-[hsl(var(--border)/0.5)] space-y-3">
            {TOGGLES.map(t => (
              <div key={t.key} className="flex items-center justify-between">
                <span className="text-sm">{t.label}</span>
                <button
                  onClick={() => setForm(p => ({ ...p, [t.key]: p[t.key] === 'true' ? 'false' : 'true' }))}
                  className="flex items-center gap-1.5 text-xs"
                >
                  {(merged[t.key] ?? settings[t.key]) === 'true'
                    ? <><ToggleRight className="h-6 w-6 text-[hsl(var(--primary))]" />فعال</>
                    : <><ToggleLeft  className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />غیرفعال</>}
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => save.mutate()} disabled={save.isPending}
              className="h-9 px-5 text-sm rounded-lg flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              ذخیره تنظیمات
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// articles admin section
// ─────────────────────────────────────────────────────────────
function ArticlesAdminSection() {
  const toast = useToast();
  const qc    = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', titleEn: '', summary: '', content: '',
    category: 'general', tags: '', status: 'draft', readMinutes: '5',
  });

  const { data } = useQuery({
    queryKey: ['admin', 'articles-list'],
    queryFn:  () => apiClient.get<any>('/articles?limit=50&status=all'),
  });

  const create = useMutation({
    mutationFn: () => apiClient.post<any>('/admin/articles', {
      ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      readMinutes: Number(form.readMinutes),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'articles-list'] });
      toast.success('مقاله ایجاد شد');
      setShowForm(false);
      setForm({ title:'',titleEn:'',summary:'',content:'',category:'general',tags:'',status:'draft',readMinutes:'5' });
    },
    onError: () => toast.error('خطا'),
  });

  const articles: any[] = data?.data ?? [];
  const inputCls = 'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))]';

  if (showForm) return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">مقاله جدید</h3>
        <button onClick={() => setShowForm(false)} className="text-sm text-[hsl(var(--muted-foreground))]">← بازگشت</button>
      </div>
      <div className="space-y-3">
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="عنوان فارسی *" className={inputCls} />
        <input value={form.titleEn} onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))}
          placeholder="عنوان انگلیسی" className={inputCls} />
        <textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
          rows={2} placeholder="خلاصه مقاله *" className={cn(inputCls, 'resize-none')} />
        <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          rows={15} placeholder="محتوای مقاله (Markdown) *" className={cn(inputCls, 'resize-none font-mono text-xs')} />
        <div className="grid grid-cols-3 gap-3">
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
            {['general','cable','transformer','protection','power_quality','grounding','renewable','motor'].map(c =>
              <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
            <option value="draft">پیش‌نویس</option>
            <option value="published">منتشر شده</option>
          </select>
          <input value={form.readMinutes} onChange={e => setForm(f => ({ ...f, readMinutes: e.target.value }))}
            type="number" placeholder="زمان مطالعه (دقیقه)" className={inputCls} />
        </div>
        <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          placeholder="تگ‌ها با کاما: کابل، IEC 60364، سایزینگ" className={inputCls} />
        <div className="flex justify-end gap-2">
          <button onClick={() => setShowForm(false)} className="h-8 px-4 text-xs rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]">لغو</button>
          <button onClick={() => create.mutate()} disabled={create.isPending || !form.title || !form.content}
            className="h-8 px-5 text-xs rounded flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] disabled:opacity-50">
            {create.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            ذخیره مقاله
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm hover:opacity-90">
          <Plus className="h-4 w-4" />مقاله جدید
        </button>
      </div>
      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--secondary)/0.5)]">
            <tr>{['عنوان','دسته','وضعیت','بازدید','لایک'].map(h => (
              <th key={h} className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
            {articles.map((a: any) => (
              <tr key={a.id} className="hover:bg-[hsl(var(--secondary)/0.3)]">
                <td className="px-4 py-3 font-medium max-w-xs truncate">{a.title}</td>
                <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">{a.category}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold',
                    a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                    {a.status === 'published' ? 'منتشر' : 'پیش‌نویس'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">{a.viewCount ?? 0}</td>
                <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">{a.likeCount ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// taxonomy section
// ─────────────────────────────────────────────────────────────
function TaxonomySection() {
  const toast = useToast();
  const qc    = useQueryClient();
  const [type, setType] = useState('category');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const TYPES = [
    { key: 'category',   label: 'دسته‌بندی', icon: FolderTree },
    { key: 'topic',      label: 'موضوع',     icon: Hash },
    { key: 'tag',        label: 'برچسب',     icon: Tags },
    { key: 'discipline', label: 'تخصص',      icon: BookOpen },
    { key: 'audience',   label: 'مخاطب',     icon: Users },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'taxonomy', type, search],
    queryFn:  () => apiClient.get<{ success: boolean; data: any[] }>(
      `/admin/taxonomy/${type}${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  });

  const items: any[] = data?.data ?? [];

  const createItem = useMutation({
    mutationFn: (body: any) => apiClient.post(`/admin/taxonomy/${type}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'taxonomy', type] });
      toast.success('آیتم ایجاد شد');
      setEditing(null);
      setForm({});
    },
    onError: () => toast.error('خطا در ایجاد'),
  });

  const updateItem = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiClient.patch(`/admin/taxonomy/${type}/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'taxonomy', type] });
      toast.success('آیتم بروزرسانی شد');
      setEditing(null);
      setForm({});
    },
    onError: () => toast.error('خطا در بروزرسانی'),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/taxonomy/${type}/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'taxonomy', type] });
      toast.success('آیتم حذف شد');
    },
    onError: () => toast.error('خطا در حذف'),
  });

  const startEdit = (item: any) => {
    setEditing(item.id);
    setForm({ ...item });
  };

  const startCreate = () => {
    setEditing('__new__');
    setForm({ slug: '', name: '', name_en: '', icon: '', is_active: true });
  };

  const save = () => {
    if (editing === '__new__') {
      createItem.mutate(form);
    } else {
      updateItem.mutate({ id: editing!, body: form });
    }
  };

  const currentType = TYPES.find(t => t.key === type)!;
  const inputCls = 'w-full px-2.5 py-1.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none focus:border-[hsl(var(--primary))] transition-colors';

  return (
    <div className="space-y-4">
      {/* type tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {TYPES.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => { setType(t.key); setEditing(null); setForm({}); }}
              className={cn(
                'flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all',
                type === t.key
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--secondary)/0.5)] text-[hsl(var(--foreground)/0.7)] hover:bg-[hsl(var(--secondary))]',
              )}>
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* search + add */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`جستجو در ${currentType.label}...`}
            className="w-full h-9 pr-9 pl-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))]" />
        </div>
        <button onClick={startCreate}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm hover:opacity-90">
          <Plus className="h-4 w-4" />
          جدید
        </button>
      </div>

      {/* edit/create form */}
      {editing && (
        <div className="rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.03)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Pencil className="h-4 w-4 text-[hsl(var(--primary))]" />
              {editing === '__new__' ? `ایجاد ${currentType.label} جدید` : `ویرایش ${currentType.label}`}
            </h3>
            <button onClick={() => { setEditing(null); setForm({}); }}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[hsl(var(--secondary))]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">Slug *</label>
              <input value={form.slug ?? ''} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className={inputCls} placeholder="power-systems" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">نام فارسی *</label>
              <input value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputCls} placeholder="سیستم‌های قدرت" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">نام انگلیسی</label>
              <input value={form.name_en ?? ''} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                className={inputCls} placeholder="Power Systems" />
            </div>
            {type === 'category' && (
              <>
                <div>
                  <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">آیکون</label>
                  <input value={form.icon ?? ''} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    className={inputCls} placeholder="zap" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">رنگ</label>
                  <input value={form.color ?? ''} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    className={inputCls} placeholder="#3B82F6" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">ترتیب</label>
                  <input type="number" value={form.sort_order ?? 0} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                    className={inputCls} />
                </div>
              </>
            )}
            {(type === 'topic' || type === 'discipline') && (
              <div>
                <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">آیکون</label>
                <input value={form.icon ?? ''} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  className={inputCls} placeholder="zap" />
              </div>
            )}
            {type === 'audience' && (
              <div>
                <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">توضیحات</label>
                <input value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={inputCls} placeholder="توضیحات مختصر..." />
              </div>
            )}
            <div>
              <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">فعال</label>
              <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                className="flex items-center gap-1.5 text-sm mt-1">
                {form.is_active !== false
                  ? <><ToggleRight className="h-5 w-5 text-green-600" /> فعال</>
                  : <><ToggleLeft className="h-5 w-5 text-[hsl(var(--muted-foreground))]" /> غیرفعال</>}
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => { setEditing(null); setForm({}); }}
              className="h-8 px-4 text-xs rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]">
              لغو
            </button>
            <button onClick={save}
              disabled={(createItem.isPending || updateItem.isPending) || !form.name || !form.slug}
              className="h-8 px-5 text-xs rounded-lg flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50">
              {(createItem.isPending || updateItem.isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editing === '__new__' ? 'ایجاد' : 'ذخیره'}
            </button>
          </div>
        </div>
      )}

      {/* items list */}
      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--secondary)/0.5)]">
            <tr>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3 w-12">#</th>
              {type === 'category' && (
                <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">آیکون/رنگ</th>
              )}
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">نام فارسی</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">نام انگلیسی</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">وضعیت</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={type === 'category' ? 6 : 5} className="px-4 py-3">
                    <div className="h-4 bg-[hsl(var(--secondary)/0.5)] rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={type === 'category' ? 6 : 5} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))] text-sm">
                  هیچ آیتمی یافت نشد
                </td>
              </tr>
            ) : items.map((item: any, idx: number) => (
              <tr key={item.id} className={cn(
                'hover:bg-[hsl(var(--secondary)/0.3)] transition-colors',
                editing === item.id && 'bg-[hsl(var(--primary)/0.05)]',
              )}>
                <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">{idx + 1}</td>
                {type === 'category' && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {item.icon && <span className="text-sm">{item.icon}</span>}
                      {item.color && (
                        <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: item.color }} />
                      )}
                    </div>
                  </td>
                )}
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">{item.name_en || '—'}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    item.is_active !== false
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600',
                  )}>
                    {item.is_active !== false ? 'فعال' : 'غیرفعال'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(item)}
                      className="text-xs px-2 py-1 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] flex items-center gap-1">
                      <Edit3 className="h-3 w-3" />
                      ویرایش
                    </button>
                    <button onClick={() => {
                      if (confirm(`آیا از حذف "${item.name}" مطمئن هستید؟`))
                        deleteItem.mutate(item.id);
                    }}
                      disabled={deleteItem.isPending}
                      className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 flex items-center gap-1">
                      <Trash2 className="h-3 w-3" />
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// api-keys section
// ─────────────────────────────────────────────────────────────
function ApiKeysSection() {
  const toast = useToast();
  const qc    = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [form, setForm] = useState({ name: '', expiresAt: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'api-keys'],
    queryFn:  () => apiClient.get<{ success: boolean; data: any[] }>('/api-keys'),
  });

  const keys: any[] = data?.data ?? [];

  const createKey = useMutation({
    mutationFn: (body: any) => apiClient.post('/api-keys', body),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['admin', 'api-keys'] });
      if (res?.data?.key) setNewKeyValue(res.data.key);
      toast.success('کلید API ایجاد شد');
      setShowCreate(false);
      setForm({ name: '', expiresAt: '' });
    },
    onError: () => toast.error('خطا در ایجاد کلید API'),
  });

  const revokeKey = useMutation({
    mutationFn: (id: string) => apiClient.post(`/api-keys/${id}/revoke`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'api-keys'] }); toast.success('کلید API باطل شد'); },
    onError: () => toast.error('خطا در باطل‌سازی کلید'),
  });

  const deleteKey = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api-keys/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'api-keys'] }); toast.success('کلید API حذف شد'); },
    onError: () => toast.error('خطا در حذف کلید'),
  });

  const inputCls = 'w-full px-2.5 py-1.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none focus:border-[hsl(var(--primary))] transition-colors';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">مدیریت کلیدهای API دسترسی به سرویس‌های Xennic</p>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm hover:opacity-90">
          <Plus className="h-4 w-4" />
          کلید جدید
        </button>
      </div>

      {newKeyValue && (
        <div className="rounded-xl border border-green-300 bg-green-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-semibold">کلید API ایجاد شد</span>
          </div>
          <p className="text-xs text-green-600">این کلید فقط یک بار نمایش داده می‌شود. آن را در جای امنی ذخیره کنید.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white rounded-lg text-sm font-mono border border-green-200 ltr text-left break-all">{newKeyValue}</code>
            <button onClick={() => { navigator.clipboard.writeText(newKeyValue); toast.success('کپی شد'); }}
              className="h-9 px-3 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700">
              کپی
            </button>
          </div>
          <button onClick={() => setNewKeyValue('')} className="text-xs text-green-600 hover:underline">بستن</button>
        </div>
      )}

      {showCreate && (
        <div className="rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.03)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4 text-[hsl(var(--primary))]" />
              ایجاد کلید API جدید
            </h3>
            <button onClick={() => { setShowCreate(false); setForm({ name: '', expiresAt: '' }); }}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[hsl(var(--secondary))]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">نام *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputCls} placeholder="کلید توسعه" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">تاریخ انقضا (اختیاری)</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => { setShowCreate(false); setForm({ name: '', expiresAt: '' }); }}
              className="h-8 px-4 text-xs rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]">
              لغو
            </button>
            <button onClick={() => createKey.mutate({ name: form.name, expiresAt: form.expiresAt || undefined })}
              disabled={createKey.isPending || !form.name}
              className="h-8 px-5 text-xs rounded-lg flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50">
              {createKey.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              ایجاد
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--secondary)/0.5)]">
            <tr>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">نام</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">وضعیت</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">آخرین استفاده</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">انقضا</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3"><div className="h-4 bg-[hsl(var(--secondary)/0.5)] rounded animate-pulse" /></td>
                </tr>
              ))
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))] text-sm">
                  هیچ کلید API یافت نشد
                </td>
              </tr>
            ) : keys.map((k: any) => (
              <tr key={k.id} className="hover:bg-[hsl(var(--secondary)/0.3)] transition-colors">
                <td className="px-4 py-3 font-medium">{k.name}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    k.isRevoked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700')}>
                    {k.isRevoked ? 'باطل شده' : 'فعال'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString('fa-IR') : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                  {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString('fa-IR') : 'بدون انقضا'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {!k.isRevoked && (
                      <button onClick={() => { if (confirm('آیا از باطل‌سازی این کلید مطمئن هستید؟')) revokeKey.mutate(k.id); }}
                        disabled={revokeKey.isPending}
                        className="text-xs px-2 py-1 rounded border border-yellow-200 text-yellow-600 hover:bg-yellow-50 disabled:opacity-40 flex items-center gap-1">
                        باطل‌سازی
                      </button>
                    )}
                    <button onClick={() => { if (confirm('آیا از حذف این کلید مطمئن هستید؟')) deleteKey.mutate(k.id); }}
                      disabled={deleteKey.isPending}
                      className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 flex items-center gap-1">
                      <Trash2 className="h-3 w-3" />
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// webhooks section
// ─────────────────────────────────────────────────────────────
const WEBHOOK_EVENTS = [
  { value: 'user.registered', label: 'ثبت‌نام کاربر' },
  { value: 'user.login', label: 'ورود کاربر' },
  { value: 'workspace.created', label: 'ایجاد workspace' },
  { value: 'calculation.completed', label: 'تکمیل محاسبه' },
  { value: 'calculation.failed', label: 'خطای محاسبه' },
  { value: 'consultation.created', label: 'تیکت جدید' },
  { value: 'consultation.answered', label: 'پاسخ تیکت' },
  { value: 'payment.completed', label: 'پرداخت موفق' },
  { value: 'payment.failed', label: 'خطای پرداخت' },
  { value: 'subscription.created', label: 'اشتراک جدید' },
  { value: 'subscription.cancelled', label: 'لغو اشتراک' },
  { value: 'article.published', label: 'انتشار مقاله' },
  { value: 'article.updated', label: 'بروزرسانی مقاله' },
  { value: 'api_key.revoked', label: 'باطل‌سازی کلید API' },
];

function WebhooksSection() {
  const toast = useToast();
  const qc    = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'webhooks'],
    queryFn:  () => apiClient.get<{ success: boolean; data: any[] }>('/webhooks'),
  });

  const webhooks: any[] = data?.data ?? [];

  const inputCls = 'w-full px-2.5 py-1.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none focus:border-[hsl(var(--primary))] transition-colors';

  const startCreate = () => {
    setEditing('__new__');
    setForm({ url: '', secret: '', events: [] });
    setShowCreate(true);
  };

  const startEdit = (w: any) => {
    setEditing(w.id);
    setForm({ url: w.url, events: [...(w.events ?? [])], isActive: w.isActive });
    setShowCreate(true);
  };

  const closeForm = () => {
    setShowCreate(false);
    setEditing(null);
    setForm({});
  };

  const toggleEvent = (ev: string) => {
    setForm((f: any) => ({
      ...f,
      events: f.events?.includes(ev) ? f.events.filter((e: string) => e !== ev) : [...(f.events ?? []), ev],
    }));
  };

  const createWebhook = useMutation({
    mutationFn: (body: any) => apiClient.post('/webhooks', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'webhooks'] }); toast.success('Webhook ایجاد شد'); closeForm(); },
    onError: () => toast.error('خطا در ایجاد webhook'),
  });

  const updateWebhook = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => apiClient.patch(`/webhooks/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'webhooks'] }); toast.success('Webhook بروزرسانی شد'); closeForm(); },
    onError: () => toast.error('خطا در بروزرسانی webhook'),
  });

  const deleteWebhook = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/webhooks/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'webhooks'] }); toast.success('Webhook حذف شد'); },
    onError: () => toast.error('خطا در حذف webhook'),
  });

  const save = () => {
    if (editing === '__new__') {
      createWebhook.mutate({ url: form.url, events: form.events, secret: form.secret || undefined });
    } else {
      const body: any = {};
      if (form.url !== undefined) body.url = form.url;
      if (form.events !== undefined) body.events = form.events;
      updateWebhook.mutate({ id: editing!, body });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">مدیریت Webhook‌های ارسال رویداد به سرویس‌های خارجی</p>
        <button onClick={startCreate}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm hover:opacity-90">
          <Plus className="h-4 w-4" />
          Webhook جدید
        </button>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.03)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Webhook className="h-4 w-4 text-[hsl(var(--primary))]" />
              {editing === '__new__' ? 'Webhook جدید' : 'ویرایش Webhook'}
            </h3>
            <button onClick={closeForm}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[hsl(var(--secondary))]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">URL *</label>
              <input value={form.url ?? ''} onChange={e => setForm((f: any) => ({ ...f, url: e.target.value }))}
                className={inputCls} placeholder="https://example.com/webhook" dir="ltr" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">Secret (اختیاری)</label>
              <input value={form.secret ?? ''} onChange={e => setForm((f: any) => ({ ...f, secret: e.target.value }))}
                className={inputCls} placeholder="secret-123" dir="ltr" />
            </div>
            {editing !== '__new__' && (
              <div>
                <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">وضعیت</label>
                <button onClick={() => setForm((f: any) => ({ ...f, isActive: !f.isActive }))}
                  className="flex items-center gap-1.5 text-sm mt-1">
                  {form.isActive !== false
                    ? <><ToggleRight className="h-5 w-5 text-green-600" /> فعال</>
                    : <><ToggleLeft className="h-5 w-5 text-[hsl(var(--muted-foreground))]" /> غیرفعال</>}
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-1.5">رویدادها *</label>
            <div className="flex flex-wrap gap-1.5">
              {WEBHOOK_EVENTS.map(ev => (
                <button key={ev.value} onClick={() => toggleEvent(ev.value)}
                  className={cn(
                    'h-7 px-2.5 rounded-lg text-[10px] font-medium border transition-all',
                    (form.events ?? []).includes(ev.value)
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                      : 'bg-[hsl(var(--secondary)/0.3)] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]',
                  )}>
                  {ev.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={closeForm}
              className="h-8 px-4 text-xs rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]">
              لغو
            </button>
            <button onClick={save}
              disabled={(createWebhook.isPending || updateWebhook.isPending) || !form.url || !form.events?.length}
              className="h-8 px-5 text-xs rounded-lg flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50">
              {(createWebhook.isPending || updateWebhook.isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editing === '__new__' ? 'ایجاد' : 'ذخیره'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--secondary)/0.5)]">
            <tr>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">URL</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">رویدادها</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">وضعیت</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">تاریخ ایجاد</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3"><div className="h-4 bg-[hsl(var(--secondary)/0.5)] rounded animate-pulse" /></td>
                </tr>
              ))
            ) : webhooks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))] text-sm">
                  هیچ Webhook یافت نشد
                </td>
              </tr>
            ) : webhooks.map((w: any) => (
              <tr key={w.id} className="hover:bg-[hsl(var(--secondary)/0.3)] transition-colors">
                <td className="px-4 py-3 font-mono text-xs max-w-[200px] truncate ltr text-left" title={w.url}>{w.url}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(w.events ?? []).slice(0, 3).map((ev: string) => (
                      <span key={ev} className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--secondary)/0.5)] text-[hsl(var(--muted-foreground))]">
                        {ev}
                      </span>
                    ))}
                    {(w.events ?? []).length > 3 && (
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">+{w.events.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    w.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                    {w.isActive !== false ? 'فعال' : 'غیرفعال'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                  {w.createdAt ? new Date(w.createdAt).toLocaleDateString('fa-IR') : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(w)}
                      className="text-xs px-2 py-1 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] flex items-center gap-1">
                      <Edit3 className="h-3 w-3" />
                      ویرایش
                    </button>
                    <button onClick={() => { if (confirm('آیا از حذف این Webhook مطمئن هستید؟')) deleteWebhook.mutate(w.id); }}
                      disabled={deleteWebhook.isPending}
                      className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 flex items-center gap-1">
                      <Trash2 className="h-3 w-3" />
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// feature-flags section
// ─────────────────────────────────────────────────────────────
function FeatureFlagsSection() {
  const toast = useToast();
  const qc    = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'feature-flags'],
    queryFn:  () => apiClient.get<{ success: boolean; data: any[] }>('/admin/feature-flags'),
  });

  const flags: any[] = data?.data ?? [];

  const inputCls = 'w-full px-2.5 py-1.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none focus:border-[hsl(var(--primary))] transition-colors';

  const startCreate = () => {
    setEditing('__new__');
    setForm({ name: '', description: '', enabled: false, scope: 'global' });
    setShowCreate(true);
  };

  const startEdit = (f: any) => {
    const scope = f.workspaceId ? 'workspace' : f.planId ? 'plan' : 'global';
    setEditing(f.id);
    setForm({ description: f.description ?? '', scope, planId: f.planId ?? '', workspaceId: f.workspaceId ?? '' });
    setShowCreate(true);
  };

  const closeForm = () => {
    setShowCreate(false);
    setEditing(null);
    setForm({});
  };

  const createFlag = useMutation({
    mutationFn: (body: any) => apiClient.post('/admin/feature-flags', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }); toast.success('Feature flag ایجاد شد'); closeForm(); },
    onError: () => toast.error('خطا در ایجاد feature flag'),
  });

  const toggleFlag = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => apiClient.patch(`/admin/feature-flags/${id}/toggle`, { enabled }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }); },
    onError: () => toast.error('خطا در تغییر وضعیت'),
  });

  const updateFlag = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => apiClient.patch(`/admin/feature-flags/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }); toast.success('Feature flag بروزرسانی شد'); closeForm(); },
    onError: () => toast.error('خطا در بروزرسانی feature flag'),
  });

  const deleteFlag = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/feature-flags/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }); toast.success('Feature flag حذف شد'); },
    onError: () => toast.error('خطا در حذف feature flag'),
  });

  const save = () => {
    if (editing === '__new__') {
      const body: any = { name: form.name, description: form.description || undefined, enabled: form.enabled ?? false };
      if (form.scope === 'plan') body.planId = form.planId;
      if (form.scope === 'workspace') body.workspaceId = form.workspaceId;
      createFlag.mutate(body);
    } else {
      const body: any = {};
      if (form.description !== undefined) body.description = form.description;
      body.planId = form.scope === 'plan' ? form.planId : null;
      body.workspaceId = form.scope === 'workspace' ? form.workspaceId : null;
      updateFlag.mutate({ id: editing!, body });
    }
  };

  const getScopeLabel = (f: any) => {
    if (f.workspaceId) return { label: 'Workspace', color: 'bg-purple-100 text-purple-700' };
    if (f.planId) return { label: 'پلن', color: 'bg-blue-100 text-blue-700' };
    return { label: 'سراسری', color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">مدیریت Feature Flagهای سراسری پلتفرم</p>
        <button onClick={startCreate}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm hover:opacity-90">
          <Plus className="h-4 w-4" />
          Feature Flag جدید
        </button>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.03)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Flag className="h-4 w-4 text-[hsl(var(--primary))]" />
              {editing === '__new__' ? 'Feature Flag جدید' : 'ویرایش Feature Flag'}
            </h3>
            <button onClick={closeForm}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[hsl(var(--secondary))]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {editing === '__new__' && (
              <div>
                <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">نام *</label>
                <input value={form.name ?? ''} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
                  className={inputCls} placeholder="ai_calculator" dir="ltr" />
              </div>
            )}
            <div>
              <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">توضیحات</label>
              <input value={form.description ?? ''} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))}
                className={inputCls} placeholder="فعال‌سازی ماشین حساب هوش مصنوعی" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">حوزه</label>
              <div className="flex gap-1.5 mt-1">
                {[
                  { key: 'global', label: 'سراسری' },
                  { key: 'plan', label: 'پلن' },
                  { key: 'workspace', label: 'Workspace' },
                ].map(s => (
                  <button key={s.key} onClick={() => setForm((f: any) => ({ ...f, scope: s.key, planId: '', workspaceId: '' }))}
                    className={cn('h-7 px-3 rounded-lg text-[10px] font-medium border transition-all',
                      form.scope === s.key
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                        : 'bg-[hsl(var(--secondary)/0.3)] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
                    )}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            {form.scope === 'plan' && (
              <div>
                <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">شناسه پلن</label>
                <input value={form.planId ?? ''} onChange={e => setForm((f: any) => ({ ...f, planId: e.target.value }))}
                  className={inputCls} placeholder="plan-uuid" dir="ltr" />
              </div>
            )}
            {form.scope === 'workspace' && (
              <div>
                <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">شناسه Workspace</label>
                <input value={form.workspaceId ?? ''} onChange={e => setForm((f: any) => ({ ...f, workspaceId: e.target.value }))}
                  className={inputCls} placeholder="workspace-uuid" dir="ltr" />
              </div>
            )}
            {editing === '__new__' && (
              <div>
                <label className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] block mb-0.5">فعال</label>
                <button onClick={() => setForm((f: any) => ({ ...f, enabled: !f.enabled }))}
                  className="flex items-center gap-1.5 text-sm mt-1">
                  {form.enabled
                    ? <><ToggleRight className="h-5 w-5 text-green-600" /> فعال</>
                    : <><ToggleLeft className="h-5 w-5 text-[hsl(var(--muted-foreground))]" /> غیرفعال</>}
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={closeForm}
              className="h-8 px-4 text-xs rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]">
              لغو
            </button>
            <button onClick={save}
              disabled={(createFlag.isPending || updateFlag.isPending) || (editing === '__new__' && !form.name)}
              className="h-8 px-5 text-xs rounded-lg flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50">
              {(createFlag.isPending || updateFlag.isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editing === '__new__' ? 'ایجاد' : 'ذخیره'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--secondary)/0.5)]">
            <tr>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">نام</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">توضیحات</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">وضعیت</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">حوزه</th>
              <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3"><div className="h-4 bg-[hsl(var(--secondary)/0.5)] rounded animate-pulse" /></td>
                </tr>
              ))
            ) : flags.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))] text-sm">
                  هیچ Feature flag یافت نشد
                </td>
              </tr>
            ) : flags.map((f: any) => {
              const scope = getScopeLabel(f);
              return (
                <tr key={f.id} className="hover:bg-[hsl(var(--secondary)/0.3)] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs ltr">{f.name}</td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))] max-w-[200px] truncate">{f.description || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleFlag.mutate({ id: f.id, enabled: !f.enabled })}
                      disabled={toggleFlag.isPending}
                      className="flex items-center gap-1.5 text-sm">
                      {f.enabled
                        ? <><ToggleRight className="h-5 w-5 text-green-600" /> فعال</>
                        : <><ToggleLeft className="h-5 w-5 text-[hsl(var(--muted-foreground))]" /> غیرفعال</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', scope.color)}>
                      {scope.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(f)}
                        className="text-xs px-2 py-1 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] flex items-center gap-1">
                        <Edit3 className="h-3 w-3" />
                        ویرایش
                      </button>
                      <button onClick={() => { if (confirm('آیا از حذف این feature flag مطمئن هستید؟')) deleteFlag.mutate(f.id); }}
                        disabled={deleteFlag.isPending}
                        className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 flex items-center gap-1">
                        <Trash2 className="h-3 w-3" />
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// main admin client
// ─────────────────────────────────────────────────────────────
export function AdminClient() {
  const [section, setSection] = useState<Section>('dashboard');

  const SECTION_COMPONENTS: Record<Section, React.ReactNode> = {
    dashboard:      <DashboardSection />,
    users:          <UsersSection />,
    workspaces:     <WorkspacesSection />,
    plans:          <PlansSection />,
    consultations:  <ConsultationsSection />,
    articles:       <ArticlesAdminSection />,
    notifications:  <NotificationsSection />,
    settings:       <SettingsSection />,
    taxonomy:       <TaxonomySection />,
    'api-keys':     <ApiKeysSection />,
    webhooks:       <WebhooksSection />,
    'feature-flags':<FeatureFlagsSection />,
  };

  const current = SECTIONS.find(s => s.key === section);

  return (
    <div className="flex gap-0 min-h-screen -m-6">

      {/* sidebar */}
      <div className="w-56 shrink-0 bg-[hsl(var(--secondary)/0.4)] border-l border-[hsl(var(--border))] flex flex-col">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">پنل ادمین</p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Xennic Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.key} onClick={() => setSection(s.key)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-right',
                  section === s.key
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium'
                    : 'text-[hsl(var(--foreground)/0.7)] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]',
                )}>
                <Icon className="h-4 w-4 shrink-0" />
                {s.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[hsl(var(--border))] space-y-1">
          <a href="/fa/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--primary)/0.08)] hover:text-[hsl(var(--primary))] transition-colors">
            <LayoutDashboard className="h-3.5 w-3.5" />
            بازگشت به داشبورد
          </a>
          <button
            onClick={() => {
              useAuthStore.getState().clearAuth();
              window.location.href = '/fa/login';
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            خروج از حساب
          </button>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-lg font-black flex items-center gap-2">
            {current && <current.icon className="h-5 w-5 text-[hsl(var(--primary))]" />}
            {current?.label}
          </h1>
        </div>
        {SECTION_COMPONENTS[section]}
      </div>
    </div>
  );
}
