/**
 * ماشین حالت مکالمه ربات (سند ۰۲ و ۰۷).
 * جریان: دریافت فایل ← OCR/استخراج ← جدول ← تحلیل ← PDF/مشاوره
 */

import type { AppConfig } from '../config.ts';
import { faNumber, maskId, normalizeFa, toNumber } from '../bill/normalize.ts';
import type { BillData, ReportModel, ZoneId } from '../bill/types.ts';
import { extractBillFields, needsReview, overallConfidence } from '../bill/extract.ts';
import { readBillViaVision, mergeBills } from '../vision-client.ts';
import { analyzeBill } from '../analysis/analyzer.ts';
import { llmNarrative } from '../analysis/llm.ts';
import { generateReportFile } from '../report/pdf.ts';
import { formatJalali, jalaliDaysBetween, parseJalali } from '../jalali.ts';
import type { BotApi, TgMessage, TgUpdate } from '../platform/bot-api.ts';
import { BotApiError } from '../platform/bot-api.ts';
import type { PlatformInfo } from '../platform/platforms.ts';
import type { ConsultationStore } from '../store/store.ts';
import {
  CB,
  WINDOW_LABEL,
  adminRequestKeyboard,
  analysisKeyboard,
  consultTypeKeyboard,
  phoneKeyboard,
  windowKeyboard,
  zoneKeyboard,
} from './keyboards.ts';
import { log } from '../logger.ts';

type FlowState =
  | { name: 'idle' }
  | { name: 'awaiting_fix' }
  | { name: 'awaiting_manual' }
  | { name: 'consult_message' }
  | { name: 'consult_name'; channel: 'pv' | 'call'; message?: string }
  | { name: 'consult_phone'; message?: string; name?: string }
  | {
      name: 'consult_window';
      message?: string;
      name?: string;
      phone?: string;
    };

