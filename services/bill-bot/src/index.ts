/**
 * نقطه ورود ربات تحلیل قبض برق — تلگرام + بله (long polling).
 * اجرا: node --experimental-strip-types src/index.ts
 */

import { loadConfig } from './config.ts';
import { BotApi } from './platform/bot-api.ts';
import { BotApiError } from './platform/bot-api.ts';
import { balePlatform, telegramPlatform } from './platform/platforms.ts';
import type { PlatformInfo } from './platform/platforms.ts';
import { Flow } from './bot/flow.ts';
import { ConsultationStore } from './store/store.ts';
import { log, setLogLevel } from './logger.ts';

let running = true;

async function startPolling(
  platform: PlatformInfo,
  flow: Flow,
  pollingTimeoutSec: number,
): Promise<void> {
  const api = new BotApi(platform);
  let offset = 0;
  let backoff = 1000;

  try {
    const me = await api.getMe();
    log.info('platform_connected', {
      platform: platform.id,
      username: me.username,
    });
  } catch (err) {
    log.error('platform_auth_failed', {
      platform: platform.id,
      error: err instanceof Error ? err.message : String(err),
    });
    return;
  }

  while (running) {
    try {
      const updates = await api.getUpdates(offset, pollingTimeoutSec);
      backoff = 1000;
      for (const u of updates) {
        offset = u.update_id + 1;
        await flow.handle(platform, api, u).catch((err) =>
          log.error('update_handler_error', {
            platform: platform.id,
            error: err instanceof Error ? err.message : String(err),
          }),
        );
      }
    } catch (err) {
      if (err instanceof BotApiError && err.retryAfter) {
        await sleep(err.retryAfter * 1000);
        continue;
      }
      log.warn('polling_error', {
        platform: platform.id,
        error: err instanceof Error ? err.message : String(err),
        backoffMs: backoff,
      });
      await sleep(backoff);
      backoff = Math.min(backoff * 2, 30_000);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  const cfg = loadConfig();
  setLogLevel(cfg.logLevel);

  const platforms: PlatformInfo[] = [];
  if (cfg.telegramToken) platforms.push(telegramPlatform(cfg.telegramToken));
  if (cfg.baleToken) platforms.push(balePlatform(cfg.baleToken));
  if (platforms.length === 0) {
    log.error('no_platform_token', {
      hint: 'TELEGRAM_BOT_TOKEN و/یا BALE_BOT_TOKEN را در env تنظیم کنید (نگاه کنید به .env.example)',
    });
    process.exit(1);
  }

  const store =
    cfg.mode === 'full'
      ? new ConsultationStore(cfg.dataDir, cfg.storeEncKey || undefined)
      : null;
  if (store) await store.init();
  const flow = new Flow(cfg, store);

  log.info('bill_bot_starting', {
    platforms: platforms.map((p) => p.id),
    mode: cfg.mode,
    tariffYear: cfg.tariffYear,
    vision: cfg.visionServiceUrl,
    llm: cfg.llm ? cfg.llm.model : 'off',
    admins: cfg.adminChatIds.length,
  });

  const stop = () => {
    running = false;
    log.info('bill_bot_stopping');
    setTimeout(() => process.exit(0), 2000).unref();
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  await Promise.all(platforms.map((p) => startPolling(p, flow, cfg.pollingTimeoutSec)));
}

main().catch((err) => {
  log.error('fatal', { error: err instanceof Error ? err.stack : String(err) });
  process.exit(1);
});
