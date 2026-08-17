'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Save, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cmsApi } from '../lib/api';
import { EDITABLE_SLOTS, getDefaultDocument } from '../lib/default-content';
import { instantiateBlock, BLOCK_LIBRARY, getBlockDef } from '../lib/block-library';
import { EMPTY_DOCUMENT, type CmsBlock, type CmsContent, type CmsDocument } from '../lib/types';
import { CmsDocumentRenderer } from '../blocks/cms-renderer';
import { StyleEditor } from './style-editor';
import { PropsEditor } from './props-editor';

type Tab = 'content' | 'style';

export function CmsEditor() {
  const [slot, setSlot] = useState(EDITABLE_SLOTS[0].slot);
  const [locale, setLocale] = useState('fa');
  const [doc, setDoc] = useState<CmsDocument>(EMPTY_DOCUMENT);
  const [record, setRecord] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('content');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await cmsApi.getBySlot(slot, locale);
      setRecord(res.data);
      setDoc(normalizeDoc(res.data.document));
      return;
    } catch {
      /* not found */
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

  // tree helpers
  function mutateTree(blocks: CmsBlock[], id: string, fn: (b: CmsBlock) => CmsBlock): CmsBlock[] {
    return blocks.map((b) => {
      if (b.id === id) return fn(b);
      if (b.children) return { ...b, children: mutateTree(b.children, id, fn) };
      return b;
    });
  }

  function updateProps(id: string, props: Record<string, unknown>) {
    setDoc((d) => ({
      ...d,
      blocks: mutateTree(d.blocks, id, (b) => ({ ...b, props: { ...b.props, ...props } })),
    }));
  }

  function updateStyle(id: string, style: CmsBlock['style']) {
    setDoc((d) => ({
      ...d,
      blocks: mutateTree(d.blocks, id, (b) => ({ ...b, style })),
    }));
  }

  function removeBlock(id: string) {
    const rm = (blocks: CmsBlock[]): CmsBlock[] =>
      blocks
        .filter((b) => b.id !== id)
        .map((b) => (b.children ? { ...b, children: rm(b.children) } : b));
    setDoc((d) => ({ ...d, blocks: rm(d.blocks) }));
    if (activeBlock === id) setActiveBlock(null);
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setDoc((d) => ({ ...d, blocks: reorderTree(d.blocks, id, dir) }));
  }

  function addBlock(parentId: string | null, type: string) {
    const block = instantiateBlock(type);
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

  async function handleUpload(file: File): Promise<string> {
    const media = await cmsApi.uploadMedia(file, slot.split('/')[0] ?? 'cms');
    return media.url;
  }

  async function save(publish: boolean) {
    setSaving(true);
    setMessage(null);
    const payload: CmsDocument = { ...doc, schema: 'xennic-cms/v2' };
    try {
      if (record) {
        const res = await cmsApi.patch(record.id, { document: payload, publish });
        setRecord(res.data);
        setDoc(normalizeDoc(res.data.document));
      } else {
        const res = await cmsApi.upsert({ slot, locale, document: payload, publish });
        setRecord(res.data);
        setDoc(normalizeDoc(res.data.document));
      }
      setMessage({ kind: 'ok', text: publish ? 'منتشر شد ✓' : 'پیش‌نویس ذخیره شد ✓' });
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

  const active = findBlock(doc.blocks, activeBlock);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <Select
          value={slot}
          onChange={setSlot}
          options={EDITABLE_SLOTS.map((s) => ({ value: s.slot, label: s.label }))}
        />
        <Select
          value={locale}
          onChange={setLocale}
          options={[
            { value: 'fa', label: 'فارسی' },
            { value: 'en', label: 'English' },
          ]}
        />

        <div className="mx-1 h-6 w-px bg-[hsl(var(--border))]" />

        <div className="flex overflow-hidden rounded-md border border-[hsl(var(--border))]">
          <DeviceButton active={device === 'desktop'} onClick={() => setDevice('desktop')}>
            دسکتاپ
          </DeviceButton>
          <DeviceButton active={device === 'mobile'} onClick={() => setDevice('mobile')}>
            موبایل
          </DeviceButton>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span
            className={
              'rounded-full px-2.5 py-0.5 text-[10px] ' +
              (record?.published
                ? 'bg-emerald-500/15 text-emerald-600'
                : 'bg-amber-500/15 text-amber-600')
            }
          >
            {record?.published ? 'منتشرشده' : record ? 'پیش‌نویس' : 'جدید'}
          </span>
          {dirty ? <span className="text-[10px] text-amber-600">ذخیره نشده</span> : null}
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

      <div className="grid gap-4 lg:grid-cols-[280px_1fr_320px]">
        {/* Left: block library */}
        <aside className="space-y-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 max-h-[80vh] overflow-y-auto">
          <h3 className="text-xs font-bold">افزودن بلوک</h3>
          {(['layout', 'content', 'media', 'marketing', 'navigation'] as const).map((cat) => (
            <div key={cat} className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                {catLabel(cat)}
              </p>
              {BLOCK_LIBRARY.filter((b) => b.category === cat).map((b) => (
                <button
                  key={b.type}
                  onClick={() => addBlock(null, b.type)}
                  className="block w-full rounded-md px-2 py-1.5 text-right text-xs hover:bg-[hsl(var(--secondary))]"
                >
                  + {b.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Middle: preview */}
        <section className="space-y-3">
          <div
            className={
              'mx-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] transition-all ' +
              (device === 'mobile' ? 'max-w-sm' : 'w-full')
            }
          >
            <div className="max-h-[70vh] overflow-y-auto p-1">
              <CmsDocumentRenderer document={doc} />
            </div>
          </div>

          {/* Tree */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
            <h3 className="mb-2 text-xs font-bold">ساختار بلوک‌ها</h3>
            <div className="space-y-1">
              {doc.blocks.map((b, i) => (
                <BlockTreeItem
                  key={b.id}
                  block={b}
                  depth={0}
                  index={i}
                  total={doc.blocks.length}
                  activeId={activeBlock}
                  onSelect={setActiveBlock}
                  onRemove={removeBlock}
                  onMove={moveBlock}
                  onAddChild={addBlock}
                />
              ))}
              <AddBlockButton onAdd={(t) => addBlock(null, t)} />
            </div>
          </div>
        </section>

        {/* Right: inspector */}
        <aside className="space-y-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 max-h-[80vh] overflow-y-auto">
          {active ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold">ویرایش بلوک</h3>
                <button
                  onClick={() => setActiveBlock(null)}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-1 rounded-md border border-[hsl(var(--border))] p-0.5 text-[11px]">
                <TabBtn active={tab === 'content'} onClick={() => setTab('content')}>
                  <Pencil className="h-3 w-3" /> محتوا
                </TabBtn>
                <TabBtn active={tab === 'style'} onClick={() => setTab('style')}>
                  استایل
                </TabBtn>
              </div>

              {tab === 'content' ? (
                <PropsEditor
                  def={
                    getBlockDef(active.type) ?? {
                      type: active.type,
                      label: active.type,
                      category: 'content',
                      defaultProps: {},
                      fields: [],
                    }
                  }
                  block={active}
                  onChange={(props) => updateProps(active.id, props)}
                  onUpload={handleUpload}
                />
              ) : (
                <StyleEditor
                  value={active.style}
                  onChange={(style) => updateStyle(active.id, style)}
                />
              )}
            </>
          ) : (
            <div className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
              یک بلوک را برای ویرایش انتخاب کنید.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ── Sub components ────────────────────────────────────────── */

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1.5 text-xs outline-none focus:border-[hsl(var(--primary))]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function DeviceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        'px-3 py-1.5 text-xs transition ' +
        (active ? 'bg-[hsl(var(--primary))] text-white' : 'hover:bg-[hsl(var(--secondary))]')
      }
    >
      {children}
    </button>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        'flex flex-1 items-center justify-center gap-1 rounded py-1 transition ' +
        (active ? 'bg-[hsl(var(--secondary))] font-medium' : 'text-[hsl(var(--muted-foreground))]')
      }
    >
      {children}
    </button>
  );
}

function AddBlockButton({ onAdd }: { onAdd: (type: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-[hsl(var(--border))] py-1.5 text-[11px] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"
      >
        <Plus className="h-3 w-3" /> افزودن بلوک
      </button>
      {open ? (
        <div className="absolute z-20 mt-1 grid max-h-56 w-full overflow-auto rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1 shadow-xl">
          {BLOCK_LIBRARY.map((b) => (
            <button
              key={b.type}
              onClick={() => {
                onAdd(b.type);
                setOpen(false);
              }}
              className="rounded px-2 py-1 text-right text-[11px] hover:bg-[hsl(var(--secondary))]"
            >
              {b.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BlockTreeItem({
  block,
  depth,
  index,
  total,
  activeId,
  onSelect,
  onRemove,
  onMove,
  onAddChild,
}: {
  block: CmsBlock;
  depth: number;
  index: number;
  total: number;
  activeId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onAddChild: (parentId: string, type: string) => void;
}) {
  const def = getBlockDef(block.type);
  const hasChildren = !!block.children?.length;
  return (
    <div>
      <div
        className={
          'group flex items-center gap-1 rounded-md py-1 pr-2 text-[11px] ' +
          (activeId === block.id
            ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
            : 'hover:bg-[hsl(var(--secondary))]')
        }
        style={{ paddingRight: depth * 12 + 8 }}
      >
        <button
          onClick={() => onSelect(block.id)}
          className="flex flex-1 items-center gap-1.5 text-right"
        >
          {block.hidden ? (
            <EyeOff className="h-3 w-3 opacity-50" />
          ) : (
            <Eye className="h-3 w-3 opacity-40" />
          )}
          <span className="font-medium">{def?.label ?? block.type}</span>
          <span className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">
            {labelOf(block)}
          </span>
        </button>
        <IconBtn disabled={index === 0} title="بالا" onClick={() => onMove(block.id, -1)}>
          <ArrowUp className="h-3 w-3" />
        </IconBtn>
        <IconBtn disabled={index === total - 1} title="پایین" onClick={() => onMove(block.id, 1)}>
          <ArrowDown className="h-3 w-3" />
        </IconBtn>
        <IconBtn title="حذف" danger onClick={() => onRemove(block.id)}>
          <Trash2 className="h-3 w-3" />
        </IconBtn>
      </div>
      {hasChildren ? (
        <div className="mr-4 border-r border-[hsl(var(--border))] pr-2">
          {block.children!.map((c, i) => (
            <BlockTreeItem
              key={c.id}
              block={c}
              depth={depth + 1}
              index={i}
              total={block.children!.length}
              activeId={activeId}
              onSelect={onSelect}
              onRemove={onRemove}
              onMove={onMove}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      ) : null}
      {isContainer(block.type) ? (
        <div className="mr-4 pr-2">
          <AddBlockButton onAdd={(t) => onAddChild(block.id, t)} />
        </div>
      ) : null}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  danger,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={
        'flex h-5 w-5 items-center justify-center rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] disabled:opacity-30 ' +
        (danger ? 'hover:text-red-500' : '')
      }
    >
      {children}
    </button>
  );
}

/* ── helpers ───────────────────────────────────────────────── */

function findBlock(blocks: CmsBlock[], id: string | null): CmsBlock | null {
  if (!id) return null;
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children) {
      const found = findBlock(b.children, id);
      if (found) return found;
    }
  }
  return null;
}

function reorderTree(blocks: CmsBlock[], id: string, dir: -1 | 1): CmsBlock[] {
  const idx = blocks.findIndex((b) => b.id === id);
  if (idx >= 0) {
    const target = idx + dir;
    if (target < 0 || target >= blocks.length) return blocks;
    const next = blocks.slice();
    [next[idx], next[target]] = [next[target], next[idx]];
    return next;
  }
  // recurse into children
  return blocks.map((b) => (b.children ? { ...b, children: reorderTree(b.children, id, dir) } : b));
}

function isContainer(type: string): boolean {
  return [
    'buttons',
    'columns',
    'features',
    'pricing',
    'faq',
    'testimonials',
    'stats',
    'articles',
    'logos',
    'cards',
    'steps',
    'footer-column',
    'social-links',
    'hero',
    'cta',
  ].includes(type);
}

function labelOf(b: CmsBlock): string {
  const p = b.props ?? {};
  return (
    (p.title as string) || (p.text as string) || (p.label as string) || (p.name as string) || ''
  );
}

function catLabel(c: string): string {
  return (
    (
      {
        layout: 'چیدمان',
        content: 'محتوا',
        media: 'رسانه',
        marketing: 'بازاریابی',
        navigation: 'ناوبری',
      } as Record<string, string>
    )[c] ?? c
  );
}

function normalizeDoc(d: CmsDocument): CmsDocument {
  // v1 → v2: just ensure schema
  if (!d.schema || (d.schema as string) === 'xennic-cms/v1') {
    return { ...d, schema: 'xennic-cms/v2' };
  }
  return d;
}
