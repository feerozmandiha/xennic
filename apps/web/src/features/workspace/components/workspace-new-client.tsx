'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, ArrowRight, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/stores/toast.store';
import { cn } from '@/lib/utils';

export function WorkspaceNewClient() {
  const router      = useRouter();
  const params      = useParams();
  const locale      = (params?.locale as string) ?? 'fa';
  const setWorkspace = useAuthStore(s => s.setWorkspace);
  const toast       = useToast();
  const queryClient = useQueryClient();

  const [name, setName]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState('');

  const isValid = name.trim().length >= 2 && name.trim().length <= 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await apiClient.post<any>('/workspaces', { name: name.trim() });
      const ws  = res.data;

      setWorkspace(ws.id);
      queryClient.invalidateQueries({ queryKey: ['workspaces-list'] });
      toast.success(`فضای کاری "${ws.name}" ایجاد شد`);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      const msg = err?.message ?? 'خطا در ایجاد فضای کاری';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-[hsl(var(--primary))]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ایجاد فضای کاری جدید</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 max-w-sm mx-auto leading-relaxed">
            یک فضای کاری برای تیم خود ایجاد کنید. می‌توانید بعداً تنظیمات برند، اعضا و محاسبات را پیکربندی کنید.
          </p>
        </div>

        {/* ── Form Card ── */}
        <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="ws-name">
                نام فضای کاری
              </label>
              <input
                id="ws-name"
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="مثلاً: شرکت مهندسی برق پارس"
                autoFocus
                maxLength={100}
                className={cn(
                  'w-full h-11 px-4 rounded-[var(--radius)] border text-sm bg-transparent',
                  'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]',
                  error ? 'border-[hsl(var(--destructive))]' : 'border-[hsl(var(--input))]',
                  'placeholder:text-[hsl(var(--muted-foreground)/0.5)]',
                  'transition-colors',
                )}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  بین ۲ تا ۱۰۰ کاراکتر
                </p>
                <p className={cn(
                  'text-xs tabular-nums',
                  name.length > 100 ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--muted-foreground))]',
                )}>
                  {name.length}/100
                </p>
              </div>
              {error && (
                <p className="text-xs text-[hsl(var(--destructive))] flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[hsl(var(--destructive))] shrink-0" />
                  {error}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || submitting}
              className={cn(
                'w-full h-11 rounded-[var(--radius)] text-sm font-medium flex items-center justify-center gap-2',
                'bg-[hsl(var(--primary))] text-white',
                'hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed',
                'transition-all',
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال ایجاد...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  ایجاد فضای کاری
                </>
              )}
            </button>

          </form>
        </div>

        {/* ── Tips ── */}
        <div className="mt-6 space-y-3">
          {[
            'پس از ایجاد، می‌توانید اعضای تیم را دعوت کنید',
            'تنظیمات برند، محلی‌سازی و محاسبات پیش‌فرض قابل شخصی‌سازی است',
            'همه محاسبات و پروژه‌ها در این فضای کاری ذخیره می‌شوند',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-[hsl(var(--muted-foreground))]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--primary)/0.6)] shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>

        {/* ── Back ── */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <ArrowRight className="h-3 w-3" />
            بازگشت
          </button>
        </div>

      </div>
    </div>
  );
}


