'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { MarketplaceAdminSection } from '@/features/admin/marketplace';

const API_BASE =
  typeof window !== 'undefined'
    ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`
    : 'http://localhost:3000/api/v1';

export default function AdminMarketplacePage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const setIsAdmin = useAuthStore((s) => s.setIsAdmin);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const [hydrated, setHydrated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !token) {
      router.replace(`/${locale}/login?redirectTo=/${locale}/admin/marketplace`);
      return;
    }
    fetch(`${API_BASE}/admin/check`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        const ok = json?.data?.isAdmin === true || json?.isAdmin === true;
        setIsAdmin(ok);
        setAllowed(ok);
      })
      .catch(() => setAllowed(isAdmin))
      .finally(() => setChecking(false));
  }, [hydrated, isAuthenticated, token, isAdmin, locale, router, setIsAdmin]);

  if (!hydrated || checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">بررسی دسترسی…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Shield className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-lg font-bold text-red-600">دسترسی ممنوع</h1>
        <p className="max-w-md text-sm text-[hsl(var(--muted-foreground))]">
          برای مدیریت فروشگاه (بازارگاه) باید با حساب ادمین وارد شوید.
        </p>
        <Link
          href={`/${locale}/login`}
          className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white"
        >
          ورود <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--secondary))/30]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">فروشگاه (بازارگاه)</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            مدیریت محصولات، مشخصات فنی، ترجمهٔ فارسی/انگلیسی و فروشندگان بازارگاه.
          </p>
        </div>
        <MarketplaceAdminSection />
      </div>
    </div>
  );
}
