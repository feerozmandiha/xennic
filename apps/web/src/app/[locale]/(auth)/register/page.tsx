import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/register-form';
import { getTranslations } from 'next-intl/server';
import { BrandPanel } from '@/features/auth/components/brand-panel';
import { ArrowLeft } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('registerTitle') };
}

export default async function RegisterPage(
  props: { params?: Promise<{ locale: string }>; searchParams?: Promise<{ plan?: string }> },
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const locale = params?.locale ?? 'fa';
  const plan = searchParams?.plan ?? null;

  return (
    <div className="min-h-screen flex">
      <BrandPanel />

      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-[hsl(var(--background))]">
        <div className="w-full max-w-[420px] animate-fade-in relative">
          {/* Back to home */}
          <Link
            href={`/${locale}`}
            className="absolute -top-12 right-0 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            بازگشت به صفحه اصلی
          </Link>

          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-8 h-8 rounded-[var(--radius)] bg-[hsl(var(--primary))] flex items-center justify-center">
              <span className="text-white font-bold text-xs">X</span>
            </div>
            <span className="font-bold">Xennic</span>
          </div>
          <RegisterForm plan={plan} />
        </div>
      </div>
    </div>
  );
}
