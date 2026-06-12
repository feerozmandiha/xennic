import { create } from 'zustand';
import type { ToastVariant } from '@/components/ui/toast';

interface ToastItem {
  id:           string;
  title?:       string;
  description?: string;
  variant?:     ToastVariant;
  duration?:    number;
}

interface ToastState {
  toasts: ToastItem[];
  add:    (toast: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
  // shortcuts
  success: (title: string, description?: string) => void;
  error:   (title: string, description?: string) => void;
  info:    (title: string, description?: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set(s => ({ toasts: [...s.toasts, { ...toast, id }] }));
    // auto-remove
    setTimeout(() => get().remove(id), toast.duration ?? 4000);
  },

  remove: (id) =>
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  success: (title, description) =>
    get().add({ title, description, variant: 'success' }),

  error: (title, description) =>
    get().add({ title, description, variant: 'error', duration: 6000 }),

  info: (title, description) =>
    get().add({ title, description, variant: 'info' }),
}));

// ── Helper hook — هر function را جداگانه subscribe کن (مرجع ثابت) ─────────────
export const useToast = () => {
  const success = useToastStore(s => s.success);
  const error   = useToastStore(s => s.error);
  const info    = useToastStore(s => s.info);
  const add     = useToastStore(s => s.add);
  return { success, error, info, add };
};
