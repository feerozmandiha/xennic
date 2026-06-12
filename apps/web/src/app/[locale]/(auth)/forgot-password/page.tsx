import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { BrandPanel } from '@/features/auth/components/brand-panel';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('forgotPassword') };
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      <BrandPanel />
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-[hsl(var(--background))]">
        <div className="w-full max-w-[380px] animate-fade-in">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
