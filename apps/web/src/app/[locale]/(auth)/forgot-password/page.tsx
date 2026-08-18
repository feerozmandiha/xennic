import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { AuthShell } from '@/features/auth/components/auth-shell';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('forgotPassword') };
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="بازیابی رمز عبور"
      subtitle="ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
