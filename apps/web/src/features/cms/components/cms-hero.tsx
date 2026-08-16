'use client';

import { useEffect, useState } from 'react';
import type { CmsContent } from '../lib/types';
import { cmsApi } from '../lib/api';
import { DEFAULT_CONTENT } from '../lib/default-content';

/**
 * هوک سمت کلاینت برای دریافت محتوای CMS.
 * در صورت نبود محتوا در سرور، از نسخه‌ی پیش‌فرض استفاده می‌کند.
 */
export function useCmsContent(slot: string, locale = 'fa') {
  const [data, setData] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    cmsApi
      .getPublished(slot, locale)
      .then((c) => {
        if (active) setData(c);
      })
      .catch(() => {
        /* ignore */
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slot, locale]);

  const fallback = DEFAULT_CONTENT[slot];
  const document = data?.document ?? fallback;
  return { data, document, loading, hasOverride: !!data };
}
