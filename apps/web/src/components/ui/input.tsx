import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?:     string;
  label?:     string;
  hint?:      string;
  startIcon?: React.ReactNode;
  endIcon?:   React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, startIcon, endIcon, id, ...props }, ref) => {
    const inputId = id ?? React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[hsl(var(--foreground))]"
          >
            {label}
            {props.required && <span className="text-[hsl(var(--destructive))] ms-1">*</span>}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] [&_svg]:size-4">
              {startIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            className={cn(
              'flex h-9 w-full rounded-[var(--radius)] border border-[hsl(var(--input))]',
              'bg-transparent px-3 py-1 text-sm',
              'transition-colors placeholder:text-[hsl(var(--muted-foreground)/0.6)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:border-[hsl(var(--ring))]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-[hsl(var(--destructive))] focus-visible:ring-[hsl(var(--destructive)/0.3)]',
              startIcon && 'ps-9',
              endIcon   && 'pe-9',
              className,
            )}
            ref={ref}
            {...props}
          />

          {endIcon && (
            <div className="absolute end-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] [&_svg]:size-4">
              {endIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-[hsl(var(--destructive))] flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
