'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserStatus } from '@/components/layout/user-status';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';  // ✅ استفاده از کامپوننت اصلی

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'دانشنامه', href: `/${locale}/knowledge` },
    { label: 'درباره ما', href: `/${locale}/about` },
    { label: 'تماس',      href: `/${locale}/contact` },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <header className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[hsl(var(--background)/0.85)] backdrop-blur-xl border-b border-[hsl(var(--border))] shadow-lg'
          : 'bg-transparent',
      )}>
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-[0_0_16px_hsl(var(--primary)/0.3)]">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[hsl(var(--foreground))] tracking-wide text-lg">Xennic</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className="px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--secondary))] transition-all">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />  {/* ✅ استفاده از کامپوننت اصلی */}
            <UserStatus />
          </div>

          <button onClick={() => setOpen(o => !o)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-colors">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden bg-[hsl(var(--background)/0.98)] border-b border-[hsl(var(--border))] px-5 pb-5 space-y-1 animate-slide-down">
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--secondary))] transition-all">
                {l.label}
              </Link>
            ))}
            <div className="pt-3 flex items-center gap-2 border-t border-[hsl(var(--border))]">
              <LanguageSwitcher />
              <ThemeToggle />  {/* ✅ استفاده از کامپوننت اصلی */}
            </div>
            <UserStatus variant="mobile" />
          </div>
        )}
      </header>

      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-5 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-[hsl(var(--foreground))] tracking-wide">Xennic</span>
            </div>
            <nav className="flex items-center gap-4">
              {links.map(l => (
                <Link key={l.href} href={l.href}
                  className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
            <p className="text-xs text-[hsl(var(--muted-foreground))] opacity-60">© 2025 Xennic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}