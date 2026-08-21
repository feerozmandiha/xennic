'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Package, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface StorefrontProduct {
  id: string;
  sku: string;
  type: string;
  category: string | null;
  title: string;
  price: number;
  currency: string;
  vendorName: string;
}

export function StorefrontProductCard({ product }: { product: StorefrontProduct }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const numberLocale = locale === 'fa' ? 'fa-IR' : 'en-US';

  return (
    <Link href={`/${locale}/marketplace/products/${product.id}`} className="group">
      <Card className="card-hover h-full transition-all group-hover:-translate-y-0.5">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[hsl(var(--primary)/0.08)]">
              <Package className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{product.title}</p>
              <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{product.sku}</p>
            </div>
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
