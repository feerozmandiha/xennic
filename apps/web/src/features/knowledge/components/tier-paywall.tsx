'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Lock, Sparkles, Building2 } from 'lucide-react';
import { TIER_BADGE_COLORS, TIER_LABEL_FA, type AccessTier } from '../lib/access-tiers';

interface Props {
  required: AccessTier;
  /** short teaser/excerpt shown above the paywall, if any */
  teaser?: string;
  /** current user's tier (resolved via useKnowledgeTier) */
  current?: AccessTier;
  isLoading?: boolean;
}

/**
 * Shown when a logged-in user tries to read an article above their plan.
 * Shows the article teaser (if provided) and an upgrade card.
 */
export function TierPaywall({ required, teaser, current, isLoading }: Props) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-sm text-muted-foreground">
        در حال بررسی دسترسی...
      </div>
    );
  }

  const isEnterprise = required === 'enterprise';
  const upgradeHref = `/${locale}/dashboard/billing`;

  return (
    <div className="max-w-3xl mx-auto py-10">
      {teaser ? (
        <article className="prose prose-sm max-w-none dark:prose-invert mb-8 blur-[2px] select-none pointer-events-none">
          <div dangerouslySetInnerHTML={{ __html: teaser }} />
        </article>
      ) : null}

      <div className="relative rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--muted)/0.3)] p-8 text-center shadow-xl">
        <div
          className={`mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${TIER_BADGE_COLORS[required]}`}
        >
          <Lock className="h-3.5 w-3.5" />
          محتوای {TIER_LABEL_FA[required]}
        </div>

        <h2 className="mt-5 text-xl font-bold">
          {isEnterprise ? 'این دانشنامه برای سازمان‌هاست' : 'برای ادامه، پلن خود را ارتقا دهید'}
        </h2>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
          {isEnterprise
            ? 'این محتوا شامل تحلیل‌های پیشرفته، رویه‌های سازمانی و استانداردهای تخصصی است. برای دسترسی کامل، پلن سازمانی را فعال کنید.'
            : 'شما در حال مشاهده‌ی نسخه‌ی پیش‌نمایش این مقاله هستید. برای دسترسی کامل به این بخش، پلن حرفه‌ای را فعال کنید.'}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={upgradeHref}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[hsl(var(--primary)/0.25)] transition-transform hover:-translate-y-0.5"
          >
            {isEnterprise ? (
              <>
                <Building2 className="h-4 w-4" />
                ارتباط با فروش سازمانی
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                ارتقا به پلن Pro
              </>
            )}
          </Link>
          <Link
            href={`/${locale}/knowledge`}
            className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
          >
            بازگشت به دانشنامه
          </Link>
        </div>

        {current ? (
          <p className="mt-5 text-[11px] text-[hsl(var(--muted-foreground))]">
            سطح دسترسی فعلی شما:{' '}
            <span className={`font-semibold ${TIER_BADGE_COLORS[current]}`}>
              {TIER_LABEL_FA[current]}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
