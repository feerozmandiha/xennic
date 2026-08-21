'use client';

import { useRef, useState } from 'react';
import {
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  Upload,
  ChevronUp,
  ChevronDown,
  ImageOff,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/stores/toast.store';
import {
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_MIME_TYPES,
  addImage,
  isValidImageUrl,
  moveImage,
  publicImageUrl,
  removeImageAt,
  setPrimaryImage,
  uploadErrorMessage,
  type ProductImage,
} from '../lib/product-images';

interface StoredFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface ProductImageEditorProps {
  value: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  disabled?: boolean;
}

/**
 * ویرایشگر آلبوم تصاویر محصول — بارگذاری فایل یا افزودن با آدرس،
 * انتخاب تصویر شاخص (کاور)، جابه‌جایی ترتیب و حذف.
 */
export function ProductImageEditor({ value, onChange, disabled }: ProductImageEditorProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  const isFull = value.length >= MAX_PRODUCT_IMAGES;

  const handleAdd = (image: ProductImage) => {
    if (isFull) {
      toast.error(`حداکثر ${MAX_PRODUCT_IMAGES} تصویر برای هر محصول مجاز است`);
      return false;
    }
    if (value.some((existing) => existing.url === image.url)) {
      toast.error('این تصویر قبلاً به آلبوم اضافه شده است');
      return false;
    }
    onChange(addImage(value, image));
    return true;
  };

  const handleUrlAdd = () => {
    const candidate = url.trim();
    if (!candidate) return;
    if (!isValidImageUrl(candidate)) {
      toast.error('آدرس تصویر باید با http(s) یا / شروع شود');
      return;
    }
    if (handleAdd({ url: candidate })) setUrl('');
  };

  const handleUpload = async (files: FileList | null) => {
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
        const res = await apiClient.post<{ data: StoredFile }>('/storage/upload', fd);
        const uploaded = res.data;

        // آدرس عمومی و ماندگار — نه URL امضاشدهٔ یک‌ساعتهٔ MinIO
        handleAdd({
          url: publicImageUrl(uploaded.id),
          altFa: uploaded.originalName ?? null,
          mimeType: uploaded.mimeType ?? file.type,
          fileSize: uploaded.size ?? file.size,
        });
      }
    } catch (error: unknown) {
      toast.error(uploadErrorMessage(error));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-medium">
          تصاویر محصول{' '}
          <span className="text-[hsl(var(--muted-foreground))]">
            ({value.length}/{MAX_PRODUCT_IMAGES})
          </span>
        </label>
        {value.length > 0 ? (
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
            اولین تصویر، کاور محصول است
          </span>
        ) : null}
      </div>

      {/* افزودن */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={PRODUCT_IMAGE_MIME_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <button
          type="button"
          disabled={disabled || uploading || isFull}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-9 items-center gap-2 rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 text-sm transition-colors hover:bg-[hsl(var(--secondary))] disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          بارگذاری تصویر
        </button>

        <div className="flex min-w-[220px] flex-1 items-center gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUrlAdd();
              }
            }}
            disabled={disabled || isFull}
            dir="ltr"
            placeholder="https://cdn.example.com/product.jpg"
            className="h-9 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 text-sm disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleUrlAdd}
            disabled={disabled || isFull || !url.trim()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 text-sm transition-colors hover:bg-[hsl(var(--secondary))] disabled:opacity-50"
          >
            <ImagePlus className="h-4 w-4" />
            افزودن
          </button>
        </div>
      </div>

      {/* فهرست تصاویر */}
      {value.length === 0 ? (
        <div className="mt-3 flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-[hsl(var(--border))] py-8 text-center">
          <ImageOff className="mb-2 h-6 w-6 text-[hsl(var(--muted-foreground))] opacity-40" />
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            هنوز تصویری برای این محصول ثبت نشده است
          </p>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {value.map((image, index) => (
            <li
              key={image.id ?? image.url}
              className="flex items-start gap-3 rounded-[var(--radius)] border border-[hsl(var(--border))] p-2"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius)] bg-[hsl(var(--secondary))]">
                {broken[image.url] ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageOff className="h-5 w-5 text-[hsl(var(--muted-foreground))] opacity-50" />
                  </div>
                ) : (
                  <img
                    src={image.url}
                    alt={image.altFa ?? image.altEn ?? ''}
                    className="h-full w-full object-cover"
                    onError={() => setBroken((s) => ({ ...s, [image.url]: true }))}
                  />
                )}
                {index === 0 ? (
                  <span className="absolute bottom-0 start-0 end-0 bg-[hsl(var(--primary))] py-0.5 text-center text-[9px] font-medium text-white">
                    کاور
                  </span>
                ) : null}
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="truncate text-[11px] text-[hsl(var(--muted-foreground))]" dir="ltr">
                  {image.url}
                </p>
                <div className="flex gap-2">
                  <input
                    value={image.altFa ?? ''}
                    onChange={(e) =>
                      onChange(
                        value.map((item, i) =>
                          i === index ? { ...item, altFa: e.target.value } : item,
                        ),
                      )
                    }
                    disabled={disabled}
                    placeholder="متن جایگزین (فارسی)"
                    className="h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-xs"
                  />
                  <input
                    value={image.altEn ?? ''}
                    onChange={(e) =>
                      onChange(
                        value.map((item, i) =>
                          i === index ? { ...item, altEn: e.target.value } : item,
                        ),
                      )
                    }
                    disabled={disabled}
                    dir="ltr"
                    placeholder="Alt text (English)"
                    className="h-8 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  title="انتخاب به‌عنوان کاور"
                  disabled={disabled || index === 0}
                  onClick={() => onChange(setPrimaryImage(value, index))}
                  className="rounded-[var(--radius)] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))] disabled:opacity-30"
                >
                  <Star className={`h-3.5 w-3.5 ${index === 0 ? 'fill-current' : ''}`} />
                </button>
                <button
                  type="button"
                  title="بالا"
                  disabled={disabled || index === 0}
                  onClick={() => onChange(moveImage(value, index, -1))}
                  className="rounded-[var(--radius)] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="پایین"
                  disabled={disabled || index === value.length - 1}
                  onClick={() => onChange(moveImage(value, index, 1))}
                  className="rounded-[var(--radius)] p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="حذف"
                  disabled={disabled}
                  onClick={() => onChange(removeImageAt(value, index))}
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
