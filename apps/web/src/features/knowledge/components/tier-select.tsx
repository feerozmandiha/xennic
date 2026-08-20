'use client';

import {
  ACCESS_TIERS,
  TIER_BADGE_COLORS,
  TIER_DESCRIPTION_FA,
  TIER_LABEL_FA,
  type AccessTier,
} from '../lib/access-tiers';
import { cn } from '@/lib/utils';

interface Props {
  value: AccessTier;
  onChange: (tier: AccessTier) => void;
  disabled?: boolean;
}

export function TierSelect({ value, onChange, disabled }: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">سطح دسترسی</label>
      <div className="grid gap-2">
        {ACCESS_TIERS.map((tier) => {
          const active = value === tier;
          return (
            <button
              type="button"
              key={tier}
              disabled={disabled}
              onClick={() => onChange(tier)}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3 text-right transition-all',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                active
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] ring-1 ring-[hsl(var(--primary)/0.3)]'
                  : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary)/0.4)]',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  TIER_BADGE_COLORS[tier],
                )}
              >
                {TIER_LABEL_FA[tier].charAt(0)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{TIER_LABEL_FA[tier]}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
                      TIER_BADGE_COLORS[tier],
                    )}
                  >
                    {tier}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {TIER_DESCRIPTION_FA[tier]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
