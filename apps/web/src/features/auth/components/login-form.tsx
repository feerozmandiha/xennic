'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { Button }  from '@/components/ui/button';
import { Input }   from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { handlePostLogin } from '@/features/auth/hooks/use-post-login';

const API_BASE = typeof window !== 'undefined'
  ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`
  : `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`;

export function LoginForm() {
  const t      = useTranslations('auth');
  const tErr   = useTranslations('errors');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const setAuth = useAuthStore(s => s.setAuth);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError(tErr('required')); return; }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent':   'xennic-web/1.0',
        },
        body: JSON.stringify({ email, password }),
      });
      const text = await response.text();
      const res  = JSON.parse(text);

      if (res.success && res.data) {
        setAuth(res.data.accessToken, res.data.refreshToken, res.data.user);
        // workspace setup
        await handlePostLogin(
          useAuthStore.getState().setWorkspace,
          API_BASE,
          res.data.accessToken,
          useAuthStore.getState().setIsAdmin,
        );
        router.push(`/${locale}/dashboard`);
      } else {
        const msg = res.error?.message ?? '';
        if (msg.toLowerCase().includes('inactive')) {
          setError('حساب کاربری غیرفعال است. با پشتیبانی تماس بگیرید.');
        } else {
          setError(t('invalidCredentials'));
        }
      }
    } catch (err: any) {
      // CORS یا connection error
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
    <Card>
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="flex justify-center">
          <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
            <Zap className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <CardTitle className="text-xl">{t('loginTitle')}</CardTitle>
        <CardDescription>{t('loginSubtitle')}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Error */}
          {error && (
            <div className="rounded-[var(--radius)] bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] px-3 py-2 text-sm text-[hsl(var(--destructive))] text-center animate-fade-in">
              {error}
            </div>
          )}

          {/* Email */}
          <Input
            type="email"
            label={t('email')}
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
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

          {/* Forgot password */}
          <div className="flex justify-end">
            <a href={`/${locale}/forgot-password`} className="text-xs text-[hsl(var(--primary))] hover:underline">
              {t('forgotPassword')}
            </a>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            {t('loginButton')}
          </Button>

          {/* Register link */}
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            {t('noAccount')}{' '}
            <a href={`/${locale}/register`} className="text-[hsl(var(--primary))] hover:underline font-medium">
              {t('register')}
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
