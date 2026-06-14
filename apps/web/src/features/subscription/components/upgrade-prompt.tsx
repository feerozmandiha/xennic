'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  feature?: string;
  variant?: 'card' | 'inline';
  className?: string;
}

export function UpgradePrompt({ feature, variant = 'card', className }: UpgradePromptProps) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  if (variant === 'inline') {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[hsl(var(--warning)/0.08)] border border-[hsl(var(--warning)/0.2)] text-xs',
        className,
      )}>
        <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--warning))] shrink-0" />
        <span>
          {feature ?? 'این قابلیت'} نیاز به پلن Pro دارد.{' '}
          <Link href={`/${locale}/billing/checkout?plan=pro`} className="underline font-semibold whitespace-nowrap">
            ارتقا دهید
          </Link>
        </span>
      </div>
    );
  }

  return (
    <Card className={cn(
      'border-[hsl(var(--warning)/0.35)] bg-gradient-to-r from-[hsl(var(--warning)/0.06)] to-[hsl(var(--primary)/0.04)]',
      className,
    )}>
      <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[hsl(var(--warning)/0.15)] flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-[hsl(var(--warning))]" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {feature ?? 'این قابلیت'} در پلن رایگان در دسترس نیست
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              برای دسترسی، پلن خود را به Pro ارتقا دهید
            </p>
          </div>
        </div>
        <Link
          href={`/${locale}/billing/checkout?plan=pro`}
          className={cn(
            'inline-flex items-center gap-2 h-9 px-5 rounded-[var(--radius)]',
            'bg-[hsl(var(--primary))] text-white text-sm font-semibold',
            'hover:opacity-90 transition-opacity shrink-0 whitespace-nowrap',
          )}
        >
          ارتقا به Pro
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </CardContent>
    </Card>
  );
}
