'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Zap } from 'lucide-react';
import { BlockRenderer } from '../blocks/cms-renderer';
import { useCmsContent } from './cms-hero';
import type { CmsBlock } from '../lib/types';

/**
 * CmsFooter — فوتر کاملاً CMS-محور با پشتیبانی از بلوک‌های تمام‌عرض
 *
 * - اگر اولین/تنها بلوک یک `columns` باشد، ستون‌ها به‌صورت گرید نمایش داده می‌شوند.
 * - بلوک‌هایی که `style.maxWidth === 'full'` یا `props.fullWidth` دارند،
 *   تمام عرض را اشغال می‌کنند (مثلاً خبرنامه، CTA).
 * - اگر هنوز محتوایی منتشر نشده باشد، فقط نوار کپی‌رایت نمایش داده می‌شود.
 */
export function CmsFooter() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const { document, hasOverride } = useCmsContent('site/footer', locale);
  const year = new Date().getFullYear();

  const hasContent = !!document && document.blocks.length > 0;

  return (
    <footer className="mt-20 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]">
      {hasContent ? (
        <>
          <div className="mx-auto w-full max-w-7xl px-6 py-14 space-y-10">
            {document!.blocks.map((b) => renderFooterBlock(b))}
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

function renderFooterBlock(b: CmsBlock) {
  // Full-width blocks use their own layout (e.g. newsletter, cta, html).
  if (b.props?.fullWidth === true || b.style?.maxWidth === 'full') {
    return <BlockRenderer key={b.id} block={b} />;
  }
  // A direct `columns` block controls its own grid — render as-is, but
  // with no extra wrapper so it can use the full footer width.
  if (b.type === 'columns') {
    return <BlockRenderer key={b.id} block={b} />;
  }
  // Any other direct child is placed in a responsive grid too so
  // users can add nav-link / footer-column / paragraph / etc. freely.
  return (
    <div key={b.id} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <BlockRenderer block={b} />
    </div>
  );
}

function CopyrightBar({ year, locale }: { year: number; locale: string }) {
  return (
    <div className="border-t border-[hsl(var(--border))]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-[hsl(var(--muted-foreground))] md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span>© {year} Xennic. تمامی حقوق محفوظ است.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/privacy`}
            className="hover:text-[hsl(var(--foreground))] transition-colors"
          >
            حریم خصوصی
          </Link>
          <Link
            href={`/${locale}/terms`}
            className="hover:text-[hsl(var(--foreground))] transition-colors"
          >
            شرایط استفاده
          </Link>
        </div>
      </div>
    </div>
  );
}
