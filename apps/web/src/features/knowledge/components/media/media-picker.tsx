'use client';

import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, Search, FileText, X, Loader2, Link as LinkIcon } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/stores/toast.store';
import { cn } from '@/lib/utils';

interface StoredFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  sizeHuman: string;
  downloadUrl?: string;
  createdAt: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (src: string, label?: string) => void;
  /** 'image' to filter only images, 'file' for any type */
  accept?: 'image' | 'file';
}

const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
];

export function MediaPicker({ open, onClose, onSelect, accept = 'image' }: Props) {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'library' | 'upload' | 'url'>('library');
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['storage-files', q],
    queryFn: () =>
      apiClient.get<{ success: boolean; data: StoredFile[]; meta: any }>(
        `/storage/files?limit=50${q ? `&search=${encodeURIComponent(q)}` : ''}`,
      ),
    enabled: open && tab === 'library',
    retry: false,
  });

  const files = (data?.data ?? []).filter((f) =>
    accept === 'image' ? IMAGE_TYPES.includes(f.mimeType) : true,
  );

  async function uploadFiles(files: FileList | File[]) {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await apiClient.post<{ success: boolean; data: StoredFile }>(
          '/storage/upload',
          fd,
        );
        const src = res.data.downloadUrl ?? `/api/v1/storage/files/${res.data.id}/download`;
        onSelect(src, res.data.originalName);
      }
      await refetch();
      toast.success('فایل‌ها بارگذاری شدند');
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? 'خطا در بارگذاری');
    } finally {
      setUploading(false);
    }
  }

  function pickFromUrl() {
    if (!url.trim()) return;
    onSelect(url.trim());
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[min(92vw,760px)] max-h-[85vh] -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl',
            'flex flex-col animate-fade-in',
          )}
        >
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4">
            <h3 className="font-bold">انتخاب رسانه</h3>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1.5 hover:bg-[hsl(var(--secondary))]">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex gap-2 border-b border-[hsl(var(--border))] px-5">
            {(
              [
                { k: 'library', label: 'کتابخانه' },
                { k: 'upload', label: 'بارگذاری' },
                { k: 'url', label: 'از آدرس' },
              ] as const
            ).map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={cn(
                  'relative px-3 py-2.5 text-sm font-medium transition-colors',
                  tab === t.k
                    ? 'text-[hsl(var(--primary))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-foreground',
                )}
              >
                {t.label}
                {tab === t.k && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[hsl(var(--primary))]" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {tab === 'library' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="جستجو در فایل‌ها..."
                    className="pr-9"
                  />
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    در حال بارگذاری...
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    فایلی یافت نشد. از تب «بارگذاری» فایل جدید اضافه کنید.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {files.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          const src = f.downloadUrl ?? `/api/v1/storage/files/${f.id}/download`;
                          onSelect(src, f.originalName);
                          onClose();
                        }}
                        className="group flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 text-right transition-all hover:border-[hsl(var(--primary))] hover:shadow-md"
                      >
                        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-[hsl(var(--muted))]">
                          {IMAGE_TYPES.includes(f.mimeType) ? (
                            <img
                              src={`/api/v1/storage/files/${f.id}/download`}
                              alt={f.originalName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FileText className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                          )}
                        </div>
                        <div className="truncate text-xs" title={f.originalName}>
                          {f.originalName}
                        </div>
                        <div className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">
                          {f.sizeHuman}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'upload' && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
                }}
                className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[hsl(var(--border))] p-8 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-medium">
                    {uploading ? 'در حال بارگذاری...' : 'فایل را اینجا رها کنید'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    تصاویر، PDF، و سندها تا ۱۰۰ مگابایت
                  </p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  hidden
                  multiple
                  accept={accept === 'image' ? 'image/*' : '*/*'}
                  onChange={(e) => e.target.files && uploadFiles(e.target.files)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                >
                  انتخاب از سیستم
                </Button>
              </div>
            )}

            {tab === 'url' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium">آدرس فایل یا تصویر</label>
                <div className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/image.png"
                    dir="ltr"
                  />
                  <Button type="button" onClick={pickFromUrl} disabled={!url.trim()}>
                    <LinkIcon className="h-4 w-4" />
                    درج
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  آدرس باید مستقیماً به فایل اشاره کند و قابل دسترسی باشد.
                </p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
