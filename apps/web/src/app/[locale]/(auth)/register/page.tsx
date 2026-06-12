import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/register-form';
import { getTranslations } from 'next-intl/server';
import { BrandPanel } from '@/features/auth/components/brand-panel';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('registerTitle') };
}

export default async function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* BrandPanel اول = RTL سمت راست | LTR سمت چپ */}
      <BrandPanel />

      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-[hsl(var(--background))]">
        <div className="w-full max-w-[420px] animate-fade-in">
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-8 h-8 rounded-[var(--radius)] bg-[hsl(var(--primary))] flex items-center justify-center">
              <span className="text-white font-bold text-xs">X</span>
            </div>
            <span className="font-bold">Xennic</span>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
