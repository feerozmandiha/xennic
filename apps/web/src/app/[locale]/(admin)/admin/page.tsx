'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { AdminClient } from '@/features/admin/components/admin-client';
import { Shield, Loader2 } from 'lucide-react';

const API_BASE = typeof window !== 'undefined'
  ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`
  : 'http://localhost:3000/api/v1';

export default function AdminPage() {
  const router  = useRouter();
  const params  = useParams();
  const locale  = (params?.locale as string) ?? 'fa';

  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const storeIsAdmin    = useAuthStore(s => s.isAdmin);
  const token           = useAuthStore(s => s.token);
  const setIsAdmin      = useAuthStore(s => s.setIsAdmin);

  const [checking,    setChecking]    = useState(true);
  const [isAdmin,     setLocalAdmin]  = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace(`/${locale}/login`);
      return;
    }

    fetch(`${API_BASE}/admin/check`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => {
        const ok = json?.data?.isAdmin === true || json?.isAdmin === true;
        setIsAdmin(ok);
        setLocalAdmin(ok);
        setChecking(false);
        if (!ok) setTimeout(() => router.replace(`/${locale}/dashboard`), 1500);
      })
      .catch(() => {
        setLocalAdmin(storeIsAdmin);
        setChecking(false);
        if (!storeIsAdmin) setTimeout(() => router.replace(`/${locale}/dashboard`), 1500);
      });
  }, [isAuthenticated, token]);

  if (!isAuthenticated || checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {!isAuthenticated ? 'در حال انتقال...' : 'بررسی دسترسی...'}
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <Shield className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-lg font-bold text-red-600">دسترسی ممنوع</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">فقط ادمین‌های سیستم دسترسی دارند</p>
        <button onClick={() => router.push(`/${locale}/dashboard`)}
          className="h-9 px-5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm">
          بازگشت به داشبورد
        </button>
      </div>
    );
  }

  return <AdminClient />;
}
