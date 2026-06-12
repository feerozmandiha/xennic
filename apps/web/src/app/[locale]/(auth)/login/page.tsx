import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';
import { getTranslations } from 'next-intl/server';
import { BrandPanel } from '@/features/auth/components/brand-panel';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('loginTitle') };
}

export default async function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/*
        چرا BrandPanel اول است؟
        ─────────────────────────────────────────────────────
        در HTML: order طبیعی [BrandPanel | Form]

        مرورگر در RTL (fa):
          flex از راست شروع می‌کند → BrandPanel سمت راست ✅
          Form سمت چپ ✅

        مرورگر در LTR (en):
          flex از چپ شروع می‌کند → BrandPanel سمت چپ ✅
          Form سمت راست ✅

        نتیجه: بدون هیچ CSS اضافه، هر دو حالت درست است ✅
      */}
      <BrandPanel />

      {/* فرم — همیشه دوم در HTML */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-[hsl(var(--background))]">
        <div className="w-full max-w-[380px] animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-8 h-8 rounded-[var(--radius)] bg-[hsl(var(--primary))] flex items-center justify-center">
              <span className="text-white font-bold text-xs">X</span>
            </div>
            <span className="font-bold">Xennic</span>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
