import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/features/auth/components/login-form';
import { AuthShell } from '@/features/auth/components/auth-shell';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('loginTitle') };
}

export default async function LoginPage(props: {
  params?: Promise<{ locale: string }>;
  searchParams?: Promise<{ redirectTo?: string; plan?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const _locale = params?.locale ?? 'fa';
  const redirectTo = searchParams?.redirectTo ?? null;
  const plan = searchParams?.plan ?? null;

  return (
    <AuthShell title="ورود به حساب کاربری" subtitle="برای ادامه به حساب زنیک خود وارد شوید">
      <LoginForm redirectTo={redirectTo} plan={plan} />
    </AuthShell>
  );
}
