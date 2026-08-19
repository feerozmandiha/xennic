'use client';

import type { LucideIcon } from 'lucide-react';
import { AlertCircle, Inbox, LoaderCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface KnowledgeQueryStateProps {
  kind: 'loading' | 'error' | 'empty';
  title?: string;
  description?: string;
  onRetry?: () => void;
  icon?: LucideIcon;
  compact?: boolean;
  className?: string;
}

const defaults = {
  loading: {
    title: 'در حال دریافت داده‌ها',
    description: 'اطلاعات فضای کاری در حال بارگذاری است.',
    icon: LoaderCircle,
  },
  error: {
    title: 'دریافت داده ناموفق بود',
    description: 'ارتباط با سرویس دانش برقرار نشد. دوباره تلاش کنید.',
    icon: AlertCircle,
  },
  empty: {
    title: 'داده‌ای برای نمایش نیست',
    description: 'برای این فضای کاری هنوز موردی ثبت نشده است.',
    icon: Inbox,
  },
} as const;

export function KnowledgeQueryState({
  kind,
  title,
  description,
  onRetry,
  icon,
  compact = false,
  className,
}: KnowledgeQueryStateProps) {
  const fallback = defaults[kind];
  const Icon = icon ?? fallback.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 text-center',
        compact ? 'min-h-32 py-5' : 'min-h-56 py-9',
        className,
      )}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      <span
        className={cn(
          'mb-3 grid place-items-center rounded-2xl bg-background shadow-sm ring-1 ring-border',
          compact ? 'size-10' : 'size-12',
        )}
      >
        <Icon
          className={cn(
            kind === 'loading' && 'animate-spin',
            kind === 'error' ? 'text-destructive' : 'text-muted-foreground',
            compact ? 'size-5' : 'size-6',
          )}
        />
      </span>
      <p className="font-semibold text-foreground">{title ?? fallback.title}</p>
      <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
        {description ?? fallback.description}
      </p>
      {kind === 'error' && onRetry ? (
        <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={onRetry}>
          <RefreshCw className="size-4" />
          تلاش دوباره
        </Button>
      ) : null}
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
