'use client';

import { API_BASE } from '@/lib/api/client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/stores/toast.store';
import { handlePostLogin } from '@/features/auth/hooks/use-post-login';

export function LoginForm({
  redirectTo,
  plan: initialPlan,
}: {
  redirectTo?: string | null;
  plan?: string | null;
}) {
  const t = useTranslations('auth');
  const tErr = useTranslations('errors');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const setAuth = useAuthStore((s) => s.setAuth);
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError(tErr('required'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'user-agent': 'xennic-web/1.0' },
        body: JSON.stringify({ email, password }),
      });
      const text = await response.text();
      const res = JSON.parse(text);

      if (res.success && res.data) {
        toast.success(
          'ورود موفق',
          `خوش آمدید، ${res.data.user.firstName} ${res.data.user.lastName}`,
        );
        setAuth(res.data.accessToken, res.data.refreshToken, res.data.user);

        if (initialPlan && initialPlan !== 'free') {
          localStorage.setItem('xennic_selected_plan', initialPlan);
        }

        const effectivePlan =
          initialPlan ||
          (typeof window !== 'undefined' ? localStorage.getItem('xennic_selected_plan') : null);

        await handlePostLogin(
          useAuthStore.getState().setWorkspace,
          API_BASE,
          res.data.accessToken,
          useAuthStore.getState().setIsAdmin,
        );

        if (effectivePlan) localStorage.removeItem('xennic_selected_plan');

        if (redirectTo) router.push(decodeURIComponent(redirectTo));
        else if (effectivePlan && effectivePlan !== 'free')
          router.push(`/${locale}/billing/checkout?plan=${effectivePlan}`);
        else router.push(`/${locale}/dashboard`);
      } else {
        const msg = res.error?.message ?? '';
        if (msg.toLowerCase().includes('inactive')) {
          setError('حساب کاربری غیرفعال است. با پشتیبانی تماس بگیرید.');
        } else {
          setError(t('invalidCredentials'));
        }
      }
    } catch (err: any) {
      if (err?.code === 'NETWORK_ERROR' || err?.message?.includes('connect')) {
        setError('اتصال به سرور ممکن نیست');
      } else {
        setError(t('invalidCredentials'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error ? (
        <div className="animate-fade-in rounded-xl border border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.08)] px-3.5 py-2.5 text-center text-sm text-[hsl(var(--destructive))]">
          {error}
        </div>
      ) : null}

      <Field
        icon={<Mail className="h-4 w-4" />}
        type="email"
        label={t('email')}
        placeholder={t('emailPlaceholder')}
        value={email}
        onChange={setEmail}
        autoComplete="email"
        disabled={loading}
      />

      <Field
        icon={<Lock className="h-4 w-4" />}
        type={showPass ? 'text' : 'password'}
        label={t('password')}
        placeholder={t('passwordPlaceholder')}
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        disabled={loading}
        endIcon={
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            tabIndex={-1}
            className="text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]"
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input type="checkbox" className="h-3.5 w-3.5 rounded border-[hsl(var(--border))]" />
          <span className="text-[hsl(var(--muted-foreground))]">مرا به خاطر بسپار</span>
        </label>
        <Link
          href={`/${locale}/forgot-password`}
          className="font-medium text-[hsl(var(--primary))] hover:underline"
        >
          {t('forgotPassword')}
        </Link>
      </div>

      <Button
        type="submit"
        className="group relative w-full overflow-hidden"
        size="lg"
        loading={loading}
      >
        {loading ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            در حال ورود…
          </>
        ) : (
          t('loginButton')
        )}
      </Button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[hsl(var(--border))]" />
        </div>
        <div className="relative flex justify-center text-[10px]">
          <span className="bg-[hsl(var(--background))] px-3 text-[hsl(var(--muted-foreground))]">
            یا
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
        {t('noAccount')}{' '}
        <Link
          href={`/${locale}/register`}
          className="font-semibold text-[hsl(var(--primary))] hover:underline"
        >
          {t('register')}
        </Link>
      </p>
    </form>
  );
}

function Field({
  icon,
  endIcon,
  label,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  disabled,
}: {
  icon: React.ReactNode;
  endIcon?: React.ReactNode;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[hsl(var(--foreground))]">{label}</span>
      <div className="group relative">
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--primary))]">
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          dir="ltr"
          className="h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-10 text-sm outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] disabled:opacity-50"
        />
        {endIcon ? (
          <span className="absolute inset-y-0 left-3 flex items-center">{endIcon}</span>
        ) : null}
      </div>
    </label>
  );
}
