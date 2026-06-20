'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Building2, Sparkles, Users, Settings, Zap,
  ArrowRight, CheckCircle2, Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';

export function WorkspaceWelcomeClient() {
  const router      = useRouter();
  const params      = useParams();
  const locale      = (params?.locale as string) ?? 'fa';
  const wsId        = useAuthStore(s => s.workspaceId);
  const setWorkspace = useAuthStore(s => s.setWorkspace);

  const { data, isLoading } = useQuery({
    queryKey: ['workspaces-list'],
    queryFn:  () => apiClient.get<any>('/workspaces?limit=20'),
    retry: false,
  });

  const workspaces = data?.data ?? [];

  // Auto-select if workspaces exist but no wsId set
  useEffect(() => {
    if (!isLoading && workspaces.length > 0 && !wsId) {
      setWorkspace(workspaces[0].id);
      router.replace(`/${locale}/dashboard`);
    }
    if (!isLoading && workspaces.length > 0 && wsId) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [isLoading, workspaces, wsId, setWorkspace, router, locale]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  if (workspaces.length > 0) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto text-center">

        {/* ── Illustration ── */}
        <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center mx-auto mb-6">
          <Building2 className="h-10 w-10 text-[hsl(var(--primary))]" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          به <span className="text-[hsl(var(--primary))]">Xennic</span> خوش آمدید
        </h1>
        <p className="text-base text-[hsl(var(--muted-foreground))] mt-3 max-w-md mx-auto leading-relaxed">
          پلتفرم مهندسی برق و انرژی‌های نو. برای شروع، اولین فضای کاری خود را ایجاد کنید.
        </p>

        {/* ── CTA ── */}
        <div className="mt-8">
          <Link
            href={`/${locale}/workspaces/new`}
            className={cn(
              'inline-flex items-center gap-2.5 h-12 px-8 rounded-[var(--radius-lg)]',
              'bg-[hsl(var(--primary))] text-white text-sm font-medium',
              'hover:opacity-90 transition-all shadow-lg shadow-[hsl(var(--primary)/0.25)]',
            )}
          >
            <Sparkles className="h-5 w-5" />
            ایجاد فضای کاری
          </Link>
        </div>

        {/* ── Features ── */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-right">
          {[
            {
              icon: Users,
              title: 'همکاری تیمی',
              desc: 'اعضای تیم را دعوت کنید و نقش‌های دسترسی تعریف کنید',
            },
            {
              icon: Zap,
              title: 'محاسبات مهندسی',
              desc: 'محاسبات تخصصی برق شامل اتصال کوتاه، حفاظت، بار و...',
            },
            {
              icon: Settings,
              title: 'شخصی‌سازی',
              desc: 'برند، محلی‌سازی و پیش‌فرض‌های محاسباتی را تنظیم کنید',
            },
          ].map((f, i) => (
            <div key={i} className="p-4 rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <div className="w-10 h-10 rounded-[var(--radius)] bg-[hsl(var(--primary)/0.08)] flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Steps ── */}
        <div className="mt-10 space-y-3 inline-block text-right">
          {[
            'یک فضای کاری با نام تیم خود ایجاد کنید',
            'همکاران را دعوت کنید و نقش‌ها را تعیین کنید',
            'محاسبات مهندسی خود را شروع کنید',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-[hsl(var(--muted-foreground))]">
              <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary)/0.6)] shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
