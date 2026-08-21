'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Package, Building2 } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { altFor, type ProductImage } from '../lib/product-images';

export interface StorefrontProduct {
  id: string;
  sku: string;
  type: string;
  category: string | null;
  title: string;
  price: number;
  currency: string;
  vendorName: string;
  primaryImageUrl?: string | null;
  images?: ProductImage[];
}

export function StorefrontProductCard({ product }: { product: StorefrontProduct }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const numberLocale = locale === 'fa' ? 'fa-IR' : 'en-US';
  const [broken, setBroken] = useState(false);

  const cover = product.primaryImageUrl ?? product.images?.[0]?.url ?? null;
  const coverAlt = product.images?.[0] ? altFor(product.images[0], locale) : '';
  const showCover = Boolean(cover) && !broken;

  return (
    <Link href={`/${locale}/marketplace/products/${product.id}`} className="group">
      <Card className="card-hover h-full overflow-hidden transition-all group-hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[var(--radius-xl)] bg-[hsl(var(--secondary))]">
          {showCover ? (
            <img
              src={cover as string}
              alt={coverAlt || product.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setBroken(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-8 w-8 text-[hsl(var(--muted-foreground))] opacity-30" />
            </div>
          )}
          {(product.images?.length ?? 0) > 1 ? (
            <span className="absolute bottom-2 end-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
              +{(product.images?.length ?? 1) - 1}
            </span>
          ) : null}
        </div>

        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{product.title}</p>
            <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{product.sku}</p>
          </div>

          <div className="flex items-center gap-2">
            {product.category ? (
              <Badge variant="secondary" className="text-[10px]">
                {product.category}
              </Badge>
            ) : null}
            {product.vendorName ? (
              <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                <Building2 className="h-3 w-3" />
                {product.vendorName}
              </span>
            ) : null}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-[hsl(var(--border))] pt-3">
            <span className="text-sm font-bold text-[hsl(var(--primary))]">
              {Number(product.price).toLocaleString(numberLocale)}{' '}
              <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">
                {product.currency}
              </span>
            </span>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">{product.type}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
