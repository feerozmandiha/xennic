/** تعریف دو سکوی پشتیبانی‌شده و ماتریس قابلیت‌ها (سند ۰۳ بخش ۳). */

export interface PlatformCapabilities {
  parseModeHtml: boolean;
  requestContact: boolean;
  webhooks: boolean;
}

export interface PlatformInfo {
  id: 'telegram' | 'bale';
  name: string;
  apiBaseUrl: string;
  token: string;
  capabilities: PlatformCapabilities;
}

export function telegramPlatform(token: string): PlatformInfo {
  return {
    id: 'telegram',
    name: 'تلگرام',
    apiBaseUrl: 'https://api.telegram.org',
    token,
    capabilities: { parseModeHtml: true, requestContact: true, webhooks: true },
  };
}

export function balePlatform(token: string): PlatformInfo {
  return {
    id: 'bale',
    name: 'بله',
    // مستندات بازوی بله: https://docs.bale.ai
    apiBaseUrl: 'https://tapi.bale.ai',
    token,
    capabilities: { parseModeHtml: false, requestContact: true, webhooks: true },
  };
}
