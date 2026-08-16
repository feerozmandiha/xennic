'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Zap, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserStatus } from '@/components/layout/user-status';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { BlockRenderer } from '../blocks/cms-renderer';
import { DEFAULT_HEADER } from '../lib/default-content';
import { useCmsContent } from './cms-hero';
import type { CmsBlock } from '../lib/types';

export function CmsHeader() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const { document } = useCmsContent('site/header', locale);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const doc = document ?? DEFAULT_HEADER;
  const navLinks = (doc.blocks.find((b) => b.type === 'nav-links')?.props.links ?? []) as {
    label: string;
    href: string;
  }[];

  const links = navLinks.map((l) => ({
    label: l.label,
    href: l.href.startsWith('/') ? `/${locale}${l.href === '/' ? '' : l.href}` : l.href,
  }));

  const buttonsBlock = doc.blocks.find((b) => b.type === 'buttons');

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[hsl(var(--background)/0.9)] backdrop-blur-xl border-b border-[hsl(var(--border))] shadow-lg'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] shadow-[0_0_16px_hsl(var(--primary)/0.3)]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wide text-[hsl(var(--foreground))]">
            Xennic
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] transition-all hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <UserStatus />
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))] md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="animate-slide-down space-y-1 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.98)] px-5 pb-5 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))] transition-all hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]"
            >
              {l.label}
            </Link>
          ))}
          {buttonsBlock ? (
            <div className="space-y-2 pt-3">
              {buttonsBlock.children?.map((c) => (
                <BlockRenderer key={c.id} block={c as CmsBlock} />
              ))}
            </div>
          ) : null}
          <div className="flex items-center gap-2 border-t border-[hsl(var(--border))] pt-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <UserStatus variant="mobile" />
        </div>
      ) : null}
    </header>
  );
}
