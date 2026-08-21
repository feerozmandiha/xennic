'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Zap, ArrowLeft } from 'lucide-react';
import { useCmsContent } from '@/features/cms/components/cms-hero';
import { CmsDocumentRenderer } from '@/features/cms/blocks/cms-renderer';

/**
 * AuthShell — لایه‌ی مشترک صفحات ورود/عضویت.
 *
 * نیمه‌ی چپ (دسکتاپ) از slot با نام `auth/brand` از CMS تغذیه می‌شود و در
 * صورت نبود محتوا، یک پنل برند پیش‌فرض زیبا نشان می‌دهد. نیمه‌ی راست
 * فرم ورود/عضویت را در یک کارت مدرن نمایش می‌دهد.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const { document, hasOverride } = useCmsContent('auth/brand', locale);

  return (
    <div className="relative min-h-screen bg-[hsl(var(--background))]">
      {/* پس‌زمینه‌ی زینتی */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-1/3 h-96 w-96 rounded-full bg-[hsl(var(--primary)/0.15)] blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-[hsl(var(--accent)/0.12)] blur-3xl" />
      </div>

      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 60%, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px, 60px 60px',
            }}
          />
          <div className="relative">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2.5 text-white/90 hover:text-white transition"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-wide">Xennic</span>
            </Link>
          </div>

          <div className="relative max-w-md space-y-6">
            {hasOverride && document?.blocks.length ? (
              <div className="cms-auth-brand [&_h2]:!text-white [&_p]:!text-white/80 [&_li]:!text-white/90">
                <CmsDocumentRenderer document={document} />
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-black leading-snug">پلتفرم تخصصی مهندسی برق</h2>
                <p className="text-white/80 leading-8">
                  محاسبات استاندارد، کیفیت توان و هوش مصنوعی مهندسی در یک فضای کاری یکپارچه.
                </p>
                <ul className="space-y-3 text-sm text-white/90">
                  {[
                    '۸۰+ محاسبه‌گر استاندارد IEC/IEEE',
                    'مشاور هوش مصنوعی برای طراحی و عیب‌یابی',
                    'مدیریت پروژه و همکاری تیمی',
                    'گزارش‌های حرفه‌ای PDF',
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                        ✓
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <p className="relative text-[11px] text-white/50">
            © {new Date().getFullYear()} Xennic Platform
          </p>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-[420px] animate-fade-in space-y-6">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
            >
              <ArrowLeft className="h-4 w-4" />
              بازگشت به صفحه اصلی
            </Link>

            {/* لوگو موبایل */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Xennic</span>
            </div>

            <div className="space-y-1.5">
              {title ? <h1 className="text-2xl font-black tracking-tight">{title}</h1> : null}
              {subtitle ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{subtitle}</p>
              ) : null}
            </div>

            {children}

            {footer ? <div className="pt-2">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
