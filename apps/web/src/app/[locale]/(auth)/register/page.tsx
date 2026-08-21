import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RegisterForm } from '@/features/auth/components/register-form';
import { AuthShell } from '@/features/auth/components/auth-shell';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('registerTitle') };
}

export default async function RegisterPage(props: {
  params?: Promise<{ locale: string }>;
  searchParams?: Promise<{ plan?: string }>;
}) {
  const searchParams = await props.searchParams;
  const plan = searchParams?.plan ?? null;

  return (
    <AuthShell title="ساخت حساب کاربری" subtitle="در کمتر از یک دقیقه به جمع مهندسان زنیک بپیوندید">
      <RegisterForm plan={plan} />
    </AuthShell>
  );
}
