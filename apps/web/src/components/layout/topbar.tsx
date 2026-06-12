'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Sun, Moon, Bell, ChevronDown, LogOut, User, Monitor } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { WorkspaceSelector } from '@/features/workspace/components/workspace-selector';
import { useAuthStore }  from '@/stores/auth.store';
import { useRouter, useParams } from 'next/navigation';
import { apiClient }     from '@/lib/api/client';
import { cn }            from '@/lib/utils';

// ── Unread count ───────────────────────────────────────────────────────────────

function useUnreadCount() {
  const wsId = useAuthStore(s => s.workspaceId);
  const { data } = useQuery({
    queryKey:  ['notif-unread', wsId],
    queryFn:   () => apiClient.get<{ success: boolean; data: { unread: number } }>('/notifications/unread-count'),
    enabled:   !!wsId,
    refetchInterval: 30_000,
    retry: false,
    staleTime: 15_000,
  });
  return data?.data?.unread ?? 0;
}

// ── Theme cycle: light → dark → system ────────────────────────────────────────

function ThemeButton() {
  const { theme, setTheme } = useTheme();
  const cycle = () => {
    if (theme === 'light')  setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };
  return (
    <button
      onClick={cycle}
      className="h-8 w-8 inline-flex items-center justify-center rounded-[var(--radius)] hover:bg-[hsl(var(--secondary))] transition-colors relative overflow-hidden"
      title="تغییر تم"
    >
      {/* light */}
      <Sun  className="h-4 w-4 absolute transition-all duration-200 dark:opacity-0 dark:-translate-y-4 [.system_&]:opacity-0" />
      {/* dark */}
      <Moon className="h-4 w-4 absolute transition-all duration-200 opacity-0 dark:opacity-100 dark:translate-y-0 translate-y-4" />
      {/* system */}
      <Monitor className="h-4 w-4 absolute transition-all duration-200 opacity-0 [.system_&]:opacity-100" />
    </button>
  );
}

export function Topbar() {
  const t       = useTranslations('settings');
  const tNav    = useTranslations('nav');
  const router  = useRouter();
  const params  = useParams();
  const locale  = (params?.locale as string) ?? 'fa';
  const { user, clearAuth } = useAuthStore();
  const unread  = useUnreadCount();

  async function handleLogout() {
    try { await apiClient.post('/auth/logout'); } catch { /* ignore */ }
    clearAuth();
    router.push(`/${locale}/login`);
  }

  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || 'U';

  return (
    <header className="flex items-center justify-between h-14 px-4 sm:px-5 shrink-0 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.95)] backdrop-blur-sm sticky top-0 z-30">

      {/* ── Left — Workspace Selector ─────────────────────── */}
      <WorkspaceSelector />

      {/* ── Right — Actions ──────────────────────────────── */}
      <div className="flex items-center gap-1">

        {/* Theme */}
        <ThemeButton />

        {/* Notifications */}
        <a
          href={`/${locale}/notifications`}
          className={cn(
            'relative inline-flex items-center justify-center h-8 w-8 rounded-[var(--radius)]',
            'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-colors',
          )}
          title={tNav('notifications')}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className={cn(
              'absolute top-1 end-1',
              'min-w-[16px] h-4 px-1',
              'flex items-center justify-center',
              'rounded-full text-[9px] font-bold leading-none',
              'bg-[hsl(var(--destructive))] text-white',
              'border border-[hsl(var(--background))]',
              'animate-scale-in',
            )}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </a>

        {/* User Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className={cn(
              'flex items-center gap-2 rounded-[var(--radius)] px-2 py-1.5',
              'text-sm hover:bg-[hsl(var(--secondary))] transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]',
            )}>
              {/* Avatar */}
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                'bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.2)]',
              )}>
                <span className="text-[11px] font-bold text-[hsl(var(--primary))]">
                  {initials}
                </span>
              </div>
              <span className="hidden sm:block max-w-[90px] truncate text-sm font-medium">
                {user?.firstName}
              </span>
              <ChevronDown className="h-3 w-3 text-[hsl(var(--muted-foreground))] shrink-0" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={cn(
                'z-50 min-w-[200px] rounded-[var(--radius-lg)] border border-[hsl(var(--border))]',
                'bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))]',
                'shadow-[var(--shadow-lg)] p-1.5 animate-slide-down',
              )}
              align="end"
              sideOffset={8}
            >
              {/* User info header */}
              <div className="px-3 py-2.5 mb-1 rounded-[var(--radius)] bg-[hsl(var(--secondary)/0.5)]">
                <p className="text-xs font-semibold truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] truncate mt-0.5">{user?.email}</p>
              </div>

              <DropdownMenu.Item
                className={menuItem}
                onSelect={() => router.push(`/${locale}/settings`)}
              >
                <User className="h-3.5 w-3.5 shrink-0" />
                {tNav('settings')}
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1 h-px bg-[hsl(var(--border))]" />

              <DropdownMenu.Item
                onSelect={handleLogout}
                className={cn(menuItem, 'text-[hsl(var(--destructive))] data-[highlighted]:bg-[hsl(var(--destructive)/0.08)]')}
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                خروج از سیستم
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}

const menuItem = cn(
  'flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-sm cursor-pointer select-none w-full',
  'transition-colors duration-100',
  'focus:outline-none',
  'data-[highlighted]:bg-[hsl(var(--secondary))]',
);
