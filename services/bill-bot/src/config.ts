/** پیکربندی ربات — همه مقادیر از env خوانده می‌شوند (نگاه کنید به .env.example). */

export interface AppConfig {
  telegramToken: string;
  baleToken: string;
  adminChatIds: string[];
  visionServiceUrl: string;
  llm: { baseUrl: string; apiKey: string; model: string; timeoutMs: number } | null;
  tariffYear: number;
  supplyCostOverrideRials: number | null;
  report: { fontPath: string; brandName: string; fontName: string };
  dataDir: string;
  storeEncKey: string;
  pollingTimeoutSec: number;
  maxConcurrentOcr: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  /**
   * حالت اجرای ربات:
   * - 'mvp'  (پیش‌فرض): فقط دریافت قبض ← استخراج ← نمایش جدول. بدون ذخیره‌سازی،
   *   بدون تحلیل تعرفه، PDF و مشاوره. برای تست و بررسی کارفرما.
   * - 'full': چرخه کامل طبق مستندات (تحلیل ۱۴۰۵ + گزارش PDF + مشاوره + store).
   */
  mode: 'mvp' | 'full';
}

function env(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export function loadConfig(): AppConfig {
  const llmBase = env('LLM_BASE_URL');
  const llmKey = env('LLM_API_KEY');
  return {
    telegramToken: env('TELEGRAM_BOT_TOKEN'),
    baleToken: env('BALE_BOT_TOKEN'),
    adminChatIds: env('ADMIN_CHAT_IDS')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => /^\d+$/.test(s)),
    visionServiceUrl: env('VISION_SERVICE_URL', 'http://localhost:8003'),
    llm:
      llmBase && llmKey
        ? {
            baseUrl: llmBase.replace(/\/$/, ''),
            apiKey: llmKey,
            model: env('LLM_MODEL', 'gpt-4o-mini'),
            timeoutMs: Number(env('LLM_TIMEOUT_MS', '20000')),
          }
        : null,
    tariffYear: Number(env('TARIFF_YEAR', '1405')),
    supplyCostOverrideRials: env('SUPPLY_COST_OVERRIDE_RIALS')
      ? Number(env('SUPPLY_COST_OVERRIDE_RIALS'))
      : null,
    report: {
      fontPath: env('REPORT_FONT_PATH'),
      brandName: env('REPORT_BRAND_NAME', 'تحلیل قبض برق'),
      fontName: env('REPORT_FONT_NAME', 'Vazirmatn'),
    },
    dataDir: env('DATA_DIR', './data'),
    storeEncKey: env('STORE_ENC_KEY'),
    pollingTimeoutSec: Number(env('POLLING_TIMEOUT_SEC', '30')),
    maxConcurrentOcr: Number(env('MAX_CONCURRENT_OCR', '3')),
    logLevel: (env('LOG_LEVEL', 'info') as AppConfig['logLevel']) || 'info',
    mode: env('BILL_BOT_MODE', 'mvp') === 'full' ? 'full' : 'mvp',
  };
}

let cached: AppConfig | null = null;
export function getConfig(): AppConfig {
  if (!cached) cached = loadConfig();
  return cached;
}
