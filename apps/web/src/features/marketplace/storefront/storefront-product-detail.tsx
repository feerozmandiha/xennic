'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { useCartStore, useCartTotals } from '@/stores/cart.store';
import { useToast } from '@/stores/toast.store';
import { StorefrontProductGallery } from './storefront-product-gallery';
import type { ProductImage } from '../lib/product-images';

interface StorefrontProductDetail {
  id: string;
  sku: string;
  type: string;
  category: string | null;
  title: string;
  description: string | null;
  specifications: Record<string, any> | null;
  price: number;
  currency: string;
  vendorName: string;
  vendorSlug: string;
  primaryImageUrl?: string | null;
  images?: ProductImage[];
}

export function StorefrontProductDetail({ id }: { id: string }) {
  const t = useTranslations('marketplace');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const numberLocale = locale === 'fa' ? 'fa-IR' : 'en-US';

  const toast = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const { count } = useCartTotals();

  const { data, isLoading } = useQuery({
    queryKey: ['storefront', 'product', id, locale],
    queryFn: () =>
      apiClient.get<StorefrontProductDetail>(`/public/marketplace/products/${id}?locale=${locale}`),
    enabled: !!id,
    retry: false,
  });

  const handleAddToCart = () => {
    if (!data) return;
    addItem({
      productId: data.id,
      sku: data.sku,
      title: data.title,
      price: data.price,
      currency: data.currency,
      vendorName: data.vendorName,
    });
    toast.success(t('addedToCart'));
  };

  if (isLoading) return <Skeleton className="h-72" />;
  if (!data) return <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('notFound')}</p>;

  const specs = Object.entries(data.specifications ?? {});
  const images: ProductImage[] =
    data.images && data.images.length > 0
      ? data.images
      : data.primaryImageUrl
        ? [{ url: data.primaryImageUrl, isPrimary: true, sortOrder: 0 }]
        : [];

  return (
    <div>
      <Link
        href={`/${locale}/marketplace`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-[hsl(var(--primary))] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToMarketplace')}
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-6">
              <StorefrontProductGallery images={images} title={data.title} locale={locale} />
            </div>

            <div className="mb-6 flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold">{data.title}</h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{data.sku}</p>
              </div>
              {data.category ? (
                <Badge variant="secondary" className="text-xs">
                  {data.category}
                </Badge>
              ) : null}
            </div>

            {data.description ? (
              <p className="mb-6 whitespace-pre-line text-sm leading-6 text-[hsl(var(--foreground))]">
                {data.description}
              </p>
            ) : null}

            {specs.length > 0 ? (
              <div>
                <h2 className="mb-3 text-sm font-semibold">{t('specifications')}</h2>
                <dl className="divide-y divide-[hsl(var(--border))] rounded-[var(--radius)] border border-[hsl(var(--border))]">
                  {specs.map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <dt className="text-xs text-[hsl(var(--muted-foreground))]">{key}</dt>
                      <dd className="text-sm font-medium">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <span>{data.vendorName || t('vendor')}</span>
            </div>

            <p className="mb-1 text-xs text-[hsl(var(--muted-foreground))]">{t('price')}</p>
            <p className="mb-4 text-2xl font-bold text-[hsl(var(--primary))]">
              {Number(data.price).toLocaleString(numberLocale)}{' '}
              <span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">
                {data.currency}
              </span>
            </p>

            <div className="space-y-2">
              <Button className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4" />
                {t('addToCart')}
              </Button>
              {count > 0 ? (
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/${locale}/marketplace/cart`}>
                    {t('viewCart')} ({count})
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
