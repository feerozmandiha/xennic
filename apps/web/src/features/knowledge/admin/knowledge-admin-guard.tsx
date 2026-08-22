'use client';

import { API_BASE } from '@/lib/api/client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Shield, Loader2 } from 'lucide-react';

/**
 * Client-side guard that only lets platform admins access
 * Knowledge management (creating/editing/publishing articles).
 *
 * Backend controllers already require `knowledge.create` /
 * `knowledge.update` / `knowledge.publish` permissions, but the UI
 * should also hide the management tools from regular users. According
 * to docs/knowledge/knowledge-runtime-audit.md, Knowledge CMS
 * management is an admin/platform-level capability.
 */
export function KnowledgeAdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const storeIsAdmin = useAuthStore((s) => s.isAdmin);
  const token = useAuthStore((s) => s.token);
  const setIsAdmin = useAuthStore((s) => s.setIsAdmin);

  const [hydrated, setHydrated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !token) {
      router.replace(`/${locale}/login`);
      return;
    }

    let cancelled = false;
    fetch(`${API_BASE}/admin/check`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const ok = json?.data?.isAdmin === true || json?.isAdmin === true;
        setIsAdmin(ok);
        setAllowed(ok);
        setChecking(false);
        if (!ok) setTimeout(() => router.replace(`/${locale}/dashboard`), 1500);
      })
      .catch(() => {
        if (cancelled) return;
        setAllowed(storeIsAdmin);
        setChecking(false);
        if (!storeIsAdmin) setTimeout(() => router.replace(`/${locale}/dashboard`), 1500);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated, token]);

  if (!hydrated || checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {!isAuthenticated ? 'در حال انتقال...' : 'بررسی دسترسی...'}
        </p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <Shield className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-lg font-bold text-red-600">دسترسی مخصوص ادمین</h1>
        <p className="max-w-md text-sm text-[hsl(var(--muted-foreground))]">
          افزودن و ویرایش مقالات دانشنامه فقط برای ادمین‌های پلتفرم مجاز است. برای مشاهده‌ی دانشنامه
          به صفحه‌ی عمومی آن مراجعه کنید.
        </p>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => router.push(`/${locale}/knowledge`)}
            className="h-9 px-5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm hover:bg-[hsl(var(--muted))] transition"
          >
            مشاهده دانشنامه
          </button>
          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="h-9 px-5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm"
          >
            بازگشت به داشبورد
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
