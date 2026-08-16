'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Zap } from 'lucide-react';
import { BlockRenderer } from '../blocks/cms-renderer';
import { useCmsContent } from './cms-hero';

export function CmsFooter() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const { document } = useCmsContent('site/footer', locale);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_3fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">Xennic</span>
            </div>
            <p className="text-sm leading-7 text-[hsl(var(--muted-foreground))]">
              پلتفرم تخصصی مهندسی برق — محاسبات استاندارد، دانش مهندسی و هوش مصنوعی.
            </p>
          </div>
          {document ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {document.blocks.map((b) => (
                <BlockRenderer key={b.id} block={b} />
              ))}
            </div>
          ) : null}
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
    </footer>
  );
}
