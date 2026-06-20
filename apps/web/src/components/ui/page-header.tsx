import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title:        string;
  description?: React.ReactNode;
  action?:      React.ReactNode;
  className?:   string;
  badge?:       React.ReactNode;
}

export function PageHeader({ title, description, action, className, badge }: PageHeaderProps) {
  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6',
      className,
    )}>
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}
