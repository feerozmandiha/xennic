'use client';

import { useState, useEffect } from 'react';
import { useTheme }        from 'next-themes';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sun, Moon, Monitor, Globe, User, CreditCard,
  Shield, Save, Building2, UserPlus, Trash2,
  Crown, UserMinus, Mail, RefreshCw, ChevronRight,
  CheckCircle2, AlertTriangle, Eye, EyeOff,
  Settings, Palette, Clock, Bell, Sliders,
  Languages, Ruler, Zap, Thermometer, Hash, Percent,
  PaintBucket, ToggleLeft,
} from 'lucide-react';
import { PageHeader }  from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input }   from '@/components/ui/input';
import { Badge }   from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth.store';
import { useToast }     from '@/stores/toast.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';
import { BillingClient } from '@/features/billing/components/billing-client';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'profile',   label: 'پروفایل',   icon: User },
  { key: 'workspace', label: 'Workspace', icon: Building2 },
  { key: 'security',  label: 'امنیت',     icon: Shield },
  { key: 'plan',      label: 'اشتراک',    icon: CreditCard },
  { key: 'appearance',label: 'ظاهر',      icon: Sun },
] as const;

type Tab = typeof TABS[number]['key'];

// ─────────────────────────────────────────────────────────────
// TAB: PROFILE
// ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const user       = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const toast      = useToast();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName,  setLastName]  = useState(user?.lastName  ?? '');

  const mutation = useMutation({
    mutationFn: () => apiClient.put(`/users/${user?.id}`, { firstName, lastName }),
    onSuccess: () => {
      updateUser({ firstName, lastName });
      toast.success('پروفایل بروز شد');
    },
    onError: () => toast.error('خطا در بروزرسانی پروفایل'),
  });

  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';

  return (
    <div className="space-y-5 max-w-lg">
      {/* Avatar */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center shrink-0',
              'bg-[hsl(var(--primary)/0.1)] border-2 border-[hsl(var(--primary)/0.2)]',
            )}>
              <span className="text-2xl font-black text-[hsl(var(--primary))]">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base">{firstName} {lastName}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <CheckCircle2 className="h-3 w-3 text-[hsl(var(--success))]" />
                <span className="text-xs text-[hsl(var(--success))] font-medium">حساب فعال</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            ویرایش اطلاعات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="نام" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            <Input label="نام خانوادگی" value={lastName} onChange={e => setLastName(e.target.value)} required />
          </div>
          <Input label="ایمیل" value={user?.email ?? ''} disabled className="opacity-60" />
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            برای تغییر ایمیل با پشتیبانی تماس بگیرید
          </p>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || (!firstName && !lastName)}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: WORKSPACE
// ─────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { label: string; variant: any; icon: React.ElementType }> = {
  OWNER:  { label: 'مالک',     variant: 'warning',   icon: Crown },
  ADMIN:  { label: 'ادمین',    variant: 'default',   icon: Shield },
  MEMBER: { label: 'عضو',      variant: 'secondary', icon: User },
  VIEWER: { label: 'مشاهده‌گر', variant: 'secondary', icon: Eye },
};

