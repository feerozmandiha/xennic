/** تعریف کیبوردها و callback data (سند ۰۲ و ۰۷). */

import type { ReplyMarkup } from '../platform/bot-api.ts';
import type { ReportModel } from '../bill/types.ts';
import { needsReview } from '../bill/extract.ts';

export const CB = {
  analyze: 'act:analyze',
  pdf: 'act:pdf',
  consult: 'act:consult',
  consultPv: 'act:consult:pv',
  consultCall: 'act:consult:call',
  newBill: 'act:new',
  back: 'act:back',
  fix: 'act:fix',
  cancel: 'act:cancel',
  zone: (z: string) => `act:zone:${z}`,
  win: (w: string) => `act:win:${w}`,
  adminClose: (id: string) => `adm:close:${id}`,
  adminContacted: (id: string) => `adm:contacted:${id}`,
} as const;

export function analysisKeyboard(report: ReportModel): ReplyMarkup {
  const rows = [
    [
      { text: '🖨 چاپ گزارش PDF', callback_data: CB.pdf },
      { text: '🎧 درخواست مشاوره', callback_data: CB.consult },
    ],
    [{ text: '🔄 قبض جدید', callback_data: CB.newBill }],
  ];
  const bill = report.bill;
  const reviewFields = ['consumptionKwh', 'periodDays', 'region', 'energyChargeRials'].filter(
    (k) => needsReview(bill, k),
  );
  if (reviewFields.length > 0) {
    rows.splice(1, 0, [{ text: '✏️ اصلاح اطلاعات', callback_data: CB.fix }]);
  }
  return { inline_keyboard: rows };
}

export function zoneKeyboard(): ReplyMarkup {
  return {
    inline_keyboard: [
      [
        { text: 'منطقه عادی', callback_data: CB.zone('normal') },
        { text: 'گرمسیر ۱', callback_data: CB.zone('tropical1') },
      ],
      [
        { text: 'گرمسیر ۲', callback_data: CB.zone('tropical2') },
        { text: 'گرمسیر ۳', callback_data: CB.zone('tropical3') },
      ],
      [
        { text: 'گرمسیر ۴', callback_data: CB.zone('tropical4') },
        { text: '🔄 قبض جدید', callback_data: CB.newBill },
      ],
    ],
  };
}

export function consultTypeKeyboard(): ReplyMarkup {
  return {
    inline_keyboard: [
      [
        { text: '💬 پیام خصوصی', callback_data: CB.consultPv },
        { text: '📞 تماس تلفنی', callback_data: CB.consultCall },
      ],
      [{ text: '↩️ بازگشت', callback_data: CB.back }],
    ],
  };
}

export function phoneKeyboard(requestContact: boolean): ReplyMarkup {
  return {
    keyboard: requestContact ? [[{ text: '📱 ارسال شماره من', request_contact: true }]] : [],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

export function windowKeyboard(): ReplyMarkup {
  return {
    inline_keyboard: [
      [
        { text: '🌅 صبح ۹–۱۲', callback_data: CB.win('morning') },
        { text: '☀️ ظهر ۱۲–۱۵', callback_data: CB.win('noon') },
        { text: '🌇 عصر ۱۵–۱۸', callback_data: CB.win('evening') },
      ],
      [{ text: '↩️ بازگشت', callback_data: CB.back }],
    ],
  };
}

export const WINDOW_LABEL: Record<string, string> = {
  morning: 'صبح (۹ تا ۱۲)',
  noon: 'ظهر (۱۲ تا ۱۵)',
  evening: 'عصر (۱۵ تا ۱۸)',
};

export function adminRequestKeyboard(id: string): ReplyMarkup {
  return {
    inline_keyboard: [
      [
        { text: `📞 تماس گرفتم #${id}`, callback_data: CB.adminContacted(id) },
        { text: `✔️ بستن #${id}`, callback_data: CB.adminClose(id) },
      ],
    ],
  };
}
