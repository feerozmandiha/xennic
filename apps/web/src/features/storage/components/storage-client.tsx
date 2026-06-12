'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload, FileText, Image, Archive,
  Download, Trash2, HardDrive, MoreHorizontal,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge }    from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuthStore } from '@/stores/auth.store';
import { useToast }     from '@/stores/toast.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';

const API_BASE = typeof window !== 'undefined'
  ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`
  : `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`;

// ── File Icon ─────────────────────────────────────────────────────────────────

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/'))
    return <Image className="h-5 w-5 text-[hsl(var(--accent))]" />;
  if (mimeType === 'application/pdf' || mimeType.includes('word') || mimeType.includes('excel'))
    return <FileText className="h-5 w-5 text-[hsl(var(--primary))]" />;
  return <Archive className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />;
}

// ── Bucket Badge ──────────────────────────────────────────────────────────────

const BUCKET_VARIANT: Record<string, string> = {
  public:      'default',
  private:     'secondary',
  documents:   'default',
  reports:     'success',
  engineering: 'warning',
  ai:          'info',
};

// ── Upload Zone ───────────────────────────────────────────────────────────────

function UploadZone({ onUpload }: { onUpload: (file: File) => void }) {
  const t = useTranslations('storage');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-8',
        'border-2 border-dashed rounded-[var(--radius-xl)] cursor-pointer',
        'transition-all duration-200',
        dragging
          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]'
          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--secondary)/0.5)]',
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
        <Upload className="h-6 w-6 text-[hsl(var(--primary))]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{t('upload')}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
          کشیدن و رها کردن یا کلیک برای انتخاب
        </p>
        <p className="text-[10px] text-[hsl(var(--muted-foreground)/0.7)] mt-1">
          حداکثر ۱۰۰ مگابایت
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])}
      />
    </div>
  );
}

// ── File Row ──────────────────────────────────────────────────────────────────

function FileRow({ file, onDelete, onDownload }: {
  file: any;
  onDelete:   (id: string) => void;
  onDownload: (id: string, name: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-[hsl(var(--secondary)/0.4)] transition-colors group">
      {/* Icon */}
      <div className="w-9 h-9 rounded-[var(--radius)] bg-[hsl(var(--secondary))] flex items-center justify-center shrink-0">
        <FileIcon mimeType={file.mimeType} />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{file.originalName}</p>
        <p className="text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 mt-0.5">
          <span>{file.sizeHuman}</span>
          <span className="opacity-40">•</span>
          <span>{new Date(file.createdAt).toLocaleDateString('fa-IR')}</span>
        </p>
      </div>

      {/* Bucket */}
      <Badge variant={(BUCKET_VARIANT[file.bucket] ?? 'secondary') as any} className="shrink-0 hidden sm:inline-flex text-[10px]">
        {file.bucket}
      </Badge>

      {/* Actions */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--secondary))] opacity-0 group-hover:opacity-100 transition-all shrink-0">
            <MoreHorizontal className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[140px] rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-lg p-1 animate-fade-in"
            align="end" sideOffset={4}
          >
            <DropdownMenu.Item
              className={menuItem}
              onSelect={() => onDownload(file.id, file.originalName)}
            >
              <Download className="h-3.5 w-3.5" />
              دانلود
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-[hsl(var(--border))]" />
            <DropdownMenu.Item
              className={cn(menuItem, 'text-[hsl(var(--destructive))]')}
              onSelect={() => onDelete(file.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              حذف
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

const menuItem = cn(
  'flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] text-sm cursor-pointer',
  'hover:bg-[hsl(var(--secondary))] transition-colors select-none w-full',
  'focus:outline-none data-[highlighted]:bg-[hsl(var(--secondary))]',
);

// ── Main ──────────────────────────────────────────────────────────────────────

export function StorageClient() {
  const t           = useTranslations('storage');
  const wsId        = useAuthStore(s => s.workspaceId);
  const token       = useAuthStore(s => s.token);
  const toast       = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  // Files list
  const { data, isLoading } = useQuery({
    queryKey: ['files', wsId],
    queryFn:  () => apiClient.get<any>('/storage/files?limit=50'),
    enabled:  !!wsId,
  });

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['storage-stats-page', wsId],
    queryFn:  () => apiClient.get<any>('/storage/stats'),
    enabled:  !!wsId,
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/storage/files/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats-page'] });
      toast.success('فایل حذف شد');
    },
    onError: () => toast.error('خطا در حذف فایل'),
  });

  // Upload
  async function handleUpload(file: File) {
    if (!wsId || !token) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/storage/upload`, {
        method: 'POST',
        headers: {
          'Authorization':  `Bearer ${token}`,
          'x-workspace-id': wsId,
        },
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        toast.success(t('uploadSuccess'), file.name);
        queryClient.invalidateQueries({ queryKey: ['files'] });
        queryClient.invalidateQueries({ queryKey: ['storage-stats-page'] });
      } else {
        toast.error('خطا در آپلود', json.error?.message);
      }
    } catch {
      toast.error('خطا در آپلود فایل');
    } finally {
      setUploading(false);
    }
  }

  // Download
  async function handleDownload(id: string, name: string) {
    try {
      const fileData = await apiClient.get<any>(`/storage/files/${id}`);
      if (fileData?.data?.downloadUrl) {
        const a = document.createElement('a');
        a.href = fileData.data.downloadUrl;
        a.download = name;
        a.click();
      }
    } catch {
      toast.error('خطا در دانلود فایل');
    }
  }

  const files = data?.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('title')}
        description={stats?.data ? `${stats.data.totalFiles} فایل — ${stats.data.totalSizeHuman}` : undefined}
      />

      {/* Stats */}
      {stats?.data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'تعداد فایل‌ها', value: stats.data.totalFiles, icon: '📁' },
            { label: 'حجم کل',        value: stats.data.totalSizeHuman, icon: '💾' },
            { label: 'آخرین آپلود',   value: files[0] ? new Date(files[0].createdAt).toLocaleDateString('fa-IR') : '—', icon: '🕒' },
          ].map(item => (
            <Card key={item.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.label}</p>
                  <p className="text-sm font-bold">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Upload Zone */}
        <div className="xl:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Upload className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                آپلود فایل جدید
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uploading ? (
                <div className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-[hsl(var(--primary)/0.3)] rounded-[var(--radius-xl)]">
                  <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">در حال آپلود...</p>
                </div>
              ) : (
                <UploadZone onUpload={handleUpload} />
              )}
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-[hsl(var(--muted-foreground))] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">فضای مصرف‌شده</p>
                  <div className="h-1.5 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[hsl(var(--primary))] rounded-full transition-all"
                      style={{ width: '5%' }}
                    />
                  </div>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
                    {stats?.data?.totalSizeHuman ?? '0 B'} از ۱ GB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Files List */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">فایل‌های آپلودشده</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-14" />)}
              </div>
            ) : files.length > 0 ? (
              <div className="divide-y divide-[hsl(var(--border))]">
                {files.map((file: any) => (
                  <FileRow
                    key={file.id}
                    file={file}
                    onDelete={id => deleteMutation.mutate(id)}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <HardDrive className="h-10 w-10 text-[hsl(var(--muted-foreground))] opacity-30 mb-3" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  هنوز فایلی آپلود نشده
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
