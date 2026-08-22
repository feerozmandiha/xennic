'use client';

import { API_BASE } from '@/lib/api/client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { handlePostLogin } from '@/features/auth/hooks/use-post-login';

export function RegisterForm({ plan: initialPlan }: { plan?: string | null }) {
  const t = useTranslations('auth');
  const tErr = useTranslations('errors');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = tErr('required');
    if (!form.lastName.trim()) e.lastName = tErr('required');
    if (!form.email.trim()) e.email = tErr('required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = tErr('invalidEmail');
    if (!form.password) e.password = tErr('required');
    else if (form.password.length < 8) e.password = tErr('minLength').replace('{min}', '8');
    else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(form.password)
    ) {
      e.password = t('passwordHint');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'user-agent': 'xennic-web/1.0' },
        body: JSON.stringify(form),
      });
      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        setErrors({ submit: 'خطا در پردازش پاسخ سرور' });
        return;
      }

      if (json.success && json.data) {
        setAuth(json.data.accessToken, json.data.refreshToken, json.data.user);

        if (initialPlan && initialPlan !== 'free') {
          localStorage.setItem('xennic_selected_plan', initialPlan);
        }

        await handlePostLogin(
          useAuthStore.getState().setWorkspace,
          API_BASE,
          json.data.accessToken,
          useAuthStore.getState().setIsAdmin,
        );

        router.push(
          initialPlan && initialPlan !== 'free'
            ? `/${locale}/billing/checkout?plan=${initialPlan}`
            : `/${locale}/dashboard`,
        );
      } else {
        const msg = json.error?.message ?? json.message ?? 'خطا در ثبت‌نام';
        if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('email')) {
          setErrors({ submit: 'این ایمیل قبلاً ثبت شده است' });
        } else {
          setErrors({ submit: msg });
        }
      }
    } catch {
      setErrors({ submit: 'اتصال به سرور ممکن نیست. API در حال اجراست؟' });
    } finally {
      setLoading(false);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errors.submit ? (
        <div className="animate-fade-in rounded-xl border border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.08)] px-3.5 py-2.5 text-center text-sm text-[hsl(var(--destructive))]">
          {errors.submit}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Field
          icon={<User className="h-4 w-4" />}
          label={t('firstName')}
          value={form.firstName}
          onChange={set('firstName')}
          error={errors.firstName}
          disabled={loading}
        />
        <Field
          icon={<User className="h-4 w-4" />}
          label={t('lastName')}
          value={form.lastName}
          onChange={set('lastName')}
          error={errors.lastName}
          disabled={loading}
        />
      </div>

      <Field
        icon={<Mail className="h-4 w-4" />}
        type="email"
        label={t('email')}
        placeholder={t('emailPlaceholder')}
        value={form.email}
        onChange={set('email')}
        error={errors.email}
        autoComplete="email"
        disabled={loading}
      />

      <Field
        icon={<Lock className="h-4 w-4" />}
        type={showPass ? 'text' : 'password'}
        label={t('password')}
        placeholder={t('passwordPlaceholder')}
        hint={!errors.password ? t('passwordHint') : undefined}
        value={form.password}
        onChange={set('password')}
        error={errors.password}
        autoComplete="new-password"
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

      <label className="flex cursor-pointer items-start gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <input type="checkbox" required className="mt-0.5 h-3.5 w-3.5 rounded" />
        <span>
          با{' '}
          <Link href={`/${locale}/terms`} className="text-[hsl(var(--primary))] hover:underline">
            شرایط استفاده
          </Link>{' '}
          و{' '}
          <Link href={`/${locale}/privacy`} className="text-[hsl(var(--primary))] hover:underline">
            حریم خصوصی
          </Link>{' '}
          موافقم.
        </span>
      </label>

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        {loading ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            در حال ثبت…
          </>
        ) : (
          t('registerButton')
        )}
      </Button>

      <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
        {t('hasAccount')}{' '}
        <Link
          href={`/${locale}/login`}
          className="font-semibold text-[hsl(var(--primary))] hover:underline"
        >
          {t('login')}
        </Link>
      </p>
    </form>
  );
}

function Field({
  icon,
  endIcon,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  autoComplete,
  disabled,
  error,
  hint,
}: {
  icon: React.ReactNode;
  endIcon?: React.ReactNode;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[hsl(var(--foreground))]">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[hsl(var(--muted-foreground))]">
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
          dir={type === 'email' || type === 'password' ? 'ltr' : undefined}
          className={
            'h-11 w-full rounded-xl border bg-[hsl(var(--background))] px-10 text-sm outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:ring-2 disabled:opacity-50 ' +
            (error
              ? 'border-[hsl(var(--destructive))] focus:ring-[hsl(var(--destructive)/0.2)]'
              : 'border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary)/0.2)]')
          }
        />
        {endIcon ? (
          <span className="absolute inset-y-0 left-3 flex items-center">{endIcon}</span>
        ) : null}
      </div>
      {error ? (
        <p className="text-[11px] text-[hsl(var(--destructive))]">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{hint}</p>
      ) : null}
    </label>
  );
}
