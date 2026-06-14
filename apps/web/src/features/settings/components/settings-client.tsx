'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme }        from 'next-themes';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sun, Moon, Monitor, Globe, User, CreditCard,
  Shield, Save, Building2, UserPlus, Trash2,
  Crown, UserMinus, Mail, RefreshCw, ChevronRight,
  CheckCircle2, AlertTriangle, Eye, EyeOff,
} from 'lucide-react';
import { PageHeader }  from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input }   from '@/components/ui/input';
import { Badge }   from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';
import { useToast }     from '@/stores/toast.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';

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
  const wsId  = useAuthStore(s => s.workspaceId);
  const toast = useToast();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  const { data, isLoading } = useQuery({
    queryKey: ['subscription', wsId],
    queryFn:  () => apiClient.get<any>(`/workspaces/${wsId}/subscription`),
    enabled:  !!wsId,
    retry: false,
  });

  const { data: usageData } = useQuery({
    queryKey: ['usage', wsId],
    queryFn:  () => apiClient.get<any>(`/workspaces/${wsId}/subscription/usage`),
    enabled:  !!wsId,
    retry: false,
  });

  const plan     = data?.data?.plan;
  const planSlug = plan?.slug ?? 'free';
  const usage    = usageData?.data;

  const PLAN_LABELS: Record<string, string> = { free: 'رایگان', pro: 'حرفه‌ای', enterprise: 'سازمانی' };
  const PLAN_COLORS: Record<string, any>    = { free: 'secondary', pro: 'default', enterprise: 'warning' };

  function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
    const unlimited = limit === -1;
    const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
    const color = pct >= 90 ? 'bg-[hsl(var(--destructive))]' : pct >= 70 ? 'bg-[hsl(var(--warning))]' : 'bg-[hsl(var(--primary))]';

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[hsl(var(--muted-foreground))]">{label}</span>
          <span className="font-medium tabular-nums">
            {used.toLocaleString()}{unlimited ? '' : ` / ${limit.toLocaleString()}`}
            {unlimited && ' (نامحدود)'}
          </span>
        </div>
        {!unlimited && (
          <div className="h-1.5 rounded-full bg-[hsl(var(--secondary))] overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
    );
  }

  if (isLoading) return <div className="space-y-4 max-w-lg"><Skeleton className="h-36" /><Skeleton className="h-48" /></div>;

  return (
    <div className="space-y-5 max-w-lg">
      {/* Current Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            پلن فعلی
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-black">{PLAN_LABELS[planSlug]}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 font-mono">{plan?.slug?.toUpperCase()}</p>
            </div>
            <Badge variant={PLAN_COLORS[planSlug]} className="text-sm px-3 py-1">
              {PLAN_LABELS[planSlug]}
            </Badge>
          </div>

          {plan?.features && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[hsl(var(--border))]">
              {[
                { label: 'محاسبه / ماه',    val: plan.features.calculations_month },
                { label: 'AI / ماه',         val: plan.features.ai_requests_month },
                { label: 'فضای کاری',        val: plan.features.workspaces },
                { label: 'گیگابایت فضا',    val: plan.features.storage_gb },
              ].map(({ label, val }) => (
                <div key={label} className="p-3 rounded-[var(--radius-lg)] bg-[hsl(var(--secondary)/0.5)]">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
                  <p className="font-bold mt-0.5">{val === -1 ? '∞' : val?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage */}
      {usage && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              مصرف این ماه
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageRow label="محاسبات" used={usage.calculations?.used ?? 0} limit={usage.calculations?.limit ?? 100} />
            <UsageRow label="درخواست AI" used={usage.aiRequests?.used ?? 0} limit={usage.aiRequests?.limit ?? 10} />
          </CardContent>
        </Card>
      )}

      {/* Upgrade */}
      {planSlug === 'free' && (
        <Card className="border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.03)]">
          <CardContent className="p-5 space-y-3">
            <p className="font-semibold text-sm">ارتقا به Pro</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
              محاسبات نامحدود، ۶ ماژول کیفیت توان، هوش مصنوعی مهندسی و ۵ فضای کاری
            </p>
            <button
              onClick={() => router.push(`/${locale}/billing/checkout?plan=pro`)}
              className="w-full h-9 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              ارتقا به Pro ↑
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
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
  const [activeTab, setActiveTab] = useState<Tab>('profile');

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
