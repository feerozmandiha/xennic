'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router          = useRouter();
  const params          = useParams();
  const locale          = (params?.locale as string) ?? 'fa';
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const token           = useAuthStore(s => s.token);

  // hydration guard — جلوگیری از flash بین SSR و client
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !token) {
      const currentPath = window.location.pathname + window.location.search;
      const redirectTo  = encodeURIComponent(currentPath);
      router.replace(`/${locale}/login?redirectTo=${redirectTo}`);
    }
  }, [hydrated, isAuthenticated, token, router, locale]);

  // قبل از hydration — spinner نشان می‌دهیم
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="w-6 h-6 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // بعد از hydration — اگر auth نیست، redirect می‌شود
  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="w-6 h-6 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
