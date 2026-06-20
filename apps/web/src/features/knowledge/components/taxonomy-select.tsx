'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button }  from '@/components/ui/button';
import { Badge }   from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { cn }        from '@/lib/utils';

type TaxonomyType = 'category' | 'topic' | 'tag' | 'discipline' | 'audience';

interface Item {
  id: string;
  name?: string;
  name_en?: string;
  title?: string;
}

const LABELS: Record<TaxonomyType, string> = {
  category: 'دسته‌بندی',
  topic: 'موضوع',
  tag: 'برچسب',
  discipline: 'رشته',
  audience: 'مخاطب',
};

const ICONS: Record<TaxonomyType, string> = {
  category: '📁',
  topic: '📌',
  tag: '🏷️',
  discipline: '⚡',
  audience: '👥',
};

function getItemLabel(item: Item): string {
  return item.name ?? item.title ?? item.name_en ?? item.id;
}

function useTaxonomyOptions(type: TaxonomyType, locale: string) {
  const pluralMap: Record<TaxonomyType, string> = {
    category: 'categories',
    topic: 'topics',
    tag: 'tags',
    discipline: 'disciplines',
    audience: 'audiences',
  };
  return useQuery({
    queryKey: ['taxonomy', type],
    queryFn:  () => apiClient.get<any>(`/${pluralMap[type]}?limit=200`),
  });
}

interface Props {
  type: TaxonomyType;
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function TaxonomySelect({ type, selected, onChange }: Props) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const label = LABELS[type];
  const icon = ICONS[type];

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useTaxonomyOptions(type, locale);
  const items: Item[] = data?.data ?? [];

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return (i.name?.toLowerCase().includes(q) ||
            i.name_en?.toLowerCase().includes(q) ||
            i.title?.toLowerCase().includes(q));
  });

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">
        {icon} {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm shadow-sm hover:bg-[hsl(var(--secondary)/0.3)] transition-colors"
        >
          <span className={cn(selected.length === 0 && 'text-[hsl(var(--muted-foreground))]')}>
            {selected.length > 0 ? `${selected.length} انتخاب` : `انتخاب ${label}`}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute z-50 mt-1 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg animate-fade-in">
              <div className="p-2 border-b border-[hsl(var(--border))]">
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`جستجوی ${label}...`}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]"
                />
              </div>
              <div className="max-h-48 overflow-y-auto p-1">
                {isLoading ? (
                  <div className="text-center text-sm text-[hsl(var(--muted-foreground))] py-4">در حال بارگذاری...</div>
                ) : filtered.length === 0 ? (
                  <div className="text-center text-sm text-[hsl(var(--muted-foreground))] py-4">موردی یافت نشد</div>
                ) : (
                  filtered.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggle(item.id)}
                      className="flex w-full items-center gap-2 px-2 py-1.5 rounded-[var(--radius)] text-sm hover:bg-[hsl(var(--secondary))] transition-colors text-right"
                    >
                      <div className={cn(
                        'w-4 h-4 rounded border border-[hsl(var(--border))] flex items-center justify-center shrink-0',
                        selected.includes(item.id) && 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))]',
                      )}>
                        {selected.includes(item.id) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span>{getItemLabel(item)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selected.map(id => {
            const item = items.find(i => i.id === id);
            return (
              <Badge key={id} variant="secondary" className="flex items-center gap-1 text-[11px]">
                {getItemLabel(item ?? { id })}
                <button type="button" onClick={() => toggle(id)} className="hover:text-[hsl(var(--destructive))]">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
