import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales:       ['fa', 'en'],
  defaultLocale: 'fa',
  // 'always' — locale همیشه در URL است: /fa/login  /en/login
  localePrefix:  'always',
  // نگاشت locale به pathname — هیچ تغییری در path نمی‌دهد
  pathnames: {
    '/':              '/',
    '/login':         '/login',
    '/register':      '/register',
    '/dashboard':     '/dashboard',
    '/projects':      '/projects',
    '/engineering':   '/engineering',
    '/storage':       '/storage',
    '/notifications': '/notifications',
    '/settings':      '/settings',
  },
});

export type Locale = (typeof routing.locales)[number];
