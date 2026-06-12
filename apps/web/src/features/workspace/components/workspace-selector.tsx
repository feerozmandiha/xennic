'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Building2, ChevronDown, Plus, Check } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';

export function WorkspaceSelector() {
  const params       = useParams();
  const locale       = (params?.locale as string) ?? 'fa';
  const wsId         = useAuthStore(s => s.workspaceId);
  const setWorkspace = useAuthStore(s => s.setWorkspace);

  // ✅ فیلتر شده — فقط workspace های خود کاربر
  const { data } = useQuery({
    queryKey: ['workspaces-list'],
    queryFn:  () => apiClient.get<any>('/workspaces?limit=20'),
    retry: false,
  });

  const workspaces = data?.data ?? [];
  const current    = workspaces.find((w: any) => w.id === wsId);

  function select(id: string) {
    setWorkspace(id);
    // reload تا داده‌های جدید fetch شوند
    window.location.reload();
  }

  if (!workspaces.length) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={cn(
          'flex items-center gap-2 h-8 px-2.5 rounded-[var(--radius)]',
          'text-xs font-medium border border-[hsl(var(--border))]',
          'hover:bg-[hsl(var(--secondary))] transition-colors',
          'max-w-[160px]',
        )}>
          <Building2 className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] shrink-0" />
          <span className="truncate">{current?.name ?? 'انتخاب Workspace'}</span>
          <ChevronDown className="h-3 w-3 text-[hsl(var(--muted-foreground))] shrink-0" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-50 min-w-[200px] rounded-[var(--radius-lg)] border border-[hsl(var(--border))]',
            'bg-[hsl(var(--popover))] shadow-lg p-1 animate-fade-in',
          )}
          align="start"
          sideOffset={6}
        >
          <p className="px-3 py-1.5 text-[10px] text-[hsl(var(--muted-foreground))] font-medium uppercase tracking-wider">
            Workspace ها
          </p>

          {workspaces.map((ws: any) => (
            <DropdownMenu.Item
              key={ws.id}
              onSelect={() => select(ws.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-sm cursor-pointer',
                'hover:bg-[hsl(var(--secondary))] transition-colors',
                'focus:outline-none data-[highlighted]:bg-[hsl(var(--secondary))]',
              )}
            >
              <div className="w-5 h-5 rounded bg-[hsl(var(--primary)/0.1)] flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-[hsl(var(--primary))]">
                  {ws.name?.[0]?.toUpperCase() ?? 'W'}
                </span>
              </div>
              <span className="flex-1 truncate">{ws.name}</span>
              {ws.id === wsId && (
                <Check className="h-3.5 w-3.5 text-[hsl(var(--primary))] shrink-0" />
              )}
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="my-1 h-px bg-[hsl(var(--border))]" />

          <DropdownMenu.Item
            onSelect={() => window.location.href = `/${locale}/workspaces/new`}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-sm cursor-pointer',
              'text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)]',
              'focus:outline-none data-[highlighted]:bg-[hsl(var(--primary)/0.05)]',
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Workspace جدید
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
