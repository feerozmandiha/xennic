'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Zap } from 'lucide-react';
import { BlockRenderer } from '../blocks/cms-renderer';
import { useCmsContent } from './cms-hero';
import type { CmsBlock } from '../lib/types';

/**
 * CmsFooter — فوتر کاملاً CMS-محور
 *
 * - بلوک‌های `columns` یا بلوک‌هایی با `maxWidth=full` تمام عرض رندر می‌شوند.
 * - بقیه بلوک‌های سطح ریشه در یک گرید واکنش‌گرای مشترک قرار می‌گیرند.
 */
export function CmsFooter() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const { document, hasOverride } = useCmsContent('site/footer', locale);
  const year = new Date().getFullYear();

  const hasContent = !!document && document.blocks.length > 0;
  const blocks = hasContent ? document!.blocks : [];

  const inline: CmsBlock[] = [];
  const standalone: CmsBlock[] = [];
  for (const b of blocks) {
    if (b.props?.fullWidth === true || b.style?.maxWidth === 'full' || b.type === 'columns') {
      standalone.push(b);
    } else {
      inline.push(b);
    }
  }

  return (
    <footer className="mt-20 w-full border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
      {hasContent ? (
        <>
          <div className="mx-auto w-full max-w-[1400px] px-4 py-14 sm:px-6 lg:px-8 space-y-10">
            {standalone.map((b) => (
              <BlockRenderer key={b.id} block={b} />
            ))}
            {inline.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {inline.map((b) => (
                  <BlockRenderer key={b.id} block={b} />
                ))}
              </div>
            ) : null}
          </div>
          <CopyrightBar year={year} locale={locale} />
        </>
      ) : (
        <div className="mx-auto w-full max-w-7xl px-6 py-10 text-center space-y-3">
          {hasOverride ? null : (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              فوتر هنوز محتوایی ندارد. از پنل مدیریت → مدیریت محتوا (CMS) → فوتر سایت آن را بسازید.
            </p>
          )}
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              © {year} Xennic. تمامی حقوق محفوظ است.
            </span>
          </div>
        </div>
      )}
    </footer>
  );
}

function CopyrightBar({ year, locale }: { year: number; locale: string }) {
  return (
    <div className="w-full border-t border-[hsl(var(--border))]">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-[hsl(var(--muted-foreground))] sm:px-6 md:flex-row lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span>© {year} Xennic. تمامی حقوق محفوظ است.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/privacy`}
            className="transition-colors hover:text-[hsl(var(--foreground))]"
          >
            حریم خصوصی
          </Link>
          <Link
            href={`/${locale}/terms`}
            className="transition-colors hover:text-[hsl(var(--foreground))]"
          >
            شرایط استفاده
          </Link>
        </div>
      </div>
    </div>
  );
}
