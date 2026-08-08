'use client';

import { useState } from 'react';
import { Filter, SlidersHorizontal, X, Zap, BookOpen, Cpu, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DIFFICULTY_META } from '@/features/knowledge/lib/taxonomy-data';
import { STANDARDS_REGISTRY } from '@/features/knowledge/lib/standards-data';
import { EQUIPMENT_CATEGORIES } from '@/features/knowledge/lib/equipment-registry';

export interface FilterState {
  difficulty: string;
  standard: string;
  equipmentCategory: string;
  language: string;
  taxonomyType: string;
}

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  totalResults: number;
}

export function KnowledgeFilters({ filters, onChange, totalResults }: Props) {
  const [open, setOpen] = useState(false);

  const activeCount = Object.values(filters).filter((v) => v && v !== '').length;

  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onChange({
      difficulty: '',
      standard: '',
      equipmentCategory: '',
      language: '',
      taxonomyType: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              'inline-flex items-center gap-2 h-9 px-4 rounded-xl border text-sm font-medium transition-colors',
              open || activeCount > 0
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card hover:bg-secondary',
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            فیلترها
            {activeCount > 0 && (
              <span className="bg-white/20 rounded-full px-1.5 text-xs">{activeCount}</span>
            )}
          </button>
          <span className="text-xs text-muted-foreground">
            {totalResults.toLocaleString('fa-IR')} نتیجه
          </span>
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="h-3 w-3" /> پاک کردن
          </button>
        )}
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.difficulty && (
            <Badge variant="secondary" className="gap-1">
              سطح: {DIFFICULTY_META[filters.difficulty]?.fa ?? filters.difficulty}
              <button onClick={() => update('difficulty', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.standard && (
            <Badge variant="secondary" className="gap-1 font-mono">
              {filters.standard}
              <button onClick={() => update('standard', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.equipmentCategory && (
            <Badge variant="secondary" className="gap-1">
              {(EQUIPMENT_CATEGORIES as any)[filters.equipmentCategory]?.fa ??
                filters.equipmentCategory}
              <button onClick={() => update('equipmentCategory', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {open && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm animate-fade-in space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> سطح دشواری
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => update('difficulty', e.target.value)}
                className="w-full h-9 rounded-xl border bg-background px-3 text-sm"
              >
                <option value="">همه سطوح</option>
                {Object.entries(DIFFICULTY_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.fa}
                  </option>
                ))}
              </select>
            </div>

            {/* Standard */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> استاندارد
              </label>
              <select
                value={filters.standard}
                onChange={(e) => update('standard', e.target.value)}
                className="w-full h-9 rounded-xl border bg-background px-3 text-sm font-mono"
              >
                <option value="">همه استانداردها</option>
                {STANDARDS_REGISTRY.slice(0, 20).map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.titleFa.slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>

            {/* Equipment Category */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" /> تجهیزات
              </label>
              <select
                value={filters.equipmentCategory}
                onChange={(e) => update('equipmentCategory', e.target.value)}
                className="w-full h-9 rounded-xl border bg-background px-3 text-sm"
              >
                <option value="">همه تجهیزات</option>
                {Object.entries(EQUIPMENT_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.icon} {cat.fa}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" /> دسته‌بندی دانشی
              </label>
              <select
                value={filters.taxonomyType}
                onChange={(e) => update('taxonomyType', e.target.value)}
                className="w-full h-9 rounded-xl border bg-background px-3 text-sm"
              >
                <option value="">همه</option>
                <option value="category">دسته‌بندی</option>
                <option value="topic">موضوع</option>
                <option value="discipline">رشته</option>
                <option value="audience">مخاطب</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> زبان
              </label>
              <select
                value={filters.language}
                onChange={(e) => update('language', e.target.value)}
                className="w-full h-9 rounded-xl border bg-background px-3 text-sm"
              >
                <option value="">همه زبان‌ها</option>
                <option value="fa">فارسی</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
