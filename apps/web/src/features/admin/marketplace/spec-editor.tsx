'use client';

import { useMemo } from 'react';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPEC_PRESETS } from './types';

export interface SpecRow {
  id: string;
  key: string;
  value: string;
}

let rowCounter = 0;
function nextRowId(): string {
  rowCounter += 1;
  return `spec-${rowCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createSpecRow(key = '', value = ''): SpecRow {
  return { id: nextRowId(), key, value };
}

/** تبدیل آبجکت مشخصات ذخیره‌شده به ردیف‌های فرم. */
export function specsToRows(specs: Record<string, unknown> | null | undefined): SpecRow[] {
  if (!specs || Object.keys(specs).length === 0) return [];
  return Object.entries(specs).map(([key, value]) =>
    createSpecRow(key, value == null ? '' : String(value)),
  );
}

/**
 * تبدیل ردیف‌های فرم به آبجکت مشخصات فنی.
 * مقادیر عددی به number و true/false به boolean تبدیل می‌شوند تا موتور
 * پیشنهاد محصول بتواند آن‌ها را با نتیجهٔ محاسبات مقایسه کند.
 */
export function rowsToSpecs(rows: SpecRow[]): Record<string, unknown> {
  const specs: Record<string, unknown> = {};

  for (const row of rows) {
    const key = row.key.trim();
    if (!key) continue;

    const raw = row.value.trim();
    if (raw === '') {
      specs[key] = '';
      continue;
    }
    if (raw === 'true' || raw === 'false') {
      specs[key] = raw === 'true';
      continue;
    }

    const numeric = Number(raw);
    specs[key] = Number.isFinite(numeric) && raw !== '' ? numeric : raw;
  }

  return specs;
}

export function duplicateSpecKeys(rows: SpecRow[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const row of rows) {
    const key = row.key.trim();
    if (!key) continue;
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }
  return [...duplicates];
}

const inputCls =
  'w-full px-2.5 py-1.5 text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none focus:border-[hsl(var(--primary))] transition-colors';

interface SpecEditorProps {
  rows: SpecRow[];
  category: string;
  onChange: (rows: SpecRow[]) => void;
}

/** ویرایشگر کلید/مقدارِ مشخصات فنی محصول. */
export function SpecEditor({ rows, category, onChange }: SpecEditorProps) {
  const duplicates = useMemo(() => duplicateSpecKeys(rows), [rows]);
  const presets = SPEC_PRESETS[category] ?? [];
  const usedKeys = useMemo(() => new Set(rows.map((r) => r.key.trim())), [rows]);

  const update = (id: string, patch: Partial<SpecRow>) =>
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const remove = (id: string) => onChange(rows.filter((row) => row.id !== id));

  const addRow = (key = '') => onChange([...rows, createSpecRow(key)]);

  const applyPreset = () => {
    const missing = presets.filter((key) => !usedKeys.has(key));
    if (missing.length === 0) return;
    onChange([...rows, ...missing.map((key) => createSpecRow(key))]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
          مشخصات فنی
        </label>
        <div className="flex items-center gap-1.5">
          {presets.length > 0 && (
            <button
              type="button"
              onClick={applyPreset}
              className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-[hsl(var(--border))] text-[10px] hover:bg-[hsl(var(--secondary))]"
            >
              <Wand2 className="h-3 w-3" />
              کلیدهای پیشنهادی دسته
            </button>
          )}
          <button
            type="button"
            onClick={() => addRow()}
            className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-[hsl(var(--border))] text-[10px] hover:bg-[hsl(var(--secondary))]"
          >
            <Plus className="h-3 w-3" />
            افزودن مشخصه
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[hsl(var(--border))] px-3 py-4 text-center text-[11px] text-[hsl(var(--muted-foreground))]">
          هنوز مشخصه‌ای ثبت نشده است. مقادیر عددی به‌صورت خودکار برای موتور پیشنهاد محصول استفاده
          می‌شوند.
        </p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((row) => {
            const isDuplicate = duplicates.includes(row.key.trim());
            return (
              <div key={row.id} className="flex items-center gap-1.5">
                <input
                  value={row.key}
                  onChange={(e) => update(row.id, { key: e.target.value })}
                  className={cn(inputCls, 'flex-1', isDuplicate && 'border-red-400')}
                  placeholder="cable_size_mm2"
                  dir="ltr"
                  aria-label="نام مشخصه"
                />
                <input
                  value={row.value}
                  onChange={(e) => update(row.id, { value: e.target.value })}
                  className={cn(inputCls, 'flex-1')}
                  placeholder="35"
                  dir="ltr"
                  aria-label="مقدار مشخصه"
                />
                <button
                  type="button"
                  onClick={() => remove(row.id)}
                  className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                  aria-label="حذف مشخصه"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {duplicates.length > 0 && (
        <p className="text-[10px] text-red-500">کلید تکراری: {duplicates.join('، ')}</p>
      )}
    </div>
  );
}
