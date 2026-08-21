'use client';

import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronUp,
  ImageOff,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/stores/toast.store';
import {
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_MIME_TYPES,
  isValidImageUrl,
  type ProductImage,
} from '../lib/product-images';

interface ProductGalleryManagerProps {
  productId: string;
  images: ProductImage[];
}

/**
 * مدیریت آلبوم یک محصول موجود — هر عمل مستقیماً روی endpointهای اختصاصی
 * تصاویر انجام می‌شود تا ترتیب و تصویر شاخص در سرور معتبر بماند.
 */
export function ProductGalleryManager({ productId, images }: ProductGalleryManagerProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['marketplace'] });
  };

  const mutation = useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: () => invalidate(),
    onError: (error: any) => toast.error(error?.message ?? 'خطا در ذخیره تصاویر'),
  });

  const run = (action: () => Promise<unknown>) => mutation.mutate(action);
  const busy = mutation.isPending || uploading;
  const isFull = images.length >= MAX_PRODUCT_IMAGES;

  const addByUrl = () => {
    const candidate = url.trim();
    if (!candidate) return;
    if (!isValidImageUrl(candidate)) {
      toast.error('آدرس تصویر باید با http(s) یا / شروع شود');
      return;
    }
    run(async () => {
      await apiClient.post(`/products/${productId}/images`, { url: candidate });
      setUrl('');
    });
  };

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!PRODUCT_IMAGE_MIME_TYPES.includes(file.type)) {
          toast.error(`فرمت «${file.type || file.name}» پشتیبانی نمی‌شود`);
          continue;
        }

        const fd = new FormData();
        fd.append('file', file);
        const res = await apiClient.post<{ data: any }>('/storage/upload', fd);
        const uploaded = res.data;

        await apiClient.post(`/products/${productId}/images`, {
          url: uploaded.downloadUrl ?? `/api/v1/storage/files/${uploaded.id}/download`,
          altFa: uploaded.originalName ?? undefined,
          mimeType: uploaded.mimeType ?? file.type,
          fileSize: uploaded.size ?? file.size,
        });
      }
      invalidate();
    } catch (error: any) {
      toast.error(error?.message ?? 'خطا در بارگذاری تصویر');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;

    const ids = images.map((image) => image.id!);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(() => apiClient.put(`/products/${productId}/images/order`, { imageIds: ids }));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          آلبوم تصاویر{' '}
          <span className="text-[hsl(var(--muted-foreground))]">
            ({images.length}/{MAX_PRODUCT_IMAGES})
          </span>
        </h2>
        {busy ? <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))]" /> : null}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={PRODUCT_IMAGE_MIME_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <button
          type="button"
          disabled={busy || isFull}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-9 items-center gap-2 rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 text-sm transition-colors hover:bg-[hsl(var(--secondary))] disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          بارگذاری تصویر
        </button>
        <div className="flex min-w-[220px] flex-1 items-center gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addByUrl();
              }
            }}
            disabled={busy || isFull}
            dir="ltr"
            placeholder="https://cdn.example.com/product.jpg"
            className="h-9 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 text-sm disabled:opacity-50"
          />
          <button
            type="button"
            onClick={addByUrl}
            disabled={busy || isFull || !url.trim()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 text-sm transition-colors hover:bg-[hsl(var(--secondary))] disabled:opacity-50"
          >
            <ImagePlus className="h-4 w-4" />
            افزودن
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-[hsl(var(--border))] py-10 text-center">
          <ImageOff className="mb-2 h-6 w-6 text-[hsl(var(--muted-foreground))] opacity-40" />
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            هنوز تصویری برای این محصول ثبت نشده است
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="overflow-hidden rounded-[var(--radius)] border border-[hsl(var(--border))]"
            >
              <div className="relative aspect-square bg-[hsl(var(--secondary))]">
                {broken[image.url] ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageOff className="h-6 w-6 text-[hsl(var(--muted-foreground))] opacity-40" />
                  </div>
                ) : (
                  <img
                    src={image.url}
                    alt={image.altFa ?? image.altEn ?? ''}
                    className="h-full w-full object-cover"
                    onError={() => setBroken((s) => ({ ...s, [image.url]: true }))}
                  />
                )}
                {image.isPrimary ? (
                  <span className="absolute top-1.5 start-1.5 rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[10px] font-medium text-white">
                    کاور
                  </span>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-1 border-t border-[hsl(var(--border))] px-1.5 py-1">
                <button
                  type="button"
                  title="انتخاب به‌عنوان کاور"
                  disabled={busy || image.isPrimary}
                  onClick={() =>
                    run(() =>
                      apiClient.put(`/products/${productId}/images/${image.id}/primary`, {}),
                    )
                  }
                  className="rounded-[var(--radius)] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--primary))] disabled:opacity-30"
                >
                  <Star className={`h-3.5 w-3.5 ${image.isPrimary ? 'fill-current' : ''}`} />
                </button>
                <button
                  type="button"
                  title="جابه‌جایی به عقب"
                  disabled={busy || index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded-[var(--radius)] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="جابه‌جایی به جلو"
                  disabled={busy || index === images.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded-[var(--radius)] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="حذف"
                  disabled={busy}
                  onClick={() =>
                    run(() => apiClient.delete(`/products/${productId}/images/${image.id}`))
                  }
                  className="rounded-[var(--radius)] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--destructive)/0.08)] hover:text-[hsl(var(--destructive))] disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
