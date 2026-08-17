'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BlockRenderer } from '../blocks/cms-renderer';
import { useCmsContent } from './cms-hero';

/**
 * CmsFooter — فوتر کاملاً CMS-محور
 *
 * محتوای فوتر از slot به نام `site/footer` خوانده می‌شود.
 * اگر هنوز هیچ محتوایی منتشر نشده باشد، فقط نوار کپی‌رایت پایین نمایش
 * داده می‌شود تا کاربر بتواند از پنل CMS ساختار فوتر را خودش بچیند.
 */
export function CmsFooter() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const { document, hasOverride } = useCmsContent('site/footer', locale);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {document && document.blocks.length > 0 ? (
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {document.blocks.map((b) => (
              <BlockRenderer key={b.id} block={b} />
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-6 text-xs text-[hsl(var(--muted-foreground))] md:flex-row">
            <span>© {year} Xennic. تمامی حقوق محفوظ است.</span>
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/privacy`} className="hover:text-[hsl(var(--foreground))]">
                حریم خصوصی
              </Link>
              <Link href={`/${locale}/terms`} className="hover:text-[hsl(var(--foreground))]">
                شرایط استفاده
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-6 py-10 text-center">
          {hasOverride ? null : (
            <p className="mb-3 text-xs text-[hsl(var(--muted-foreground))]">
              فوتر هنوز محتوایی ندارد. از پنل مدیریت → مدیریت محتوا (CMS) → فوتر سایت آن را بسازید.
            </p>
          )}
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            © {year} Xennic. تمامی حقوق محفوظ است.
          </span>
        </div>
      )}
    </footer>
  );
}
