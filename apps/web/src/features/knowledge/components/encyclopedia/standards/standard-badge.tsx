'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ORG_COLOR: Record<string, string> = {
  IEC: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  IEEE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200',
  NEC: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200',
  NEMA: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200',
};

export function StandardBadge({
  code,
  organization,
  size = 'sm',
}: {
  code: string;
  organization?: string;
  size?: 'xs' | 'sm' | 'md';
}) {
  const org =
    organization ??
    (code.includes('IEC')
      ? 'IEC'
      : code.includes('IEEE')
        ? 'IEEE'
        : code.includes('NEC')
          ? 'NEC'
          : 'IEC');
  const color = ORG_COLOR[org] ?? 'bg-gray-100 text-gray-700';
  const sizeCls =
    size === 'xs'
      ? 'text-[10px] px-1.5 py-0'
      : size === 'md'
        ? 'text-xs px-2.5 py-0.5'
        : 'text-[11px] px-2 py-0.5';
  return (
    <Badge variant="outline" className={cn('font-mono font-semibold border', color, sizeCls)}>
      {code}
    </Badge>
  );
}

export function StandardsList({
  standards,
  max = 3,
}: {
  standards: { code: string; organization?: string }[];
  max?: number;
}) {
  if (!standards?.length) return null;
  const visible = standards.slice(0, max);
  const rest = standards.length - max;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((s, i) => (
        <StandardBadge
          key={`${s.code}-${i}`}
          code={s.code}
          organization={s.organization}
          size="xs"
        />
      ))}
      {rest > 0 && <span className="text-[10px] text-muted-foreground">+{rest}</span>}
    </div>
  );
}
