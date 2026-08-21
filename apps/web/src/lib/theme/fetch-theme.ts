import 'server-only';

/**
 * Fetches the current theme CSS from the API at request time.
 * Falls back to an empty string (so the defaults from globals.css win)
 * if the API is not reachable (e.g. during build).
 */
export async function fetchThemeCss(): Promise<string> {
  const base =
    process.env.INTERNAL_API_URL ??
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3000';
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/theme/css`, {
      signal: controller.signal,
      next: { revalidate: 30, tags: ['theme'] },
    });
    clearTimeout(t);
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  }
}
