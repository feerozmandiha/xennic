'use client';

import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { altFor, type ProductImage } from '../lib/product-images';

interface Props {
  images: ProductImage[];
  title: string;
  locale: string;
}

/** نمایش آلبوم تصاویر محصول — تصویر بزرگ + نوار بندانگشتی. */
export function StorefrontProductGallery({ images, title, locale }: Props) {
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setActive(0);
  }, [images]);

  const current = images[active] ?? images[0] ?? null;
  const showMain = current ? !broken[current.url] : false;

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-xl)] bg-[hsl(var(--secondary))]">
        {current && showMain ? (
          <img
            src={current.url}
            alt={altFor(current, locale) || title}
            className="h-full w-full object-contain"
            onError={() => setBroken((s) => ({ ...s, [current.url]: true }))}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 text-[hsl(var(--muted-foreground))] opacity-30" />
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id ?? image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${title} — ${index + 1}`}
              aria-current={index === active}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius)] border transition-colors ${
                index === active
                  ? 'border-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]'
              }`}
            >
              {broken[image.url] ? (
                <div className="flex h-full w-full items-center justify-center bg-[hsl(var(--secondary))]">
                  <Package className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-40" />
                </div>
              ) : (
                <img
                  src={image.url}
                  alt={altFor(image, locale) || title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  onError={() => setBroken((s) => ({ ...s, [image.url]: true }))}
                />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
