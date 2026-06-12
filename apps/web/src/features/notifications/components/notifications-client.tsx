'use client';

import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell, CheckCheck, Trash2, BellOff,
  Building2, UserPlus, UserMinus, FolderPlus,
  Pencil, Zap, CreditCard, Clock, FileText,
  ShieldAlert, RefreshCw,
} from 'lucide-react';
import { PageHeader }  from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge }       from '@/components/ui/badge';
import { Skeleton }    from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';
import { useToast }     from '@/stores/toast.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';

// ── Type config ───────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, {
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}> = {
  workspace_invite:         { icon: Building2,    colorClass: 'text-[hsl(var(--primary))]',     bgClass: 'bg-[hsl(var(--primary)/0.1)]' },
  workspace_member_added:   { icon: UserPlus,     colorClass: 'text-[hsl(var(--success))]',     bgClass: 'bg-[hsl(var(--success)/0.1)]' },
  workspace_member_removed: { icon: UserMinus,    colorClass: 'text-[hsl(var(--destructive))]', bgClass: 'bg-[hsl(var(--destructive)/0.1)]' },
  project_added:            { icon: FolderPlus,   colorClass: 'text-[hsl(var(--primary))]',     bgClass: 'bg-[hsl(var(--primary)/0.1)]' },
  project_updated:          { icon: Pencil,       colorClass: 'text-[hsl(var(--warning))]',     bgClass: 'bg-[hsl(var(--warning)/0.1)]' },
  calculation_complete:     { icon: Zap,          colorClass: 'text-[hsl(var(--success))]',     bgClass: 'bg-[hsl(var(--success)/0.1)]' },
  subscription_changed:     { icon: CreditCard,   colorClass: 'text-[hsl(var(--primary))]',     bgClass: 'bg-[hsl(var(--primary)/0.1)]' },
  subscription_expiring:    { icon: Clock,        colorClass: 'text-[hsl(var(--warning))]',     bgClass: 'bg-[hsl(var(--warning)/0.1)]' },
  file_shared:              { icon: FileText,     colorClass: 'text-[hsl(var(--accent))]',      bgClass: 'bg-[hsl(var(--accent)/0.1)]' },
  security_alert:           { icon: ShieldAlert,  colorClass: 'text-[hsl(var(--destructive))]', bgClass: 'bg-[hsl(var(--destructive)/0.1)]' },
  system:                   { icon: Bell,         colorClass: 'text-[hsl(var(--muted-foreground))]', bgClass: 'bg-[hsl(var(--secondary))]' },
};

function getConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.system;
}

// ── Notification Item ─────────────────────────────────────────────────────────

function NotificationItem({ notif, onRead, onDelete }: {
  notif: any;
  onRead:   (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { icon: Icon, colorClass, bgClass } = getConfig(notif.type);
  const timeAgo = getTimeAgo(new Date(notif.createdAt));

  return (
    <div className={cn(
      'flex items-start gap-4 px-5 py-4 transition-colors',
      'border-b border-[hsl(var(--border))] last:border-0',
      !notif.isRead && 'bg-[hsl(var(--primary)/0.025)]',
    )}>
      {/* Icon */}
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        bgClass,
      )}>
        <Icon className={cn('h-4 w-4', colorClass)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={cn('text-sm truncate', !notif.isRead && 'font-semibold')}>
              {notif.title}
            </p>
            {notif.body && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 line-clamp-2">
                {notif.body}
              </p>
            )}
          </div>
          {!notif.isRead && (
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] shrink-0 mt-1.5" />
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{timeAgo}</span>
          <div className="flex items-center gap-1">
            {!notif.isRead && (
              <button
                onClick={() => onRead(notif.id)}
                className="p-1 rounded hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                title="علامت‌گذاری خوانده‌شده"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => onDelete(notif.id)}
              className="p-1 rounded hover:bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
              title="حذف"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Time ago helper ────────────────────────────────────────────────────────────

function getTimeAgo(date: Date): string {
  const now   = new Date();
  const diff  = now.getTime() - date.getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins < 1)    return 'همین الان';
  if (mins < 60)   return `${mins} دقیقه پیش`;
  if (hours < 24)  return `${hours} ساعت پیش`;
  if (days < 7)    return `${days} روز پیش`;
  return date.toLocaleDateString('fa-IR');
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function NotificationsClient() {
  const t           = useTranslations('notifications');
  const wsId        = useAuthStore(s => s.workspaceId);
  const toast       = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', wsId],
    queryFn:  () => apiClient.get<any>('/notifications?limit=50'),
    enabled:  !!wsId,
    retry: false,
    staleTime: 30_000,
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notif-unread', wsId],
    queryFn:  () => apiClient.get<{ success: boolean; data: { unread: number } }>('/notifications/unread-count'),
    enabled:  !!wsId,
    retry: false,
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notif-unread'] });
    },
    onError: () => toast.error('خطا در بروزرسانی'),
  });

  const readAllMutation = useMutation({
    mutationFn: () => apiClient.post('/notifications/read-all', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notif-unread'] });
      toast.success('همه اعلان‌ها خوانده شد');
    },
    onError: () => toast.error('خطا'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notif-unread'] });
    },
    onError: () => toast.error('خطا در حذف'),
  });

  const notifications = data?.data ?? [];
  const unread        = unreadData?.data?.unread ?? 0;

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={unread > 0 ? `${unread} اعلان خوانده‌نشده` : 'همه اعلان‌ها خوانده شده'}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="h-8 w-8 inline-flex items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition-colors"
              title="بروزرسانی"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            {unread > 0 && (
              <button
                onClick={() => readAllMutation.mutate()}
                disabled={readAllMutation.isPending}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius)] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))] transition-colors disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" />
                خواندن همه
              </button>
            )}
          </div>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-start gap-4 px-5 py-4 border-b border-[hsl(var(--border))] last:border-0">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : notifications.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            {notifications.map((notif: any) => (
              <NotificationItem
                key={notif.id}
                notif={notif}
                onRead={id => readMutation.mutate(id)}
                onDelete={id => deleteMutation.mutate(id)}
              />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center mb-4">
              <BellOff className="h-7 w-7 text-[hsl(var(--muted-foreground))] opacity-50" />
            </div>
            <h3 className="font-semibold text-base mb-1">اعلانی وجود ندارد</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">
              اعلان‌های شما اینجا نمایش داده می‌شوند
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
