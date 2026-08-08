'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { Shield, Loader2, ArrowRight, FileEdit } from 'lucide-react';
import { ToastContainer } from '@/components/providers/toast-provider';
import { LandingCmsEditor } from '@/features/admin/components/landing-cms-editor';

const API_BASE =
  typeof window !== 'undefined'
    ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`
    : 'http://localhost:3000/api/v1';

export default function AdminLandingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const storeIsAdmin = useAuthStore((s) => s.isAdmin);
  const token = useAuthStore((s) => s.token);
  const setIsAdmin = useAuthStore((s) => s.setIsAdmin);

  const [hydrated, setHydrated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setLocalAdmin] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !token) {
      router.replace(`/${locale}/login`);
      return;
    }
    fetch(`${API_BASE}/admin/check`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((json) => {
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
  }, [hydrated, isAuthenticated, token]);

  if (!hydrated || checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">بررسی دسترسی...</p>
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
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          فقط ادمین‌های سیستم دسترسی دارند
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="border-b border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
          <FileEdit className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h1 className="text-sm font-bold">مدیریت صفحه فرود (CMS)</h1>
          <Link
            href={`/${locale}/admin`}
            className="mr-auto h-8 px-3 inline-flex items-center gap-1.5 text-xs rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            بازگشت به پنل ادمین
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        <LandingCmsEditor />
      </div>
      <ToastContainer />
    </div>
  );
}
