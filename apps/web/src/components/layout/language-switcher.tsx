'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'fa', label: 'فارسی', dir: 'rtl' as const },
  { code: 'en', label: 'English', dir: 'ltr' as const },
];

interface LanguageSwitcherProps {
  theme?: 'light' | 'dark';
}

export function LanguageSwitcher({ theme = 'light' }: LanguageSwitcherProps) {
  const params   = useParams();
  const pathname = usePathname();
  const router   = useRouter();
  const locale   = (params?.locale as string) ?? 'fa';
  const isDark   = theme === 'dark';

  function switchTo(lang: string) {
    const newPath = pathname.replace(`/${locale}`, `/${lang}`);
    router.push(newPath);
  }

  const current = LANGUAGES.find(l => l.code === locale) ?? LANGUAGES[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={cn(
          'flex items-center gap-1.5 rounded-[var(--radius)] px-2 py-1.5 text-sm transition-colors',
          isDark
            ? 'text-white/50 hover:text-white hover:bg-white/5'
            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]',
        )}>
          <Globe className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{current.code.toUpperCase()}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-50 min-w-[120px] rounded-[var(--radius-lg)] border border-[hsl(var(--border))]',
            'bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))]',
            'shadow-[var(--shadow-lg)] p-1 animate-slide-down',
          )}
          align="end"
          sideOffset={6}
        >
          {LANGUAGES.map(lang => (
            <DropdownMenu.Item
              key={lang.code}
              onSelect={() => switchTo(lang.code)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-sm cursor-pointer select-none',
                'transition-colors data-[highlighted]:bg-[hsl(var(--secondary))]',
                'focus:outline-none',
                lang.code === locale && 'font-semibold text-[hsl(var(--primary))]',
              )}
            >
              <span className="text-xs">{lang.label}</span>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] ml-auto">
                {lang.code.toUpperCase()}
              </span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
