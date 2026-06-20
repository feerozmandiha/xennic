'use client';

import { useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, FolderKanban, Zap,
  HardDrive, Bell, Settings, ChevronLeft, Cpu,
  Menu, X, FileBarChart, MessageSquare, Shield, Network,
  Building2, Library, ShoppingCart, Search,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';

const NAV_ITEMS = [
  { key: 'search',        icon: Search,           adminOnly: false },
  { key: 'dashboard',     icon: LayoutDashboard, adminOnly: false },
  { key: 'projects',      icon: FolderKanban,    adminOnly: false },
  { key: 'workspace',     icon: Building2,       adminOnly: false },
  { key: 'engineering',   icon: Zap,             adminOnly: false },
  { key: 'power-system',  icon: Network,         adminOnly: false },
  { key: 'ai',            icon: Cpu,             adminOnly: false },
  { key: 'energy',        icon: FileBarChart,    adminOnly: false },
  { key: 'knowledge',     icon: Library,         adminOnly: false },
  { key: 'marketplace',   icon: ShoppingCart,    adminOnly: false },
  { key: 'consultations', icon: MessageSquare,   adminOnly: false },
  { key: 'storage',       icon: HardDrive,       adminOnly: false },
  { key: 'notifications', icon: Bell,            adminOnly: false },
  { key: 'settings',      icon: Settings,        adminOnly: false },
  { key: 'admin',         icon: Shield,          adminOnly: true  },
] as const;

// ── Unread Count ───────────────────────────────────────────────────────────────

function useUnreadCount() {
  const wsId = useAuthStore(s => s.workspaceId);
  const { data } = useQuery({
    queryKey:  ['notif-unread', wsId],
    queryFn:   () => apiClient.get<{ success: boolean; data: { unread: number } }>('/notifications/unread-count'),
    enabled:   !!wsId,
    refetchInterval: 30_000,  // هر ۳۰ ثانیه
    retry: false,
  });
  return data?.data?.unread ?? 0;
}

// ── Nav Item ──────────────────────────────────────────────────────────────────

function NavItem({
  navKey, icon: Icon, locale, pathname, onClick, badge,
}: {
  navKey: string; icon: React.ElementType;
  locale: string; pathname: string; onClick?: () => void; badge?: number;
}) {
  const t        = useTranslations('nav');
  // admin به route جداگانه می‌رود (خارج از dashboard layout)
  const href     = navKey === 'admin' ? `/${locale}/admin` : `/${locale}/${navKey}`;
  const isActive = pathname.includes(`/${navKey}`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm transition-all duration-150',
        'text-[hsl(var(--sidebar-foreground)/0.65)] hover:text-[hsl(var(--sidebar-foreground))]',
        'hover:bg-[hsl(var(--sidebar-muted))]',
        isActive && [
          'bg-[hsl(var(--sidebar-accent)/0.18)]',
          'text-[hsl(var(--sidebar-accent))]',
          'font-semibold',
        ],
      )}
    >
      <div className="relative shrink-0">
        <Icon className="h-4 w-4" />
        {/* Badge */}
        {badge != null && badge > 0 && (
          <span className={cn(
            'absolute -top-1.5 -end-1.5 min-w-[14px] h-[14px] px-0.5',
            'flex items-center justify-center',
            'rounded-full text-[9px] font-bold leading-none',
            'bg-[hsl(var(--destructive))] text-white',
          )}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="truncate flex-1">{t(navKey as any)}</span>
      {isActive && (
        <ChevronLeft className="h-3 w-3 opacity-40 rtl:rotate-180 shrink-0" />
      )}
    </Link>
  );
}

// ── Sidebar Content ───────────────────────────────────────────────────────────

function SidebarContent({ locale, pathname, onNavClick }: {
  locale: string; pathname: string; onNavClick?: () => void;
}) {
  const unread  = useUnreadCount();
  const isAdmin = useAuthStore(s => s.isAdmin === true);

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]">

      {/* ── Logo (clickable → landing) ──────────────────────── */}
      <Link
        href={`/${locale}`}
        className="flex items-center gap-3 px-5 py-5 border-b border-[hsl(var(--sidebar-border))] shrink-0 hover:bg-[hsl(var(--sidebar-muted))] transition-colors"
      >
        <div className={cn(
          'w-8 h-8 rounded-[var(--radius)] flex items-center justify-center shrink-0',
          'bg-[hsl(var(--sidebar-accent))] shadow-[0_0_12px_hsl(var(--sidebar-accent)/0.4)]',
        )}>
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm leading-none tracking-wide">Xennic</p>
          <p className="text-[10px] text-[hsl(var(--sidebar-foreground)/0.35)] mt-0.5 truncate">
            Engineering Platform
          </p>
        </div>
      </Link>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.filter(item => !item.adminOnly || isAdmin).map(({ key, icon }) => (
          <NavItem
            key={key}
            navKey={key}
            icon={icon}
            locale={locale}
            pathname={pathname}
            onClick={onNavClick}
            badge={key === 'notifications' ? unread : undefined}
          />
        ))}
      </nav>

      {/* ── Version ──────────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-[hsl(var(--sidebar-border))] shrink-0">
        <p className="text-[10px] text-[hsl(var(--sidebar-foreground)/0.25)] font-mono">
          v1.0.0-beta
        </p>
      </div>
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const params   = useParams();
  const locale   = (params?.locale as string) ?? 'fa';
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Desktop ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-e border-[hsl(var(--sidebar-border))]">
        <SidebarContent locale={locale} pathname={pathname} />
      </aside>

      {/* ── Mobile Trigger ──────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'lg:hidden fixed bottom-5 start-4 z-40',
          'w-12 h-12 rounded-full shadow-lg',
          'bg-[hsl(var(--primary))] text-white',
          'flex items-center justify-center',
          'transition-transform active:scale-95',
          'shadow-[0_4px_14px_hsl(var(--primary)/0.4)]',
        )}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ── Mobile Drawer ────────────────────────────────────── */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in-fast"
            onClick={() => setOpen(false)}
          />
          <div className={cn(
            'lg:hidden fixed inset-y-0 start-0 z-50 w-72',
            'shadow-2xl animate-slide-right',
          )}>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 end-4 z-10 p-1.5 rounded-[var(--radius)] bg-[hsl(var(--sidebar-muted))] text-[hsl(var(--sidebar-foreground)/0.7)] hover:text-[hsl(var(--sidebar-foreground))] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent
              locale={locale}
              pathname={pathname}
              onNavClick={() => setOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
}
