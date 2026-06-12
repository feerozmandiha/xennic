import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circle' | 'text';
}

export function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton-shimmer',
        variant === 'circle' ? 'rounded-full' : 'rounded-[var(--radius)]',
        className,
      )}
      {...props}
    />
  );
}
