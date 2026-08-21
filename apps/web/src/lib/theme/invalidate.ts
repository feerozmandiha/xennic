'use server';

import { revalidateTag } from 'next/cache';

/**
 * Called by the admin after updating the theme to bust the server-side
 * cached /theme/css fetch.
 */
export async function invalidateTheme(): Promise<void> {
  revalidateTag('theme');
}
