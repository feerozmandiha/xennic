/**
 * کلاینت عمومی Bot API با fetch — برای تلگرام و بله (سند ۰۳ بخش ۳).
 * API بله با تلگرام سازگار است و فقط baseUrl فرق می‌کند:
 *   تلگرام: https://api.telegram.org/bot<token>/<method>
 *   بله:    https://tapi.bale.ai/bot<token>/<method>   [docs.bale.ai]
 */

import type { PlatformInfo } from './platforms.ts';

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
  request_contact?: boolean;
}

export interface ReplyMarkup {
  inline_keyboard?: InlineKeyboardButton[][];
  keyboard?: { text: string; request_contact?: boolean }[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  remove_keyboard?: boolean;
}

export interface SendOptions {
  replyMarkup?: ReplyMarkup;
  parseMode?: 'HTML' | 'Markdown';
  replyToMessageId?: number;
}

export interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  callback_query?: {
    id: string;
    data?: string;
    message?: TgMessage;
    from: { id: number; first_name?: string; username?: string };
  };
}

export interface TgMessage {
  message_id: number;
  chat: { id: number; first_name?: string; username?: string; title?: string };
  from?: { id: number; first_name?: string; username?: string };
  text?: string;
  caption?: string;
  document?: { file_id: string; file_name?: string; mime_type?: string; file_size?: number };
  photo?: { file_id: string; file_size?: number }[];
  contact?: { phone_number: string; user_id?: number };
}

interface ApiResult<T> {
  ok: boolean;
  result?: T;
  description?: string;
  parameters?: { retry_after?: number };
}

export class BotApiError extends Error {
  retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message);
    this.retryAfter = retryAfter;
  }
}

export class BotApi {
  readonly platform: PlatformInfo;

  constructor(platform: PlatformInfo) {
    this.platform = platform;
  }

  private get base(): string {
    return `${this.platform.apiBaseUrl}/bot${this.platform.token}`;
  }

  async call<T>(method: string, payload: Record<string, unknown> = {}): Promise<T> {
    const res = await fetch(`${this.base}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(65_000),
    });
    const json = (await res.json()) as ApiResult<T>;
    if (!json.ok || json.result === undefined) {
      throw new BotApiError(
        `[${this.platform.id}] ${method}: ${json.description ?? res.statusText}`,
        json.parameters?.retry_after,
      );
    }
    return json.result;
  }

  getMe(): Promise<{ id: number; username?: string }> {
    return this.call('getMe');
  }

  getUpdates(offset: number, timeoutSec: number): Promise<TgUpdate[]> {
    return this.call<TgUpdate[]>('getUpdates', {
      offset,
      timeout: timeoutSec,
      allowed_updates: ['message', 'callback_query'],
    });
  }

  async sendMessage(
    chatId: number | string,
    text: string,
    opts: SendOptions = {},
  ): Promise<TgMessage> {
    const payload: Record<string, unknown> = { chat_id: chatId, text };
    if (opts.parseMode && this.platform.capabilities.parseModeHtml) {
      payload['parse_mode'] = opts.parseMode;
    }
    if (opts.replyMarkup) payload['reply_markup'] = opts.replyMarkup;
    if (opts.replyToMessageId) payload['reply_to_message_id'] = opts.replyToMessageId;
    return this.call<TgMessage>('sendMessage', payload);
  }

  /** ارسال فایل (multipart) — PDF گزارش یا فایل قبض. */
  async sendDocument(
    chatId: number | string,
    bytes: Uint8Array,
    filename: string,
    caption?: string,
  ): Promise<TgMessage> {
    const form = new FormData();
    const blobBytes = new Uint8Array(bytes.byteLength);
    blobBytes.set(bytes);
    form.append('chat_id', String(chatId));
    form.append('document', new Blob([blobBytes]), filename);
    if (caption) form.append('caption', caption);
    const res = await fetch(`${this.base}/sendDocument`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(65_000),
    });
    const json = (await res.json()) as ApiResult<TgMessage>;
    if (!json.ok || !json.result) {
      throw new BotApiError(
        `[${this.platform.id}] sendDocument: ${json.description ?? res.statusText}`,
      );
    }
    return json.result;
  }

  answerCallbackQuery(id: string, text?: string): Promise<boolean> {
    return this.call<boolean>('answerCallbackQuery', {
      callback_query_id: id,
      ...(text ? { text } : {}),
    }).catch(() => false);
  }

  async getFileUrl(fileId: string): Promise<string> {
    const info = await this.call<{ file_path?: string }>('getFile', {
      file_id: fileId,
    });
    if (!info.file_path) throw new BotApiError('file_path missing');
    return `${this.base}/file/${info.file_path}`;
  }

  async downloadFile(fileId: string): Promise<Uint8Array> {
    const url = await this.getFileUrl(fileId);
    const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
    if (!res.ok) throw new BotApiError(`download failed: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }
}