interface Session {
  state: FlowState;
  bill?: BillData;
  report?: ReportModel;
  lastConsultAt?: number;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXT = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
const FIELD_LABELS: Record<string, string> = {
  consumptionKwh: 'مصرف (کیلووات‌ساعت)',
  periodDays: 'تعداد روز دوره',
  energyChargeRials: 'بهای انرژی (ریال)',
  totalRials: 'مبلغ کل (ریال)',
  note14Rials: 'تبصره ۱۴ (ریال)',
  vatRials: 'ارزش افزوده (ریال)',
  leviesRials: 'عوارض (ریال)',
  prevReading: 'شاخص قبلی',
  curReading: 'شاخص فعلی',
};

function todayJalaliStr(): string {
  const now = new Date();
  // تبدیل سریع میلادی→جلالی برای نام‌گذاری گزارش (الگوریتم استاندارد)
  let gy = now.getUTCFullYear();
  const gm = now.getUTCMonth() + 1;
  const gd = now.getUTCDate();
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    gdm[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  gy = jy; // silence unused
  void gy;
  return formatJalali([jy, jm, jd]);
}

export class Flow {
  private sessions = new Map<string, Session>();
  private rateFiles = new Map<string, number[]>();
  private activeOcr = 0;
  private cfg: AppConfig;
  private store: ConsultationStore;

  constructor(cfg: AppConfig, store: ConsultationStore) {
    this.cfg = cfg;
    this.store = store;
  }

  private sessionKey(platform: string, chatId: number | string): string {
    return `${platform}:${chatId}`;
  }

  private session(platform: string, chatId: number | string): Session {
    const key = this.sessionKey(platform, chatId);
    let s = this.sessions.get(key);
    if (!s) {
      s = { state: { name: 'idle' } };
      this.sessions.set(key, s);
    }
    return s;
  }

  private isAdmin(chatId: number | string): boolean {
    return this.cfg.adminChatIds.includes(String(chatId));
  }

  // ── ورودی اصلی ────────────────────────────────────────────────
  async handle(platform: PlatformInfo, api: BotApi, update: TgUpdate): Promise<void> {
    try {
      if (update.callback_query) {
        await this.handleCallback(platform, api, update);
        return;
      }
      if (update.message) {
        await this.handleMessage(platform, api, update.message);
      }
    } catch (err) {
      log.error('handle_update_failed', {
        platform: platform.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // ── پیام‌ها ────────────────────────────────────────────────────
  private async handleMessage(platform: PlatformInfo, api: BotApi, msg: TgMessage): Promise<void> {
    const chatId = msg.chat.id;
    const text = (msg.text ?? msg.caption ?? '').trim();
    const s = this.session(platform.id, chatId);

    if (text.startsWith('/')) {
      await this.handleCommand(platform, api, msg, text);
      return;
    }

    switch (s.state.name) {
      case 'awaiting_fix':
        await this.applyFix(platform, api, chatId, s, text);
        return;
      case 'awaiting_manual':
        await this.finalizeManual(platform, api, chatId, s, text);
        return;
      case 'consult_message':
        s.state = { name: 'consult_name', channel: 'pv', message: text };
        await api.sendMessage(chatId, 'نام شما؟ (برای لغو: /cancel)');
        return;
      case 'consult_name': {
        const st = s.state;
        if (st.channel === 'pv') {
          await this.finalizeConsultation(platform, api, chatId, s, {
            channel: 'pv',
            message: st.message,
            name: text,
          });
        } else {
          s.state = { name: 'consult_phone', message: st.message, name: text };
          await api.sendMessage(chatId, 'شماره تماس را بفرستید (مثال: ۰۹۱۲۳۴۵۶۷۸۹):', {
            replyMarkup: phoneKeyboard(platform.capabilities.requestContact),
          });
        }
        return;
      }
      case 'consult_phone': {
        const phone = normalizePhone(msg.contact?.phone_number ?? text);
        if (!phone) {
          await api.sendMessage(
            chatId,
            '⚠️ شماره معتبر نیست. لطفاً شماره موبایل را به شکل ۰۹۱۲۳۴۵۶۷۸۹ بفرستید.',
          );
          return;
        }
        const st = s.state;
        s.state = {
          name: 'consult_window',
          message: st.message,
          name: st.name,
          phone,
        };
        await api.sendMessage(chatId, 'بازه زمانی ترجیحی تماس؟', {
          replyMarkup: windowKeyboard(),
        });
        return;
      }
      case 'consult_window':
        await api.sendMessage(chatId, 'بازه زمانی را از دکمه‌های زیر انتخاب کنید.', {
          replyMarkup: windowKeyboard(),
        });
        return;
      default:
        break;
    }

    // فایل‌ها
    if (msg.document || msg.photo) {
      await this.processBill(platform, api, msg);
      return;
    }
    await api.sendMessage(
      chatId,
      'قبض برق خود را به‌صورت «عکس» یا «PDF» بفرستید تا استخراج و تحلیلش کنم. 📄\nراهنما: /help',
    );
  }

  private async handleCommand(
    platform: PlatformInfo,
    api: BotApi,
    msg: TgMessage,
    text: string,
  ): Promise<void> {
    const chatId = msg.chat.id;
    const cmd = text.split(' ')[0].split('@')[0];
    const s = this.session(platform.id, chatId);

    switch (cmd) {
      case '/start':
        s.state = { name: 'idle' };
        await api.sendMessage(
          chatId,
          `سلام 👋 من ربات تحلیل قبض برق‌ام.\n\nقبض برقت رو به‌صورت «عکس» یا «PDF» بفرست تا:\n۱) اطلاعاتش رو دقیق استخراج کنم و در جدول نشان دهم\n۲) بر اساس تعرفه ${faNumber(this.cfg.tariffYear)} توانیر تحلیلش کنم\n۳) گزارش ${'PDF'} و مسیر مشاوره بدهم`,
        );
        return;
      case '/help':
        await api.sendMessage(
          chatId,
          'دستورها:\n/bill — شروع (همان فرستادن فایل کافی است)\n/status — وضعیت درخواست مشاوره\n/cancel — لغو مرحله جاری\n/delete — پاک کردن داده‌های شما\n\nعکس واضح و بدون زاویه، دقت استخراج را بالا می‌برد.',
        );
        return;
      case '/bill':
        s.state = { name: 'idle' };
        await api.sendMessage(chatId, '📄 منتظر فایل قبض (عکس یا PDF) هستم.');
        return;
      case '/cancel':
        s.state = { name: 'idle' };
        await api.sendMessage(chatId, 'لغو شد. برای شروع دوباره فایل قبض را بفرستید.');
        return;
      case '/status': {
        const list = this.store.byUser(platform.id, String(chatId)).slice(-3).reverse();
        if (list.length === 0) {
          await api.sendMessage(chatId, 'درخواست مشاوره‌ای از شما ثبت نشده است.');
          return;
        }
        const body = list
          .map(
            (c) =>
              `#${c.id} — ${c.channel === 'pv' ? 'پیام خصوصی' : 'تماس تلفنی'} — وضعیت: ${c.status === 'open' ? 'در انتظار' : c.status === 'contacted' ? 'تماس برقرار شد' : 'بسته شده'}`,
          )
          .join('\n');
        await api.sendMessage(chatId, `آخرین درخواست‌ها:\n${body}`);
        return;
      }
      case '/delete':
        this.sessions.delete(this.sessionKey(platform.id, chatId));
        await api.sendMessage(chatId, 'داده‌های نشست شما پاک شد. ✅');
        return;
      case '/privacy':
        await api.sendMessage(
          chatId,
          'سیاست حریم خصوصی: فایل خام قبض فقط برای پردازش استفاده و حداکثر ۲۴ ساعت نگهداری می‌شود؛ سپس حذف می‌گردد. داده‌های شخصی نزد ما فروخته یا به اشتراک گذاشته نمی‌شود. برای حذف کامل: /delete',
        );
        return;
      case '/requests': {
        if (!this.isAdmin(chatId)) {
          await api.sendMessage(chatId, '⛔ این دستور فقط برای ادمین است.');
          return;
        }
        const open = this.store.openList().slice(0, 5);
        if (open.length === 0) {
          await api.sendMessage(chatId, 'درخواست بازی وجود ندارد. ✅');
          return;
        }
        for (const c of open) {
          await api.sendMessage(
            chatId,
            `#${c.id} [${c.platform}] ${c.channel === 'pv' ? '💬 پیام' : '📞 تماس'}\nنام: ${c.userName ?? '—'}\n${c.phone ? 'تلفن: ' + c.phone + '\n' : ''}${c.preferredWindow ? 'بازه: ' + WINDOW_LABEL[c.preferredWindow] + '\n' : ''}${c.message ? 'متن: ' + c.message.slice(0, 200) + '\n' : ''}پرونده: ${c.billSummary.topIssue ?? '—'} (${c.billSummary.consumptionKwh ?? '؟'} kWh)`,
            { replyMarkup: adminRequestKeyboard(c.id) },
          );
        }
        return;
      }
      default:
        await api.sendMessage(chatId, 'دستور ناشناخته. راهنما: /help');
    }
  }

  // ── پردازش قبض ────────────────────────────────────────────────
  private async processBill(platform: PlatformInfo, api: BotApi, msg: TgMessage): Promise<void> {
    const chatId = msg.chat.id;
    const s = this.session(platform.id, chatId);

    // محدودسازی نرخ فایل
    const now = Date.now();
    const hits = (this.rateFiles.get(String(chatId)) ?? []).filter((t) => now - t < 3600_000);
    if (hits.length >= 5) {
      await api.sendMessage(
        chatId,
        '⏳ تعداد فایل‌های ارسالی در یک ساعت بیش از حد مجاز است. لطفاً بعداً تلاش کنید.',
      );
      return;
    }
    hits.push(now);
    this.rateFiles.set(String(chatId), hits);

    const doc = msg.document;
    const photo = msg.photo?.[msg.photo.length - 1];
    const fileId = doc?.file_id ?? photo?.file_id;
    const fileName = doc?.file_name ?? 'bill.jpg';
    const size = doc?.file_size ?? photo?.file_size ?? 0;
    const ext = (fileName.split('.').pop() ?? (photo ? 'jpg' : '')).toLowerCase();

    if (!fileId || size > MAX_FILE_BYTES) {
      await api.sendMessage(chatId, '⚠️ فایل بیش از ۱۰ مگابایت است؛ لطفاً نسخه سبک‌تر بفرستید.');
      return;
    }
    if (!ALLOWED_EXT.includes(ext)) {
      await api.sendMessage(chatId, '⚠️ فقط فایل‌های PDF، JPG، PNG یا WEBP پشتیبانی می‌شوند.');
      return;
    }

    const waitMsg = await api.sendMessage(
      chatId,
      '⏳ در حال خواندن قبض… (معمولاً کمتر از ۳۰ ثانیه)',
    );
    s.state = { name: 'idle' };

    let bytes: Uint8Array;
    try {
      bytes = await api.downloadFile(fileId);
    } catch (err) {
      log.warn('download_failed', { platform: platform.id, error: String(err) });
      await api.sendMessage(chatId, '❌ دانلود فایل از سرور پیام‌رسان ناموفق بود؛ دوباره بفرستید.');
      return;
    }

    // صف‌بندی ساده OCR
    while (this.activeOcr >= this.cfg.maxConcurrentOcr) {
      await new Promise((r) => setTimeout(r, 500));
    }
    this.activeOcr += 1;
    let visionBill: BillData | null = null;
    let visionWarn: string[] = [];
    try {
      const v = await readBillViaVision(this.cfg.visionServiceUrl, bytes, fileName);
      if (v) {
        visionBill = v.bill;
        visionWarn = v.warnings;
      }
    } finally {
      this.activeOcr -= 1;
    }

    // استخراج محلی از متن OCR (در صورت وجود) یا fallback دستی
    let bill: BillData;
    if (visionBill && visionBill.rawText) {
      bill = mergeBills(visionBill, extractBillFields(visionBill.rawText));
    } else if (visionBill && Object.keys(visionBill).length > 1) {
      bill = visionBill;
    } else {
      // OCR در دسترس نیست یا شکست خورد → مسیر ورود دستی
      log.info('ocr_fallback_manual', { platform: platform.id });
      await api.sendMessage(
        chatId,
        [
          '😕 متأسفانه نتوانستم قبض را به‌صورت خودکار بخوانم.',
          '',
          'برای ادامه، اطلاعات کلیدی را در یک پیام بفرستید (هر کدام در یک خط):',
          'مصرف: ۲۶۵',
          'روز: ۶۱',
          'بهای انرژی: ۴۱۲۰۰۰۰',
          'مبلغ کل: ۶۴۱۵۲۰۰',
          '',
          'یا عکس واضح‌تری (نور کافی، بدون زاویه) بفرستید.',
          ...visionWarn.map((w) => `⚠️ ${w}`),
        ].join('\n'),
      );
      s.state = { name: 'awaiting_manual' };
      return;
    }

    if (visionWarn.length) {
      bill.confidence = bill.confidence ?? {};
    }
    s.bill = bill;
    await this.presentTableAndAnalysis(platform, api, chatId, s, visionWarn);
    void waitMsg;
  }

  private async finalizeManual(
    platform: PlatformInfo,
    api: BotApi,
    chatId: number,
    s: Session,
    text: string,
  ): Promise<void> {
    const bill = extractBillFields(text);
    if (bill.consumptionKwh === undefined) {
      await api.sendMessage(
        chatId,
        '⚠️ «مصرف» (کیلووات‌ساعت) پیدا نشد. دوباره با فرمول «مصرف: ۲۶۵» بفرستید.',
      );
      return;
    }
    s.bill = bill;
    s.state = { name: 'idle' };
    await this.presentTableAndAnalysis(platform, api, chatId, s, []);
  }

  // ── جدول + تحلیل ──────────────────────────────────────────────
  private async presentTableAndAnalysis(
    platform: PlatformInfo,
    api: BotApi,
    chatId: number,
    s: Session,
    extraWarnings: string[],
  ): Promise<void> {
    const bill = s.bill!;
    const confPct = Math.round(overallConfidence(bill) * 100);

    await api.sendMessage(chatId, formatBillTable(bill, confPct));

    // اگر منطقه نامشخص است، اول انتخاب منطقه
    if (needsReview(bill, 'region') && bill.confidence?.['region'] !== undefined) {
      await api.sendMessage(chatId, 'برای تحلیل دقیق، منطقه آب‌وهوایی قبض را انتخاب کنید:', {
        replyMarkup: zoneKeyboard(),
      });
      return;
    }

    await this.runAnalysis(platform, api, chatId, s, extraWarnings);
  }

  private async runAnalysis(
    platform: PlatformInfo,
    api: BotApi,
    chatId: number,
    s: Session,
    extraWarnings: string[],
  ): Promise<void> {
    const bill = s.bill;
    if (!bill || bill.consumptionKwh === undefined) {
      await api.sendMessage(chatId, '⚠️ داده کافی برای تحلیل موجود نیست. قبض جدیدی بفرستید.');
      return;
    }
    let report: ReportModel;
    try {
      report = analyzeBill(bill, {
        tariffYear: this.cfg.tariffYear,
        supplyCostOverrideRials: this.cfg.supplyCostOverrideRials,
      });
    } catch (err) {
      await api.sendMessage(
        chatId,
        `⚠️ تحلیل ناموفق بود: ${err instanceof Error ? err.message : 'خطای نامشخص'}`,
      );
      return;
    }
    for (const w of extraWarnings) report.warnings.push(w);

    // لایه LLM اختیاری
    if (this.cfg.llm) {
      report.llmNarrative = await llmNarrative(report, this.cfg.llm);
    }
    s.report = report;

    await api.sendMessage(chatId, formatAnalysis(report), {
      replyMarkup: analysisKeyboard(report),
    });
  }

  // ── اصلاح فیلد ────────────────────────────────────────────────
  private async applyFix(
    platform: PlatformInfo,
    api: BotApi,
    chatId: number,
    s: Session,
    text: string,
  ): Promise<void> {
    const m = normalizeFa(text).match(/^(.+?)[:：]\s*(.+)$/);
    if (!m) {
      await api.sendMessage(chatId, 'فرمت اصلاح: «عنوان: مقدار» — مثال: مصرف: ۲۶۵');
      return;
    }
    const label = m[1].trim();
    const value = toNumber(m[2]);
    const entry = Object.entries(FIELD_LABELS).find(
      ([, fa]) => fa.includes(label) || label.includes(fa.split(' ')[0]),
    );
    if (!entry || value === null) {
      await api.sendMessage(
        chatId,
        `فیلدهای قابل اصلاح:\n${Object.values(FIELD_LABELS)
          .map((v) => '• ' + v)
          .join('\n')}\nفرمت: «مصرف: ۲۶۵»`,
      );
      return;
    }
    const key = entry[0] as keyof BillData;
    (s.bill as Record<string, unknown>)[key] = value;
    if (s.bill!.confidence) s.bill!.confidence[key as string] = 0.95;
    s.state = { name: 'idle' };
    await api.sendMessage(chatId, `✅ «${entry[1]}» به ${faNumber(value)} تغییر کرد.`);
    await this.runAnalysis(platform, api, chatId, s, []);
  }

  // ── callbackها ────────────────────────────────────────────────
  private async handleCallback(
    platform: PlatformInfo,
    api: BotApi,
    update: TgUpdate,
  ): Promise<void> {
    const cq = update.callback_query!;
    const data = cq.data ?? '';
    const chatId = cq.message?.chat.id ?? cq.from.id;
    const s = this.session(platform.id, chatId);
    await api.answerCallbackQuery(cq.id);

    if (data.startsWith('adm:')) {
      await this.handleAdminCallback(api, chatId, data);
      return;
    }
    if (!data.startsWith('act:')) return;

    switch (data) {
      case CB.analyze:
        await this.runAnalysis(platform, api, chatId, s, []);
        return;
      case CB.pdf:
        await this.sendPdfReport(api, chatId, s);
        return;
      case CB.consult:
        s.state = { name: 'idle' };
        await api.sendMessage(chatId, 'چه نوع مشاوره‌ای می‌خواهید؟', {
          replyMarkup: consultTypeKeyboard(),
        });
        return;
      case CB.consultPv:
        s.state = { name: 'consult_message' };
        await api.sendMessage(chatId, '💬 لطفاً سؤال یا موضوع مشاوره خود را در یک پیام بنویسید:');
        return;
      case CB.consultCall:
        s.state = { name: 'consult_name', channel: 'call' };
        await api.sendMessage(chatId, '📞 نام شما؟');
        return;
      case CB.newBill:
        s.state = { name: 'idle' };
        s.bill = undefined;
        s.report = undefined;
        await api.sendMessage(chatId, '🔄 قبض جدید را بفرستید (عکس یا PDF).');
        return;
      case CB.back:
        s.state = { name: 'idle' };
        await api.sendMessage(
          chatId,
          'باشه. اگر خواستید، دکمه «🎧 درخواست مشاوره» هنوز زیر گزارش هست.',
        );
        return;
      case CB.fix: {
        s.state = { name: 'awaiting_fix' };
        const review = ['consumptionKwh', 'periodDays', 'energyChargeRials', 'totalRials']
          .filter((k) => needsReview(s.bill!, k))
          .map((k) => FIELD_LABELS[k])
          .filter(Boolean);
        await api.sendMessage(
          chatId,
          `برای اصلاح، با فرمت «عنوان: مقدار» بفرستید. مثال:\nمصرف: ۲۶۵\nروز: ۶۱${review.length ? '\n\nموارد کم‌اطمینان: ' + review.join('، ') : ''}\n\nهمه فیلدها:\n${Object.values(
            FIELD_LABELS,
          )
            .map((v) => '• ' + v)
            .join('\n')}`,
        );
        return;
      }
      default:
        break;
    }

    if (data.startsWith('act:zone:')) {
      const z = data.slice('act:zone:'.length) as ZoneId;
      if (s.bill) {
        s.bill.region = z;
        s.bill.confidence = { ...s.bill.confidence, region: 0.95 };
        await api.sendMessage(chatId, '✅ منطقه ثبت شد. در حال تحلیل…');
        await this.runAnalysis(platform, api, chatId, s, []);
      }
      return;
    }

    if (data.startsWith('act:win:') && s.state.name === 'consult_window') {
      const win = data.slice('act:win:'.length);
      const st = s.state;
      await this.finalizeConsultation(platform, api, chatId, s, {
        channel: 'call',
        name: st.name,
        phone: st.phone,
        window: win as 'morning' | 'noon' | 'evening',
      });
    }
  }

  private async handleAdminCallback(api: BotApi, chatId: number, data: string): Promise<void> {
    if (!this.isAdmin(chatId)) {
      await api.sendMessage(chatId, '⛔ فقط ادمین.');
      return;
    }
    const [action, id] = data.split(':').slice(1);
    if (action === 'close') await this.store.setStatus(id, 'closed');
    if (action === 'contacted') await this.store.setStatus(id, 'contacted');
    await api.sendMessage(
      chatId,
      `✅ وضعیت درخواست #${id} به «${action === 'close' ? 'بسته' : 'تماس برقرار شد'}» تغییر کرد.`,
    );
  }

  // ── گزارش PDF ─────────────────────────────────────────────────
  private async sendPdfReport(api: BotApi, chatId: number, s: Session): Promise<void> {
    if (!s.report) {
      await api.sendMessage(chatId, 'ابتدا یک قبض ارسال و تحلیل کنید.');
      return;
    }
    const reportId = newId8();
    const today = todayJalaliStr();
    await api.sendMessage(chatId, '⏳ در حال آماده‌سازی گزارش…');
    const file = await generateReportFile(s.report, {
      reportId,
      brandName: this.cfg.report.brandName,
      todayJalali: today,
      fontPath: this.cfg.report.fontPath || undefined,
      fontName: this.cfg.report.fontName,
    });
    const cap =
      `📄 گزارش #${reportId} — تعرفه ${faNumber(s.report.tariffYear)}\n` +
      `وضعیت: ${s.report.patternStatus === 'under' ? 'زیر الگو ✅' : 'مازاد بر الگو ⚠️'} · مصرف ${faNumber(s.report.bill.consumptionKwh ?? 0)} کیلووات‌ساعت` +
      (file.format === 'html'
        ? '\n(گزارش HTML ارسال شد؛ در مرورگر گزینه Print → Save as PDF را بزنید)'
        : '');
    await api.sendDocument(chatId, file.bytes, file.filename, cap);
  }

  // ── مشاوره ────────────────────────────────────────────────────
  private async finalizeConsultation(
    platform: PlatformInfo,
    api: BotApi,
    chatId: number,
    s: Session,
    payload: {
      channel: 'pv' | 'call';
      name?: string;
      message?: string;
      phone?: string;
      window?: 'morning' | 'noon' | 'evening';
    },
  ): Promise<void> {
    // ضد‌اسپم
    const now = Date.now();
    if (s.lastConsultAt && now - s.lastConsultAt < 10 * 60_000) {
      await api.sendMessage(chatId, '⏳ فاصله بین دو درخواست حداقل ۱۰ دقیقه است.');
      return;
    }
    const open = this.store.byUser(platform.id, String(chatId)).filter((c) => c.status === 'open');
    if (open.length >= 3) {
      await api.sendMessage(
        chatId,
        '⚠️ سه درخواست باز دارید؛ پس از پیگیری آن‌ها درخواست جدید ثبت کنید.',
      );
      return;
    }

    const r = s.report;
    const req = await this.store.add({
      platform: platform.id,
      chatId: String(chatId),
      userName: payload.name,
      channel: payload.channel,
      phone: payload.phone,
      preferredWindow: payload.window,
      message: payload.message,
      billSummary: {
        billId: r?.bill.billId,
        tariffType: r?.bill.tariffType,
        zone: r?.zone,
        consumptionKwh: r?.bill.consumptionKwh,
        monthlyAvgKwh: r ? Math.round(r.monthlyAvgKwh) : undefined,
        relativeToPattern: r ? Number(r.relativeToPattern.toFixed(2)) : undefined,
        totalRials: r?.bill.totalRials,
        topIssue: r
          ? `${r.patternStatus === 'under' ? 'زیر الگو' : `${Math.round(r.relativeToPattern * 100)}٪ الگو`} — ${faNumber(r.computedEnergyRials)} ریال`
          : 'بدون تحلیل',
      },
    });
    s.lastConsultAt = now;
    s.state = { name: 'idle' };

    await api.sendMessage(
      chatId,
      payload.channel === 'pv'
        ? `✅ درخواست شما ثبت شد.\nکد پیگیری: #${req.id}\nکارشناس ما حداکثر تا ۲۴ ساعت آینده در همین گفتگو پاسخ می‌دهد.`
        : `✅ درخواست تماس ثبت شد.\nکد پیگیری: #${req.id}\nدر بازه ${WINDOW_LABEL[payload.window ?? 'morning']} با شما تماس می‌گیریم.`,
    );

    // اعلان ادمین‌ها
    for (const admin of this.cfg.adminChatIds) {
      try {
        await api.sendMessage(
          admin,
          [
            `🔔 درخواست مشاوره جدید #${req.id} [${platform.name}]`,
            `نوع: ${payload.channel === 'pv' ? '💬 پیام خصوصی' : '📞 تماس تلفنی'}`,
            `نام: ${payload.name ?? '—'}`,
            payload.phone ? `تلفن: ${payload.phone}` : '',
            payload.window ? `بازه: ${WINDOW_LABEL[payload.window]}` : '',
            payload.message ? `متن: ${payload.message.slice(0, 300)}` : '',
            `پرونده: ${req.billSummary.topIssue}`,
            req.billSummary.billId ? `شناسه قبض: ${maskId(req.billSummary.billId)}` : '',
          ]
            .filter(Boolean)
            .join('\n'),
          { replyMarkup: adminRequestKeyboard(req.id) },
        );
      } catch (err) {
        if (err instanceof BotApiError) {
          log.warn('admin_notify_failed', { admin, error: err.message });
        }
      }
    }
  }
}

// ── قالب‌بندی پیام‌ها ─────────────────────────────────────────────
function fmtVal(bill: BillData, key: keyof BillData, label: string, unit = ''): string {
  const v = bill[key];
  const warn = needsReview(bill, key as string) ? ' ⚠️' : '';
  if (v === undefined || v === null) return `${label}: —${warn}`;
  const text = typeof v === 'number' ? faNumber(v) : String(v);
  return `${label}: ${text}${unit ? ' ' + unit : ''}${warn}`;
}

export function formatBillTable(bill: BillData, confPct: number): string {
  const lines: string[] = [
    `✅ اطلاعات استخراج شد — اطمینان کل: ${faNumber(confPct)}٪`,
    '',
    '— اطلاعات شناسه‌ای —',
    fmtVal(bill, 'billId', 'شناسه قبض'),
    fmtVal(bill, 'paymentId', 'شناسه پرداخت'),
    fmtVal(bill, 'fileNo', 'شماره پرونده'),
    fmtVal(bill, 'customerName', 'نام مشترک'),
    fmtVal(bill, 'tariffType', 'نوع تعرفه'),
    bill.address ? fmtVal(bill, 'address', 'نشانی') : '',
    '',
    '— دوره و قرائت —',
    bill.periodFrom || bill.periodTo
      ? `دوره: ${bill.periodFrom ?? '؟'} تا ${bill.periodTo ?? '؟'}${bill.periodDays ? ` (${faNumber(bill.periodDays)} روز)` : ''}${needsReview(bill, 'periodDays') ? ' ⚠️' : ''}`
      : fmtVal(bill, 'periodDays', 'روزهای دوره'),
    bill.prevReading !== undefined || bill.curReading !== undefined
      ? `شاخص قبلی/فعلی: ${bill.prevReading !== undefined ? faNumber(bill.prevReading) : '؟'} / ${bill.curReading !== undefined ? faNumber(bill.curReading) : '؟'}`
      : '',
    fmtVal(bill, 'consumptionKwh', 'مصرف دوره', 'کیلووات‌ساعت'),
    bill.tou
      ? `کم‌باری/میان‌باری/اوج‌باری: ${faNumber(bill.tou.low ?? 0)} / ${faNumber(bill.tou.mid ?? 0)} / ${faNumber(bill.tou.peak ?? 0)} کیلووات‌ساعت`
      : '',
    bill.demandKw || bill.ampere
      ? `قدرت/آمپراژ: ${bill.demandKw ? faNumber(bill.demandKw) + ' کیلووات' : ''}${bill.ampere ? ' / ' + faNumber(bill.ampere) + ' آمپر' : ''}`
      : '',
    '',
    '— ریز مبالغ (ریال) —',
    fmtVal(bill, 'energyChargeRials', 'بهای انرژی'),
    bill.note14Rials !== undefined ? fmtVal(bill, 'note14Rials', 'تبصره ۱۴') : '',
    bill.leviesRials !== undefined ? fmtVal(bill, 'leviesRials', 'عوارض') : '',
    bill.vatRials !== undefined ? fmtVal(bill, 'vatRials', 'ارزش افزوده') : '',
    bill.insuranceRials !== undefined || bill.subscriptionRials !== undefined
      ? `بیمه/آئونمان: ${faNumber((bill.insuranceRials ?? 0) + (bill.subscriptionRials ?? 0))}`
      : '',
    fmtVal(bill, 'totalRials', 'جمع کل قابل پرداخت'),
    bill.paymentStatus
      ? `وضعیت: ${bill.paymentStatus === 'paid' ? 'پرداخت شده ✅' : 'پرداخت نشده ⏳'}`
      : '',
  ];
  return lines.filter((l) => l !== '').join('\n');
}

export function formatAnalysis(r: ReportModel): string {
  const zoneFa =
    r.zone === 'normal' ? 'منطقه عادی' : `گرمسیر ${'۱۲۳۴'[Number(r.zone.slice(-1)) - 1]}`;
  const seasonFa = r.season === 'hot' ? 'ماه‌های گرم' : 'ماه‌های غیرگرم';
  const statusFa =
    r.patternStatus === 'under'
      ? `✅ زیر الگوی مصرف (${faNumber(r.monthlyAvgKwh)} از ${faNumber(r.patternLimitKwh)} کیلووات‌ساعت ماهانه — ${faNumber(r.relativeToPattern * 100)}٪)`
      : r.patternStatus === 'tier2'
        ? `⚠️ بین الگو تا ۱٫۵ برابر (${faNumber(r.monthlyAvgKwh)} از ${faNumber(r.patternLimitKwh)} — ${faNumber(r.relativeToPattern * 100)}٪)`
        : r.patternStatus === 'tier3'
          ? `🔴 بین ۱٫۵ تا ۲٫۵ برابر الگو (${faNumber(r.relativeToPattern * 100)}٪)`
          : `🚨 بیش از ۲٫۵ برابر الگو — نرخ تنبیهی ۵ برابر هزینه تأمین!`;

  const tiers = r.tiers
    .map(
      (t) =>
        `▫️ ${faNumber(t.fromKwh)} تا ${t.toKwh === null ? '∞' : faNumber(t.toKwh)}: ${faNumber(t.kwh)} kWh × ${faNumber(t.rateRials)} = ${faNumber(t.amountRials)} ریال`,
    )
    .join('\n');

  const deviation =
    r.deviationPct === null
      ? ''
      : Math.abs(r.deviationPct) <= 5
        ? `\nبررسی صحت: محاسبه ربات (${faNumber(r.computedEnergyRials)} ریال) ≈ بهای انرژی قبض ✓ (انحراف ${faNumber(Math.abs(r.deviationPct), 1)}٪)`
        : `\n⚠️ انحراف محاسبه با قبض: ${faNumber(Math.abs(r.deviationPct), 1)}٪ — علل محتمل: تبصره‌ها/عوارض محلی یا گردکردن شرکت توزیع`;

  const recs = r.recommendations
    .map(
      (rec, i) =>
        `${faNumber(i + 1)}) ${rec.title}${rec.saveRialsPerPeriod ? ` → حدود ${faNumber(rec.saveRialsPerPeriod)} ریال صرفه‌جویی/دوره` : ''}`,
    )
    .join('\n');

  const extra: string[] = [];
  if (r.peakSurchargeRials)
    extra.push(`برآورد جریمه اوج‌بار: ${faNumber(r.peakSurchargeRials)} ریال`);
  if (r.offpeakDiscountRials) extra.push(`پاداش کم‌باری: ${faNumber(r.offpeakDiscountRials)} ریال`);

  const warns = r.warnings.length ? `\n\n⚠️ ${r.warnings.join('\n⚠️ ')}` : '';
  const narrative = r.llmNarrative ? `\n\n🤖 روایت هوشمند:\n${r.llmNarrative}` : '';

  return [
    `📊 تحلیل بر اساس تعرفه ${faNumber(r.tariffYear)} — ${zoneFa}، ${seasonFa}`,
    '',
    `وضعیت: ${statusFa}`,
    `نرخ مؤثر شما: ${faNumber(r.effectiveRateRials)} ریال بر کیلووات‌ساعت`,
    `(یارانه‌ای ≈ ${faNumber(r.supplyCostRials * 0.146)} | تنبیهی ≈ ${faNumber(r.supplyCostRials * 5)})`,
    '',
    'پله‌های محاسبه:',
    tiers,
    deviation,
    extra.length ? '\n' + extra.join('\n') : '',
    '',
    'توصیه‌ها:',
    recs,
    warns,
    narrative,
  ]
    .filter((l) => l !== '')
    .join('\n');
}

// ── کمکی‌ها ───────────────────────────────────────────────────────
function normalizePhone(raw: string): string | null {
  const digits = normalizeFa(raw).replace(/\D/g, '');
  if (/^98?9\d{9}$/.test(digits)) return '0' + digits.slice(-10);
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^9\d{9}$/.test(digits)) return '0' + digits;
  return null;
}

function newId8(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 8; i += 1) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// استفاده از importها برای جلوگیری از tree-shake تصادفی در ابزارها
void jalaliDaysBetween;
void parseJalali;
