'use client';

import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-4 end-4 z-[100] flex flex-col-reverse gap-2',
      'w-[360px] max-w-[calc(100vw-2rem)]',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

const VARIANT_STYLES: Record<ToastVariant, string> = {
  default: 'bg-[hsl(var(--card))] border-[hsl(var(--border))]',
  success: 'bg-[hsl(var(--success)/0.06)] border-[hsl(var(--success)/0.35)]',
  error:   'bg-[hsl(var(--destructive)/0.06)] border-[hsl(var(--destructive)/0.35)]',
  warning: 'bg-[hsl(var(--warning)/0.06)] border-[hsl(var(--warning)/0.35)]',
  info:    'bg-[hsl(var(--primary)/0.06)] border-[hsl(var(--primary)/0.35)]',
};

const VARIANT_ICONS: Record<ToastVariant, React.ReactNode> = {
  default: null,
  success: <CheckCircle2  className="h-4 w-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />,
  error:   <AlertCircle   className="h-4 w-4 text-[hsl(var(--destructive))] shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))] shrink-0 mt-0.5" />,
  info:    <Info          className="h-4 w-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />,
};

interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?:     ToastVariant;
  title?:       string;
  description?: string;
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant = 'default', title, description, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      'flex items-start gap-3 p-4 rounded-[var(--radius-lg)] border',
      'shadow-[var(--shadow-md)]',
      'data-[state=open]:animate-slide-up',
      'data-[state=closed]:opacity-0 data-[state=closed]:translate-y-2',
      'data-[state=closed]:transition-all data-[state=closed]:duration-200',
      'transition-all duration-200',
      VARIANT_STYLES[variant],
      className,
    )}
    {...props}
  >
    {VARIANT_ICONS[variant]}
    <div className="flex-1 min-w-0">
      {title && (
        <ToastPrimitive.Title className="text-sm font-semibold leading-snug mb-0.5">
          {title}
        </ToastPrimitive.Title>
      )}
      {description && (
        <ToastPrimitive.Description className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
          {description}
        </ToastPrimitive.Description>
      )}
    </div>
    <ToastPrimitive.Close className="shrink-0 p-1 rounded-[var(--radius-sm)] hover:bg-[hsl(var(--secondary))] transition-colors -mt-0.5 -me-1">
      <X className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
    </ToastPrimitive.Close>
  </ToastPrimitive.Root>
));
Toast.displayName = 'Toast';

export { ToastProvider, ToastViewport, Toast };
export type { ToastVariant };
