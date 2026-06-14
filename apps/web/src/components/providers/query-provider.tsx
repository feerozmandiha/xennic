'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useToastStore } from '@/stores/toast.store';

function GlobalErrorHandler() {
  const showError = useToastStore(s => s.error);

  useEffect(() => {
    const orig = window.onunhandledrejection;
    window.addEventListener('unhandledrejection', (e) => {
      const err = e.reason;
      if (err?.status === 403 || err?.message?.includes('403') || err?.code === 'FORBIDDEN') {
        e.preventDefault();
        showError(
          'دسترسی محدود',
          err?.message ?? 'این قابلیت در پلن رایگان در دسترس نیست',
        );
      }
    });
    return () => { window.onunhandledrejection = orig; };
  }, [showError]);

  return null;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:            60 * 1000,
            retry:                false,       // ← غیرفعال: 403 را retry نکن
            refetchOnWindowFocus: false,
            refetchInterval:      false,       // ← polling غیرفعال
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalErrorHandler />
      {children}
    </QueryClientProvider>
  );
}
