'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { handlePostLogin } from '@/features/auth/hooks/use-post-login';

const API_BASE = typeof window !== 'undefined'
  ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`
  : `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`;

export function RegisterForm({ plan: initialPlan }: { plan?: string | null }) {
  const t      = useTranslations('auth');
  const tErr   = useTranslations('errors');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const setAuth = useAuthStore(s => s.setAuth);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = tErr('required');
    if (!form.lastName.trim())  e.lastName  = tErr('required');
    if (!form.email.trim())     e.email     = tErr('required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = tErr('invalidEmail');
    if (!form.password) {
      e.password = tErr('required');
    } else if (form.password.length < 8) {
      e.password = tErr('minLength').replace('{min}', '8');
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(form.password)) {
      e.password = t('passwordHint');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent':   'xennic-web/1.0',
        },
        body: JSON.stringify(form),
      });

      const text = await response.text();
      let json: any;
      try { json = JSON.parse(text); }
      catch { setErrors({ submit: 'خطا در پردازش پاسخ سرور' }); return; }

      if (json.success && json.data) {
        setAuth(json.data.accessToken, json.data.refreshToken, json.data.user);

        // ذخیره پلن مورد نظر برای هدایت پس از ثبت‌نام
        if (initialPlan && initialPlan !== 'free') {
          localStorage.setItem('xennic_selected_plan', initialPlan);
        }

        // workspace setup
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
        // خطای validation از NestJS
        const msg = json.error?.message ?? json.message ?? 'خطا در ثبت‌نام';
        // اگر خطای validation است، پیام فارسی نشان دهیم
        if (msg.toLowerCase().includes('validation') || msg.toLowerCase().includes('password')) {
          setErrors({ submit: t('passwordHint') });
        } else if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('already exists')) {
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

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Card>
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="flex justify-center">
          <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <CardTitle className="text-xl">{t('registerTitle')}</CardTitle>
        <CardDescription>{t('loginSubtitle')}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {errors.submit && (
            <div className="rounded-[var(--radius)] bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] px-3 py-2 text-sm text-[hsl(var(--destructive))] text-center animate-fade-in">
              {errors.submit}
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('firstName')}
              value={form.firstName}
              onChange={set('firstName')}
              error={errors.firstName}
              required
              disabled={loading}
            />
            <Input
              label={t('lastName')}
              value={form.lastName}
              onChange={set('lastName')}
              error={errors.lastName}
              required
              disabled={loading}
            />
          </div>

          {/* Email */}
          <Input
            type="email"
            label={t('email')}
            placeholder={t('emailPlaceholder')}
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            autoComplete="email"
            required
            disabled={loading}
            dir="ltr"
          />

          {/* Password */}
          <Input
            type={showPass ? 'text' : 'password'}
            label={t('password')}
            placeholder={t('passwordPlaceholder')}
            hint={!errors.password ? t('passwordHint') : undefined}
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete="new-password"
            required
            disabled={loading}
            dir="ltr"
            endIcon={
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                tabIndex={-1}
                className="hover:text-[hsl(var(--foreground))] transition-colors"
              >
                {showPass
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye    className="h-4 w-4" />}
              </button>
            }
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            {t('registerButton')}
          </Button>

          <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            {t('hasAccount')}{' '}
            <a
              href={`/${locale}/login`}
              className="text-[hsl(var(--primary))] hover:underline font-medium"
            >
              {t('login')}
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
