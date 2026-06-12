import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // اگر کاربر به ریشه آمد، به /fa redirect کن
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/fa';
    return Response.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
