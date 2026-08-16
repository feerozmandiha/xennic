'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ImageIcon, Plus, Save, Send, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cmsApi } from '../lib/api';
import { BLOCK_LIBRARY, EDITABLE_SLOTS, getDefaultDocument } from '../lib/default-content';
import {
  createBlock,
  EMPTY_DOCUMENT,
  newBlockId,
  type CmsBlock,
  type CmsContent,
  type CmsDocument,
} from '../lib/types';
import { CmsDocumentRenderer } from '../blocks/cms-renderer';

export function CmsEditor() {
  const [slot, setSlot] = useState(EDITABLE_SLOTS[0].slot);
  const [locale, setLocale] = useState('fa');
  const [doc, setDoc] = useState<CmsDocument>(EMPTY_DOCUMENT);
  const [record, setRecord] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  // load
  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await cmsApi.getBySlot(slot, locale);
      setRecord(res.data);
      setDoc(res.data.document);
      return;
    } catch {
      /* not found — seed from defaults */
    }
    setRecord(null);
    setDoc(getDefaultDocument(slot) ?? EMPTY_DOCUMENT);
    setLoading(false);
  }, [slot, locale]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const dirty = useMemo(
    () => JSON.stringify(doc) !== JSON.stringify(record?.document),
    [doc, record],
  );

  // block ops
  function updateBlock(id: string, patch: Partial<CmsBlock>) {
    setDoc((d) => ({ ...d, blocks: mutateTree(d.blocks, id, (b) => ({ ...b, ...patch })) }));
  }

  function updateProps(id: string, props: Record<string, unknown>) {
    setDoc((d) => ({
      ...d,
      blocks: mutateTree(d.blocks, id, (b) => ({ ...b, props: { ...b.props, ...props } })),
    }));
  }

  function removeBlock(id: string) {
    setDoc((d) => ({ ...d, blocks: removeFromTree(d.blocks, id) }));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setDoc((d) => ({ ...d, blocks: reorder(d.blocks, id, dir) }));
  }

  function addChild(parentId: string | null, type: CmsBlock['type']) {
    const lib = BLOCK_LIBRARY.find((b) => b.type === type);
    const block = createBlock(type, lib?.defaultProps ?? {});
    if (!parentId) {
      setDoc((d) => ({ ...d, blocks: [...d.blocks, block] }));
    } else {
      setDoc((d) => ({
        ...d,
        blocks: mutateTree(d.blocks, parentId, (b) => ({
          ...b,
          children: [...(b.children ?? []), block],
        })),
      }));
    }
    setActiveBlock(block.id);
  }

  async function uploadForBlock(id: string, file: File) {
    const uploaded = await cmsApi.uploadMedia(file, 'landing');
    updateProps(id, { src: uploaded.url, alt: file.name });
  }

  async function save(publish: boolean) {
    setSaving(true);
    setMessage(null);
    try {
      if (record) {
        const res = await cmsApi.patch(record.id, { document: doc, publish });
        setRecord(res.data);
        setDoc(res.data.document);
      } else {
        const res = await cmsApi.upsert({ slot, locale, document: doc, publish });
        setRecord(res.data);
        setDoc(res.data.document);
      }
      setMessage({
        kind: 'ok',
        text: publish ? 'منتشر شد ✓' : 'پیش‌نویس ذخیره شد ✓',
      });
    } catch (err) {
      setMessage({
        kind: 'err',
        text: err instanceof Error ? err.message : 'خطا در ذخیره‌سازی',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">در حال بارگذاری…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[hsl(var(--muted-foreground))]">صفحه</label>
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm"
          >
            {EDITABLE_SLOTS.map((s) => (
              <option key={s.slot} value={s.slot}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[hsl(var(--muted-foreground))]">زبان</label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm"
          >
            <option value="fa">فارسی</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span
            className={
              'rounded-full px-2.5 py-0.5 text-xs ' +
              (record?.published
                ? 'bg-emerald-500/15 text-emerald-600'
                : 'bg-amber-500/15 text-amber-600')
            }
          >
            {record?.published ? 'منتشرشده' : record ? 'پیش‌نویس' : 'جدید'}
          </span>
          <Button variant="outline" size="sm" onClick={() => setShowPreview((p) => !p)}>
            {showPreview ? 'نمایش ویرایشگر' : 'پیش‌نمایش'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => save(false)}
            disabled={saving || !dirty}
          >
            <Save className="ml-1.5 h-4 w-4" /> ذخیره پیش‌نویس
          </Button>
          <Button size="sm" onClick={() => save(true)} disabled={saving}>
            <Send className="ml-1.5 h-4 w-4" /> انتشار
          </Button>
        </div>
      </div>

      {message ? (
        <div
          className={
            'rounded-lg border p-3 text-sm ' +
            (message.kind === 'ok'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700'
              : 'border-red-500/40 bg-red-500/10 text-red-700')
          }
        >
          {message.text}
        </div>
      ) : null}

      {showPreview ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h3 className="mb-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">
            پیش‌نمایش
          </h3>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
            <CmsDocumentRenderer document={doc} />
          </div>
        </div>
      ) : null}

      {/* Block list editor */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">بلوک‌ها</h3>
          <BlockAdder onAdd={(t) => addChild(null, t)} />
        </div>
        <div className="space-y-3">
          {doc.blocks.map((block, idx) => (
            <BlockEditorRow
              key={block.id}
              block={block}
              depth={0}
              index={idx}
              total={doc.blocks.length}
              active={activeBlock === block.id}
              onActivate={() => setActiveBlock(block.id)}
              onUpdate={updateBlock}
              onUpdateProps={updateProps}
              onRemove={removeBlock}
              onMove={moveBlock}
              onAddChild={(t) => addChild(block.id, t)}
              onUpload={uploadForBlock}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockAdder({ onAdd }: { onAdd: (t: CmsBlock['type']) => void }) {
  return (
    <div className="relative group">
      <Button size="sm" variant="outline">
        <Plus className="ml-1.5 h-4 w-4" /> افزودن بلوک
      </Button>
      <div className="invisible absolute right-0 z-20 mt-1 grid max-h-72 w-56 grid-cols-1 gap-0.5 overflow-auto rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
        {BLOCK_LIBRARY.map((b) => (
          <button
            key={b.type}
            onClick={() => onAdd(b.type)}
            className="rounded px-3 py-1.5 text-right text-xs hover:bg-[hsl(var(--secondary))]"
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BlockEditorRow(props: {
  block: CmsBlock;
  depth: number;
  index: number;
  total: number;
  active: boolean;
  onActivate: () => void;
  onUpdate: (id: string, patch: Partial<CmsBlock>) => void;
  onUpdateProps: (id: string, props: Record<string, unknown>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onAddChild: (t: CmsBlock['type']) => void;
  onUpload: (id: string, file: File) => void;
}) {
  const { block, depth } = props;
  const [open, setOpen] = useState(props.active || depth === 0);
  const isContainer = [
    'buttons',
    'columns',
    'features',
    'pricing',
    'faq',
    'testimonials',
    'footer-column',
    'hero',
    'cta',
  ].includes(block.type);

  return (
    <div
      className={
        'rounded-lg border bg-[hsl(var(--background))] p-3 ' +
        (props.active ? 'border-[hsl(var(--primary))]' : 'border-[hsl(var(--border))]')
      }
      style={{ marginRight: depth * 12 }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            props.onActivate();
            setOpen((o) => !o);
          }}
          className="flex flex-1 items-center gap-2 text-right text-sm font-medium"
        >
          <span className="rounded bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
            {block.type}
          </span>
          <span className="truncate text-[hsl(var(--muted-foreground))]">
            {(block.props.title as string) ||
              (block.props.text as string) ||
              (block.props.name as string) ||
              block.id}
          </span>
        </button>
        <IconButton
          disabled={props.index === 0}
          onClick={() => props.onMove(block.id, -1)}
          title="انتقال به بالا"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton
          disabled={props.index === props.total - 1}
          onClick={() => props.onMove(block.id, 1)}
          title="انتقال به پایین"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton onClick={() => props.onRemove(block.id)} title="حذف" danger>
          <Trash2 className="h-3.5 w-3.5" />
        </IconButton>
      </div>

      {open ? (
        <div className="mt-3 space-y-3">
          <PropsEditor
            block={block}
            onUpdateProps={props.onUpdateProps}
            onUpload={props.onUpload}
          />
          {isContainer ? (
            <div className="rounded-md border border-dashed border-[hsl(var(--border))] p-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  فرزندان ({block.children?.length ?? 0})
                </span>
                <BlockAdder onAdd={(t) => props.onAddChild(t)} />
              </div>
              <div className="space-y-2">
                {block.children?.map((child, i) => (
                  <BlockEditorRow
                    key={child.id}
                    block={child}
                    depth={depth + 1}
                    index={i}
                    total={block.children!.length}
                    active={false}
                    onActivate={() => {}}
                    onUpdate={props.onUpdate}
                    onUpdateProps={props.onUpdateProps}
                    onRemove={(id) =>
                      props.onUpdate(block.id, {
                        children: (block.children ?? []).filter((c) => c.id !== id),
                      })
                    }
                    onMove={() => {}}
                    onAddChild={(t) =>
                      props.onUpdate(block.id, {
                        children: [...(block.children ?? []), createBlock(t, {})],
                      })
                    }
                    onUpload={props.onUpload}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        'flex h-7 w-7 items-center justify-center rounded border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--secondary))] disabled:opacity-30 ' +
        (danger ? 'hover:text-red-600' : '')
      }
    >
      {children}
    </button>
  );
}

function PropsEditor({
  block,
  onUpdateProps,
  onUpload,
}: {
  block: CmsBlock;
  onUpdateProps: (id: string, props: Record<string, unknown>) => void;
  onUpload: (id: string, file: File) => void;
}) {
  const entries = Object.entries(block.props);
  if (entries.length === 0) {
    return (
      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
        این بلوک پراپرتی قابل ویرایشی ندارد.
      </p>
    );
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <PropField
          key={key}
          blockId={block.id}
          propKey={key}
          value={value}
          onChange={(v) => onUpdateProps(block.id, { [key]: v })}
          onUpload={(f) => onUpload(block.id, f)}
        />
      ))}
    </div>
  );
}

function PropField({
  blockId: _blockId,
  propKey,
  value,
  onChange,
  onUpload,
}: {
  blockId: string;
  propKey: string;
  value: unknown;
  onChange: (v: unknown) => void;
  onUpload: (f: File) => void;
}) {
  const label = propKey;

  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4"
        />
        <span>{label}</span>
      </label>
    );
  }

  if (propKey === 'src' && typeof value === 'string') {
    return (
      <div className="space-y-1 sm:col-span-2">
        <label className="text-[11px] text-[hsl(var(--muted-foreground))]">{label}</label>
        <div className="flex gap-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs"
          />
          <label className="flex cursor-pointer items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2 py-1 text-xs hover:bg-[hsl(var(--secondary))]">
            <ImageIcon className="h-3.5 w-3.5" />
            آپلود
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
              }}
            />
          </label>
        </div>
        {value ? (
          <img
            src={value}
            alt=""
            className="h-24 rounded border border-[hsl(var(--border))] object-cover"
          />
        ) : null}
      </div>
    );
  }

  if (typeof value === 'string') {
    if (value.length > 80 || propKey === 'html' || propKey === 'text') {
      return (
        <div className="space-y-1 sm:col-span-2">
          <label className="text-[11px] text-[hsl(var(--muted-foreground))]">{label}</label>
          <textarea
            value={value}
            rows={3}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs"
          />
        </div>
      );
    }
    return (
      <div className="space-y-1">
        <label className="text-[11px] text-[hsl(var(--muted-foreground))]">{label}</label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs"
        />
      </div>
    );
  }

  if (typeof value === 'number') {
    return (
      <div className="space-y-1">
        <label className="text-[11px] text-[hsl(var(--muted-foreground))]">{label}</label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs"
        />
      </div>
    );
  }

  if (Array.isArray(value)) {
    // string[] editor (features, tags etc.)
    if (value.every((v) => typeof v === 'string')) {
      return (
        <div className="space-y-1 sm:col-span-2">
          <label className="text-[11px] text-[hsl(var(--muted-foreground))]">{label}</label>
          <div className="flex flex-wrap gap-1.5">
            {value.map((v, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[11px]"
              >
                {v}
                <button
                  onClick={() => onChange(value.filter((_x, idx) => idx !== i))}
                  className="text-[hsl(var(--muted-foreground))] hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              placeholder="افزودن + Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  onChange([...value, e.currentTarget.value.trim()]);
                  e.currentTarget.value = '';
                }
              }}
              className="w-32 rounded-full border border-[hsl(var(--border))] bg-transparent px-2 py-0.5 text-[11px] outline-none"
            />
          </div>
        </div>
      );
    }
    // Array of objects (links, items)
    return (
      <div className="space-y-1 sm:col-span-2">
        <label className="text-[11px] text-[hsl(var(--muted-foreground))]">{label}</label>
        <textarea
          value={JSON.stringify(value, null, 2)}
          rows={5}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              /* invalid while typing */
            }
          }}
          className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 font-mono text-[11px]"
        />
      </div>
    );
  }

  if (value && typeof value === 'object') {
    return (
      <div className="space-y-1 sm:col-span-2">
        <label className="text-[11px] text-[hsl(var(--muted-foreground))]">{label} (JSON)</label>
        <textarea
          value={JSON.stringify(value, null, 2)}
          rows={5}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              /* invalid */
            }
          }}
          className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 font-mono text-[11px]"
        />
      </div>
    );
  }

  return null;
}

// ── tree helpers ──────────────────────────────────────────────
function mutateTree(blocks: CmsBlock[], id: string, fn: (b: CmsBlock) => CmsBlock): CmsBlock[] {
  return blocks.map((b) => {
    if (b.id === id) return fn(b);
    if (b.children) return { ...b, children: mutateTree(b.children, id, fn) };
    return b;
  });
}

function removeFromTree(blocks: CmsBlock[], id: string): CmsBlock[] {
  return blocks
    .filter((b) => b.id !== id)
    .map((b) => (b.children ? { ...b, children: removeFromTree(b.children, id) } : b));
}

function reorder(blocks: CmsBlock[], id: string, dir: -1 | 1): CmsBlock[] {
  const idx = blocks.findIndex((b) => b.id === id);
  if (idx < 0) return blocks;
  const target = idx + dir;
  if (target < 0 || target >= blocks.length) return blocks;
  const next = blocks.slice();
  [next[idx], next[target]] = [next[target], next[idx]];
  return next;
}

// newBlockId is imported but marked to avoid unused warning
void newBlockId;
