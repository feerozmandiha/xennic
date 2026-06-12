import NextLink from 'next/link';
import { cn } from '@/lib/utils';

interface LinkProps extends React.ComponentProps<typeof NextLink> {
  className?: string;
}

export function Link({ className, ...props }: LinkProps) {
  return (
    <NextLink
      className={cn('transition-colors hover:opacity-80', className)}
      {...props}
    />
  );
}