function WorkspaceTab() {
  const wsId        = useAuthStore(s => s.workspaceId);
  const user        = useAuthStore(s => s.user);
  const toast       = useToast();
  const queryClient = useQueryClient();

  const [wsName,    setWsName]    = useState('');
  const [nameEdit,  setNameEdit]  = useState(false);
  const [invEmail,  setInvEmail]  = useState('');
  const [invRole,   setInvRole]   = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [showInvite, setShowInvite] = useState(false);

  // ── Workspace Settings ──
  const [wsSettings, setWsSettings] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['ws-settings', wsId],
    queryFn:  () => apiClient.get<any>(`/workspaces/${wsId}/settings`),
    enabled:  !!wsId && showSettings,
    retry: false,
  });

  const settings = settingsData?.data?.settings ?? wsSettings;

  useEffect(() => {
    if (settingsData?.data?.settings && !wsSettings) {
      setWsSettings(settingsData.data.settings);
    }
  }, [settingsData, wsSettings]);

  const settingsSaveMutation = useMutation({
    mutationFn: (data: any) => apiClient.patch(`/workspaces/${wsId}/settings`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ws-settings'] });
      toast.success('تنظیمات workspace ذخیره شد');
    },
    onError: (e: any) => toast.error(e?.message ?? 'خطا در ذخیره تنظیمات'),
  });

  // Workspace info
  const { data: wsData, isLoading: wsLoading } = useQuery({
    queryKey: ['workspace-detail', wsId],
    queryFn:  () => apiClient.get<any>(`/workspaces/${wsId}`),
    enabled:  !!wsId,
    retry: false,
  });

  // Members
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['ws-members', wsId],
    queryFn:  () => apiClient.get<any>(`/workspaces/${wsId}/members`),
    enabled:  !!wsId,
    retry: false,
  });

  // Invitations
  const { data: invData } = useQuery({
    queryKey: ['ws-invitations', wsId],
    queryFn:  () => apiClient.get<any>(`/workspaces/${wsId}/invitations`),
    enabled:  !!wsId,
    retry: false,
  });

  const ws      = wsData?.data;
  const members = membersData?.data ?? [];
  const invitations = (invData?.data ?? []).filter((i: any) => i.status === 'pending');
  const isOwner = ws?.createdBy === user?.id || members.find((m: any) => m.userId === user?.id)?.role === 'OWNER';

  // Rename workspace
  const renameMutation = useMutation({
    mutationFn: () => apiClient.put(`/workspaces/${wsId}`, { name: wsName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-detail'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces-list'] });
      toast.success('نام workspace بروز شد');
      setNameEdit(false);
    },
    onError: (e: any) => toast.error(e?.message ?? 'خطا در تغییر نام'),
  });

  // Remove member
  const removeMutation = useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/workspaces/${wsId}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ws-members'] });
      toast.success('عضو حذف شد');
    },
    onError: (e: any) => toast.error(e?.message ?? 'خطا در حذف عضو'),
  });

  // Change role
  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiClient.patch(`/workspaces/${wsId}/members/${userId}`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ws-members'] });
      toast.success('نقش تغییر کرد');
    },
    onError: (e: any) => toast.error(e?.message ?? 'خطا در تغییر نقش'),
  });

  // Invite
  const inviteMutation = useMutation({
    mutationFn: () => apiClient.post(`/workspaces/${wsId}/invitations`, { email: invEmail, role: invRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ws-invitations'] });
      toast.success(`دعوتنامه به ${invEmail} ارسال شد`);
      setInvEmail('');
      setShowInvite(false);
    },
    onError: (e: any) => toast.error(e?.message ?? 'خطا در ارسال دعوتنامه'),
  });

  // Cancel invitation
  const cancelInvMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/workspaces/${wsId}/invitations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ws-invitations'] });
      toast.success('دعوتنامه لغو شد');
    },
    onError: () => toast.error('خطا در لغو دعوتنامه'),
  });

  if (wsLoading) return (
    <div className="space-y-4 max-w-2xl">
      <Skeleton className="h-32" />
      <Skeleton className="h-48" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Workspace Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            اطلاعات Workspace
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center shrink-0">
              <span className="text-lg font-black text-[hsl(var(--primary))]">
                {ws?.name?.[0]?.toUpperCase() ?? 'W'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {nameEdit ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={wsName}
                    onChange={e => setWsName(e.target.value)}
                    placeholder={ws?.name}
                    className="h-8 text-sm"
                  />
                  <button
                    onClick={() => renameMutation.mutate()}
                    disabled={renameMutation.isPending || !wsName.trim()}
                    className="h-8 px-3 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 shrink-0"
                  >
                    ذخیره
                  </button>
                  <button
                    onClick={() => setNameEdit(false)}
                    className="h-8 px-2 rounded-[var(--radius)] border border-[hsl(var(--border))] text-xs hover:bg-[hsl(var(--secondary))] shrink-0"
                  >
                    انصراف
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{ws?.name}</p>
                  {isOwner && (
                    <button
                      onClick={() => { setWsName(ws?.name ?? ''); setNameEdit(true); }}
                      className="text-xs text-[hsl(var(--primary))] hover:underline"
                    >
                      ویرایش
                    </button>
                  )}
                </div>
              )}
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 font-mono">{ws?.code}</p>
            </div>
            <Badge variant="success" className="shrink-0 text-[10px]">فعال</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            اعضا
            <Badge variant="secondary" className="text-[10px]">{members.length}</Badge>
          </CardTitle>
          {isOwner && (
            <button
              onClick={() => setShowInvite(s => !s)}
              className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] text-xs font-medium hover:bg-[hsl(var(--primary)/0.12)] transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              دعوت عضو
            </button>
          )}
        </CardHeader>

        {/* Invite form */}
        {showInvite && (
          <div className="mx-5 mb-4 p-4 rounded-[var(--radius-lg)] bg-[hsl(var(--secondary)/0.5)] border border-[hsl(var(--border))] space-y-3 animate-slide-down">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">دعوت عضو جدید</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={invEmail}
                onChange={e => setInvEmail(e.target.value)}
                startIcon={<Mail className="h-4 w-4" />}
                dir="ltr"
                className="flex-1"
              />
              <select
                value={invRole}
                onChange={e => setInvRole(e.target.value as any)}
                className={cn(
                  'h-9 px-2 rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]',
                )}
              >
                <option value="ADMIN">ادمین</option>
                <option value="MEMBER">عضو</option>
                <option value="VIEWER">مشاهده‌گر</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => inviteMutation.mutate()}
                disabled={inviteMutation.isPending || !invEmail.trim()}
                className="h-8 px-4 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-xs font-medium hover:opacity-90 disabled:opacity-50"
              >
                {inviteMutation.isPending ? 'در حال ارسال...' : 'ارسال دعوتنامه'}
              </button>
              <button
                onClick={() => setShowInvite(false)}
                className="h-8 px-3 rounded-[var(--radius)] border border-[hsl(var(--border))] text-xs hover:bg-[hsl(var(--secondary))]"
              >
                انصراف
              </button>
            </div>
          </div>
        )}

        <CardContent className="p-0">
          {membersLoading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : (
            <ul className="divide-y divide-[hsl(var(--border))]">
              {members.map((member: any) => {
                const cfg     = ROLE_CONFIG[member.role] ?? ROLE_CONFIG.MEMBER;
                const Icon    = cfg.icon;
                const isMe    = member.userId === user?.id;
                const isOwnerMember = member.role === 'OWNER';

                return (
                  <li key={member.id} className="flex items-center gap-3 px-5 py-3.5 group">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold">
                        {member.userId?.slice(0, 2).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {member.userId}
                          {isMe && <span className="text-[10px] text-[hsl(var(--muted-foreground))] mr-1">(شما)</span>}
                        </p>
                      </div>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        {new Date(member.joinedAt).toLocaleDateString('fa-IR')} عضو شد
                      </p>
                    </div>

                    {/* Role badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isOwner && !isMe && !isOwnerMember ? (
                        <select
                          defaultValue={member.role}
                          onChange={e => roleMutation.mutate({ userId: member.userId, role: e.target.value })}
                          className={cn(
                            'h-7 px-2 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-transparent text-xs',
                            'focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]',
                          )}
                        >
                          <option value="ADMIN">ادمین</option>
                          <option value="MEMBER">عضو</option>
                          <option value="VIEWER">مشاهده‌گر</option>
                        </select>
                      ) : (
                        <Badge variant={cfg.variant} className="text-[10px] gap-1">
                          <Icon className="h-2.5 w-2.5" />
                          {cfg.label}
                        </Badge>
                      )}

                      {/* Remove */}
                      {isOwner && !isMe && !isOwnerMember && (
                        <button
                          onClick={() => removeMutation.mutate(member.userId)}
                          className="p-1 rounded hover:bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--muted-foreground)/0.4)] hover:text-[hsl(var(--destructive))] opacity-0 group-hover:opacity-100 transition-all"
                          title="حذف عضو"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              دعوتنامه‌های در انتظار
              <Badge variant="warning" className="text-[10px]">{invitations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-[hsl(var(--border))]">
              {invitations.map((inv: any) => {
                const cfg = ROLE_CONFIG[inv.role] ?? ROLE_CONFIG.MEMBER;
                return (
                  <li key={inv.id} className="flex items-center gap-3 px-5 py-3 group">
                    <Mail className="h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate font-medium">{inv.email}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        انقضا: {new Date(inv.expiresAt).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    <Badge variant={cfg.variant} className="text-[10px] shrink-0">{cfg.label}</Badge>
                    {isOwner && (
                      <button
                        onClick={() => cancelInvMutation.mutate(inv.id)}
                        className="p-1 rounded hover:bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--muted-foreground)/0.4)] hover:text-[hsl(var(--destructive))] opacity-0 group-hover:opacity-100 transition-all"
                        title="لغو دعوتنامه"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ── Workspace Settings ── */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            تنظیمات Workspace
          </CardTitle>
          {isOwner && (
            <button
              onClick={() => { setShowSettings(s => !s); }}
              className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] text-xs font-medium hover:bg-[hsl(var(--primary)/0.12)] transition-colors"
            >
              <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', showSettings && 'rotate-90')} />
              {showSettings ? 'بستن' : 'ویرایش'}
            </button>
          )}
        </CardHeader>
        {showSettings && (
          <CardContent>
            {settingsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40" />
                <Skeleton className="h-32" />
              </div>
            ) : (
              <div className="space-y-6">

                {/* ── Brand ── */}
                <div>
                  <h4 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 mb-3">
                    <Palette className="h-3.5 w-3.5" />
                    برند
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">نام برند</label>
                      <Input
                        value={settings?.brand?.name ?? ''}
                        onChange={e => setWsSettings((s: any) => ({ ...s, brand: { ...s?.brand, name: e.target.value } }))}
                        placeholder="Xennic Engineering"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">آدرس لوگو</label>
                      <Input
                        dir="ltr"
                        value={settings?.brand?.logo_url ?? ''}
                        onChange={e => setWsSettings((s: any) => ({ ...s, brand: { ...s?.brand, logo_url: e.target.value } }))}
                        placeholder="https://storage.example.com/logo.png"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">رنگ اصلی</label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={settings?.brand?.primary_color ?? '#2563eb'}
                          onChange={e => setWsSettings((s: any) => ({ ...s, brand: { ...s?.brand, primary_color: e.target.value } }))}
                          placeholder="#2563eb"
                          className="h-8 text-sm font-mono flex-1"
                          dir="ltr"
                        />
                        <div
                          className="w-8 h-8 rounded-[var(--radius)] border border-[hsl(var(--border))] shrink-0"
                          style={{ backgroundColor: settings?.brand?.primary_color ?? '#2563eb' }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">رنگ ثانویه</label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={settings?.brand?.accent_color ?? '#7c3aed'}
                          onChange={e => setWsSettings((s: any) => ({ ...s, brand: { ...s?.brand, accent_color: e.target.value } }))}
                          placeholder="#7c3aed"
                          className="h-8 text-sm font-mono flex-1"
                          dir="ltr"
                        />
                        <div
                          className="w-8 h-8 rounded-[var(--radius)] border border-[hsl(var(--border))] shrink-0"
                          style={{ backgroundColor: settings?.brand?.accent_color ?? '#7c3aed' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* ── Localization ── */}
                <div>
                  <h4 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 mb-3">
                    <Globe className="h-3.5 w-3.5" />
                    محلی‌سازی
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">زبان</label>
                      <select
                        value={settings?.localization?.locale ?? 'fa'}
                        onChange={e => setWsSettings((s: any) => ({ ...s, localization: { ...s?.localization, locale: e.target.value } }))}
                        className="h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                      >
                        <option value="fa">فارسی</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">جهت</label>
                      <select
                        value={settings?.localization?.direction ?? 'rtl'}
                        onChange={e => setWsSettings((s: any) => ({ ...s, localization: { ...s?.localization, direction: e.target.value } }))}
                        className="h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                      >
                        <option value="rtl">راست‌به‌چپ (RTL)</option>
                        <option value="ltr">چپ‌به‌راست (LTR)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">منطقه زمانی</label>
                      <select
                        value={settings?.localization?.timezone ?? 'Asia/Tehran'}
                        onChange={e => setWsSettings((s: any) => ({ ...s, localization: { ...s?.localization, timezone: e.target.value } }))}
                        className="h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                        dir="ltr"
                      >
                        <option value="Asia/Tehran">Asia/Tehran (UTC+3:30)</option>
                        <option value="UTC">UTC</option>
                        <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                        <option value="Europe/London">Europe/London (UTC+1)</option>
                        <option value="America/New_York">America/New_York (UTC-4)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">فرمت تاریخ</label>
                      <select
                        value={settings?.localization?.date_format ?? 'YYYY/MM/DD'}
                        onChange={e => setWsSettings((s: any) => ({ ...s, localization: { ...s?.localization, date_format: e.target.value } }))}
                        className="h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                      >
                        <option value="YYYY/MM/DD">۱۴۰۴/۰۳/۲۶</option>
                        <option value="YYYY-MM-DD">۱۴۰۴-۰۳-۲۶</option>
                        <option value="DD/MM/YYYY">۲۶/۰۳/۱۴۰۴</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">فرمت اعداد</label>
                      <select
                        value={settings?.localization?.number_format ?? 'fa'}
                        onChange={e => setWsSettings((s: any) => ({ ...s, localization: { ...s?.localization, number_format: e.target.value } }))}
                        className="h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                      >
                        <option value="fa">فارسی (۱۲۳۴)</option>
                        <option value="en">English (1234)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* ── Calculation Defaults ── */}
                <div>
                  <h4 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 mb-3">
                    <Sliders className="h-3.5 w-3.5" />
                    پیش‌فرض‌های محاسباتی
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">ولتاژ (kV)</label>
                      <Input
                        type="number" step="0.1" min="0" max="1000"
                        value={settings?.defaults?.voltage_level_kv ?? 0.4}
                        onChange={e => setWsSettings((s: any) => ({ ...s, defaults: { ...s?.defaults, voltage_level_kv: parseFloat(e.target.value) } }))}
                        className="h-8 text-sm"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">فرکانس (Hz)</label>
                      <select
                        value={settings?.defaults?.frequency_hz ?? 50}
                        onChange={e => setWsSettings((s: any) => ({ ...s, defaults: { ...s?.defaults, frequency_hz: parseInt(e.target.value) } }))}
                        className="h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                      >
                        <option value={50}>50 Hz</option>
                        <option value={60}>60 Hz</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">دمای محیط (°C)</label>
                      <Input
                        type="number" step="1" min="-20" max="80"
                        value={settings?.defaults?.ambient_temperature_c ?? 35}
                        onChange={e => setWsSettings((s: any) => ({ ...s, defaults: { ...s?.defaults, ambient_temperature_c: parseFloat(e.target.value) } }))}
                        className="h-8 text-sm"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">جنس هادی</label>
                      <select
                        value={settings?.defaults?.conductor_material ?? 'copper'}
                        onChange={e => setWsSettings((s: any) => ({ ...s, defaults: { ...s?.defaults, conductor_material: e.target.value } }))}
                        className="h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                      >
                        <option value="copper">مس</option>
                        <option value="aluminum">آلومینیوم</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">نوع عایق</label>
                      <select
                        value={settings?.defaults?.insulation_type ?? 'XLPE'}
                        onChange={e => setWsSettings((s: any) => ({ ...s, defaults: { ...s?.defaults, insulation_type: e.target.value } }))}
                        className="h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                      >
                        <option value="XLPE">XLPE</option>
                        <option value="PVC">PVC</option>
                        <option value="EPR">EPR</option>
                        <option value="MI">MI</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">ضریب توان</label>
                      <Input
                        type="number" step="0.01" min="0" max="1"
                        value={settings?.defaults?.power_factor ?? 0.85}
                        onChange={e => setWsSettings((s: any) => ({ ...s, defaults: { ...s?.defaults, power_factor: parseFloat(e.target.value) } }))}
                        className="h-8 text-sm"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* ── Notifications ── */}
                <div>
                  <h4 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 mb-3">
                    <Bell className="h-3.5 w-3.5" />
                    اعلان‌ها
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between py-2 px-3 rounded-[var(--radius)] bg-[hsl(var(--secondary)/0.3)]">
                      <span className="text-xs">اعلان‌های ایمیلی</span>
                      <input
                        type="checkbox"
                        checked={settings?.notifications?.email_alerts ?? true}
                        onChange={e => setWsSettings((s: any) => ({ ...s, notifications: { ...s?.notifications, email_alerts: e.target.checked } }))}
                        className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
                      />
                    </label>
                    <label className="flex items-center justify-between py-2 px-3 rounded-[var(--radius)] bg-[hsl(var(--secondary)/0.3)]">
                      <span className="text-xs">پایان محاسبات</span>
                      <input
                        type="checkbox"
                        checked={settings?.notifications?.calculation_completed ?? true}
                        onChange={e => setWsSettings((s: any) => ({ ...s, notifications: { ...s?.notifications, calculation_completed: e.target.checked } }))}
                        className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
                      />
                    </label>
                    <label className="flex items-center justify-between py-2 px-3 rounded-[var(--radius)] bg-[hsl(var(--secondary)/0.3)]">
                      <span className="text-xs">عضویت عضو جدید</span>
                      <input
                        type="checkbox"
                        checked={settings?.notifications?.member_joined ?? true}
                        onChange={e => setWsSettings((s: any) => ({ ...s, notifications: { ...s?.notifications, member_joined: e.target.checked } }))}
                        className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
                      />
                    </label>
                    <label className="flex items-center justify-between py-2 px-3 rounded-[var(--radius)] bg-[hsl(var(--secondary)/0.3)]">
                      <span className="text-xs">گزارش هفتگی</span>
                      <input
                        type="checkbox"
                        checked={settings?.notifications?.weekly_report ?? false}
                        onChange={e => setWsSettings((s: any) => ({ ...s, notifications: { ...s?.notifications, weekly_report: e.target.checked } }))}
                        className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
                      />
                    </label>
                  </div>
                </div>

                <Separator />

                {/* ── Features ── */}
                <div>
                  <h4 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 mb-3">
                    <ToggleLeft className="h-3.5 w-3.5" />
                    ویژگی‌ها
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between py-2 px-3 rounded-[var(--radius)] bg-[hsl(var(--secondary)/0.3)]">
                      <span className="text-xs">ذخیره خودکار</span>
                      <input
                        type="checkbox"
                        checked={settings?.features?.auto_save ?? true}
                        onChange={e => setWsSettings((s: any) => ({ ...s, features: { ...s?.features, auto_save: e.target.checked } }))}
                        className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
                      />
                    </label>
                    <label className="flex items-center justify-between py-2 px-3 rounded-[var(--radius)] bg-[hsl(var(--secondary)/0.3)]">
                      <span className="text-xs">نمایش گزینه‌های پیشرفته</span>
                      <input
                        type="checkbox"
                        checked={settings?.features?.show_advanced_options ?? false}
                        onChange={e => setWsSettings((s: any) => ({ ...s, features: { ...s?.features, show_advanced_options: e.target.checked } }))}
                        className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
                      />
                    </label>
                    <div className="flex items-center justify-between py-2 px-3 rounded-[var(--radius)] bg-[hsl(var(--secondary)/0.3)]">
                      <span className="text-xs">فرمت پیش‌فرض خروجی</span>
                      <select
                        value={settings?.features?.export_default_format ?? 'pdf'}
                        onChange={e => setWsSettings((s: any) => ({ ...s, features: { ...s?.features, export_default_format: e.target.value } }))}
                        className="h-7 w-24 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-transparent px-1 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                      >
                        <option value="pdf">PDF</option>
                        <option value="xlsx">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── Save / Reset ── */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => settingsSaveMutation.mutate(settings)}
                    disabled={settingsSaveMutation.isPending || !settings}
                    className="inline-flex items-center gap-1.5 h-8 px-4 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {settingsSaveMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
                  </button>
                  <button
                    onClick={async () => {
                      await apiClient.patch(`/workspaces/${wsId}/settings/reset`, {});
                      queryClient.invalidateQueries({ queryKey: ['ws-settings'] });
                      setWsSettings(null);
                      toast.success('تنظیمات به حالت پیش‌فرض بازگشت');
                    }}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius)] border border-[hsl(var(--border))] text-xs hover:bg-[hsl(var(--secondary))] transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    بازنشانی به پیش‌فرض
                  </button>
                </div>

              </div>
            )}
          </CardContent>
        )}
      </Card>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: SECURITY
// ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const toast     = useToast();
  const clearAuth = useAuthStore(s => s.clearAuth);
  const router    = useRouter();
  const params    = useParams();
  const locale    = (params?.locale as string) ?? 'fa';

  const [current,   setCurrent]   = useState('');
  const [newPass,   setNewPass]   = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showCur,   setShowCur]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  const passwordsMatch = newPass === confirm;
  const isValid = current && newPass.length >= 8 && passwordsMatch;

  async function changePassword() {
    if (!isValid) return;
    setLoading(true);
    try {
      await apiClient.put('/auth/change-password', { currentPassword: current, newPassword: newPass });
      toast.success('رمز عبور با موفقیت تغییر کرد');
      setCurrent(''); setNewPass(''); setConfirm('');
    } catch (err: any) {
      toast.error(err?.message ?? 'خطا در تغییر رمز عبور');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try { await apiClient.post('/auth/logout'); } catch { /* ignore */ }
    clearAuth();
    router.push(`/${locale}/login`);
  }

  return (
    <div className="space-y-5 max-w-lg">
      {/* Change Password */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            تغییر رمز عبور
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type={showCur ? 'text' : 'password'}
            label="رمز عبور فعلی"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            dir="ltr"
            endIcon={
              <button type="button" onClick={() => setShowCur(s => !s)}>
                {showCur ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <Input
            type={showNew ? 'text' : 'password'}
            label="رمز عبور جدید"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            hint="حداقل ۸ کاراکتر، شامل حرف بزرگ، عدد و کاراکتر خاص (@$!%*?&)"
            dir="ltr"
            endIcon={
              <button type="button" onClick={() => setShowNew(s => !s)}>
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <Input
            type="password"
            label="تکرار رمز عبور جدید"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            error={confirm && !passwordsMatch ? 'رمز عبور مطابقت ندارد' : undefined}
            dir="ltr"
          />

          {/* Strength indicator */}
          {newPass && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[
                  newPass.length >= 8,
                  /[A-Z]/.test(newPass),
                  /[0-9]/.test(newPass),
                  /[@$!%*?&]/.test(newPass),
                ].map((ok, i) => (
                  <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', ok ? 'bg-[hsl(var(--success))]' : 'bg-[hsl(var(--border))]')} />
                ))}
              </div>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                قدرت رمز عبور: {[/[A-Z]/.test(newPass), /[0-9]/.test(newPass), /[@$!%*?&]/.test(newPass), newPass.length >= 8].filter(Boolean).length}/4
              </p>
            </div>
          )}

          <button
            onClick={changePassword}
            disabled={loading || !isValid}
            className="w-full h-9 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
          </button>
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card className="border-[hsl(var(--destructive)/0.2)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-[hsl(var(--destructive))]">
            <AlertTriangle className="h-4 w-4" />
            منطقه خطر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-[var(--radius)] bg-[hsl(var(--destructive)/0.04)] border border-[hsl(var(--destructive)/0.1)]">
            <div>
              <p className="text-sm font-medium">خروج از سیستم</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">از همه دستگاه‌ها خارج می‌شوید</p>
            </div>
            <button
              onClick={handleLogout}
              className="h-8 px-4 rounded-[var(--radius)] bg-[hsl(var(--destructive))] text-white text-xs font-medium hover:opacity-90 transition-opacity"
            >
              خروج
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: PLAN
// ─────────────────────────────────────────────────────────────

function PlanTab() {
  return <BillingClient />;
}

// ─────────────────────────────────────────────────────────────
// TAB: APPEARANCE
// ─────────────────────────────────────────────────────────────

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  const themes = [
    { key: 'light',  label: 'روشن',   icon: Sun,     desc: 'پس‌زمینه سفید' },
    { key: 'dark',   label: 'تاریک',  icon: Moon,    desc: 'پس‌زمینه تاریک' },
    { key: 'system', label: 'سیستم',  icon: Monitor, desc: 'بر اساس تنظیمات سیستم' },
  ] as const;

  const langs = [
    { code: 'fa', label: 'فارسی',  flag: '🇮🇷', dir: 'RTL' },
    { code: 'en', label: 'English', flag: '🇺🇸', dir: 'LTR' },
  ];

  return (
    <div className="space-y-5 max-w-lg">
      {/* Theme */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sun className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            تم رنگی
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themes.map(({ key, label, icon: Icon, desc }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-[var(--radius-lg)] border transition-all',
                  theme === key
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--secondary)/0.5)]',
                )}
              >
                <Icon className={cn('h-5 w-5', theme === key ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]')} />
                <span className={cn('text-xs font-semibold', theme === key ? 'text-[hsl(var(--primary))]' : '')}>{label}</span>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] text-center">{desc}</span>
                {theme === key && <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            زبان رابط کاربری
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {langs.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  const path = window.location.pathname.replace(`/${locale}`, `/${lang.code}`);
                  router.push(path);
                }}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border transition-all text-start',
                  locale === lang.code
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]',
                )}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <p className={cn('text-sm font-semibold', locale === lang.code && 'text-[hsl(var(--primary))]')}>
                    {lang.label}
                  </p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono">{lang.dir}</p>
                </div>
                {locale === lang.code && <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary))] mr-auto" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

export function SettingsClient() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get('tab') as Tab) ?? 'profile';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const activeTabConfig = TABS.find(t => t.key === activeTab);

  return (
    <div>
      <PageHeader title="تنظیمات" />

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Sidebar tabs ─────────────────────────────── */}
        <nav className="lg:w-52 shrink-0">
          <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {TABS.map(({ key, label, icon: Icon }) => (
              <li key={key} className="shrink-0">
                <button
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[var(--radius)] text-sm transition-colors text-start',
                    activeTab === key
                      ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-semibold'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{label}</span>
                  {activeTab === key && <ChevronRight className="h-3.5 w-3.5 mr-auto opacity-50 rtl:rotate-180" />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Tab content ──────────────────────────────── */}
        <div className="flex-1 min-w-0 animate-fade-in">
          {activeTab === 'profile'    && <ProfileTab />}
          {activeTab === 'workspace'  && <WorkspaceTab />}
          {activeTab === 'security'   && <SecurityTab />}
          {activeTab === 'plan'       && <PlanTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
        </div>
      </div>
    </div>
  );
}
