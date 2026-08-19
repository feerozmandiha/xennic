'use client';

import { CmsPageView } from './cms-page';
import { CmsHeader } from './cms-header';
import { CmsFooter } from './cms-footer';
import { useCmsContent } from './cms-hero';

export function CmsLandingPage({ locale = 'fa' }: { locale?: string }) {
  const { document, hasOverride } = useCmsContent('landing/page', locale);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <CmsHeader />
      <main>
        <CmsPageView document={document} />
        {!hasOverride ? (
          <div className="pointer-events-none fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 px-3 py-1 text-[10px] text-[hsl(var(--muted-foreground))] opacity-60 shadow">
            پیش‌نمایش محتوای پیش‌فرض — برای ویرایش وارد پنل CMS شوید
          </div>
        ) : null}
      </main>
      <CmsFooter />
    </div>
  );
}
