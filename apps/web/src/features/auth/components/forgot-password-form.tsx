'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const API_BASE = typeof window !== 'undefined'
  ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`
  : `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`;

export function ForgotPasswordForm() {
  const t      = useTranslations('auth');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      // NestJS همیشه 202 برمی‌گرداند حتی اگر email وجود نداشته باشد
      if (res.status === 202 || res.ok) {
        setSent(true);
      } else {
        setError('خطا در ارسال ایمیل. لطفاً دوباره امتحان کنید.');
      }
    } catch {
      setError('اتصال به سرور ممکن نیست');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-[hsl(var(--success)/0.1)] flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-[hsl(var(--success))]" />
          </div>
          <div>
            <h2 className="font-bold text-base mb-1">ایمیل ارسال شد</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              اگر ایمیل <strong>{email}</strong> در سیستم ثبت شده باشد، لینک بازنشانی رمز ارسال خواهد شد.
            </p>
          </div>
          <a
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 text-sm text-[hsl(var(--primary))] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            بازگشت به ورود
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="flex justify-center">
          <div className="w-11 h-11 rounded-[var(--radius-lg)] bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
        </div>
        <CardTitle className="text-xl">{t('forgotPassword')}</CardTitle>
        <CardDescription>
          ایمیل خود را وارد کنید تا لینک بازنشانی برایتان ارسال شود
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="rounded-[var(--radius)] bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] px-3 py-2 text-sm text-[hsl(var(--destructive))] text-center animate-fade-in">
              {error}
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full h-10 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'در حال ارسال...' : 'ارسال لینک بازنشانی'}
          </button>

          <div className="text-center">
            <a
              href={`/${locale}/login`}
              className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              {t('hasAccount')} {t('login')}
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
