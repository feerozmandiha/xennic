'use client';

import { ToastProvider, ToastViewport, Toast } from '@/components/ui/toast';
import { useToastStore } from '@/stores/toast.store';

export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts);
  const remove  = useToastStore(s => s.remove);

  return (
    <ToastProvider swipeDirection="right" duration={4000}>
      {toasts.map(t => (
        <Toast
          key={t.id}
          open
          onOpenChange={open => !open && remove(t.id)}
          variant={t.variant}
          title={t.title}
          description={t.description}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
