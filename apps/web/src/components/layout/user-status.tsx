'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api/client';

interface UserStatusProps {
  theme?: 'light' | 'dark';
  variant?: 'header' | 'mobile';
}

export function UserStatus({ theme = 'light', variant = 'header' }: UserStatusProps) {
  const router   = useRouter();
  const params   = useParams();
  const locale   = (params?.locale as string) ?? 'fa';
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const t        = useTranslations('nav');
  const isDark   = theme === 'dark';

  if (!isAuthenticated || !user) {
    if (variant === 'mobile') {
      return (
        <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
          <Link href={`/${locale}/login`}    className="block px-4 py-2.5 text-sm text-center text-white/70 border border-white/10 rounded-lg hover:bg-white/5 transition-all">
            ورود
          </Link>
          <Link href={`/${locale}/register`} className="block px-4 py-2.5 text-sm font-semibold text-center rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white">
            شروع رایگان
          </Link>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/${locale}/login`}
          className={cn(
            'px-4 py-2 text-sm transition-colors',
            isDark
              ? 'text-white/70 hover:text-white'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
          )}
        >
          ورود
        </Link>
        <Link
          href={`/${locale}/register`}
          className={cn(
            'px-4 py-2 text-sm font-semibold rounded-lg transition-opacity',
            isDark
              ? 'bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white hover:opacity-90 shadow-[0_0_16px_rgba(99,102,241,0.3)]'
              : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90',
          )}
        >
          شروع رایگان
        </Link>
      </div>
    );
  }

  const initials = [user.firstName?.[0], user.lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || 'U';

  if (variant === 'mobile') {
    return (
      <div className="pt-3 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[hsl(var(--primary)/0.3)] border border-[hsl(var(--primary)/0.4)]">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-white/50 truncate">{user.email}</p>
          </div>
        </div>
        <Link href={`/${locale}/dashboard`} className="block px-4 py-2.5 text-sm text-white/70 rounded-lg hover:bg-white/5 transition-all">
          داشبورد
        </Link>
        <Link href={`/${locale}/settings`} className="block px-4 py-2.5 text-sm text-white/70 rounded-lg hover:bg-white/5 transition-all">
          تنظیمات
        </Link>
        <button
          onClick={() => { clearAuth(); router.push(`/${locale}`); }}
          className="w-full text-right px-4 py-2.5 text-sm text-red-400 rounded-lg hover:bg-white/5 transition-all"
        >
          خروج از سیستم
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={cn(
          'flex items-center gap-2 rounded-[var(--radius)] px-2 py-1.5',
          'text-sm transition-colors',
          isDark
            ? 'text-white/70 hover:text-white hover:bg-white/5'
            : 'hover:bg-[hsl(var(--secondary))]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]',
        )}>
          <div className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
            'bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.2)]',
          )}>
            <span className="text-[11px] font-bold text-[hsl(var(--primary))]">
              {initials}
            </span>
          </div>
          <span className="hidden sm:block max-w-[90px] truncate text-sm font-medium">
            {user.firstName}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
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
          <div className="px-3 py-2.5 mb-1 rounded-[var(--radius)] bg-[hsl(var(--secondary)/0.5)]">
            <p className="text-xs font-semibold truncate">{user.firstName} {user.lastName}</p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] truncate mt-0.5">{user.email}</p>
          </div>

          <DropdownMenu.Item
            className={menuItem}
            onSelect={() => router.push(`/${locale}/dashboard`)}
          >
            <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
            داشبورد
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className={menuItem}
            onSelect={() => router.push(`/${locale}/settings`)}
          >
            <User className="h-3.5 w-3.5 shrink-0" />
            {t('settings')}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-[hsl(var(--border))]" />

          <DropdownMenu.Item
            onSelect={async () => {
              try { await apiClient.post('/auth/logout'); } catch { /* ignore */ }
              clearAuth();
              router.push(`/${locale}`);
            }}
            className={cn(menuItem, 'text-[hsl(var(--destructive))] data-[highlighted]:bg-[hsl(var(--destructive)/0.08)]')}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            خروج از سیستم
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

const menuItem = cn(
  'flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-sm cursor-pointer select-none w-full',
  'transition-colors duration-100',
  'focus:outline-none',
  'data-[highlighted]:bg-[hsl(var(--secondary))]',
);
