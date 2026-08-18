import type { CmsBlock, CmsBlockStyle } from './types';
import { createBlock } from './types';

export interface BlockDef {
  type: CmsBlock['type'];
  label: string;
  category: 'layout' | 'content' | 'media' | 'marketing' | 'navigation';
  description?: string;
  defaultProps: Record<string, unknown>;
  defaultChildren?: CmsBlock[];
  defaultStyle?: CmsBlockStyle;
  /** prop fields shown in the editor */
  fields: BlockField[];
}

export type BlockField =
  | { key: string; label: string; kind: 'text' | 'textarea' | 'url' | 'number' | 'boolean' }
  | {
      key: string;
      label: string;
      kind: 'select';
      options: { label: string; value: string | number }[];
    }
  | { key: string; label: string; kind: 'icon' }
  | { key: string; label: string; kind: 'color' }
  | {
      key: string;
      label: string;
      kind: 'list';
      itemKind: 'text' | 'tags' | 'links' | 'features' | 'stats' | 'faq' | 'testimonials';
    }
  | { key: string; label: string; kind: 'image' }
  | { key: string; label: string; kind: 'json' };

const F = {
  text: (key: string, label: string): BlockField => ({ key, label, kind: 'text' }),
  textarea: (key: string, label: string): BlockField => ({ key, label, kind: 'textarea' }),
  url: (key: string, label: string): BlockField => ({ key, label, kind: 'url' }),
  number: (key: string, label: string): BlockField => ({ key, label, kind: 'number' }),
  boolean: (key: string, label: string): BlockField => ({ key, label, kind: 'boolean' }),
  select: (
    key: string,
    label: string,
    options: { label: string; value: string | number }[],
  ): BlockField => ({ key, label, kind: 'select', options }),
  icon: (key: string, label: string): BlockField => ({ key, label, kind: 'icon' }),
  color: (key: string, label: string): BlockField => ({ key, label, kind: 'color' }),
  list: (
    key: string,
    label: string,
    itemKind: 'text' | 'tags' | 'links' | 'features' | 'stats' | 'faq' | 'testimonials',
  ): BlockField => ({ key, label, kind: 'list', itemKind }),
  image: (key: string, label: string): BlockField => ({ key, label, kind: 'image' }),
  json: (key: string, label: string): BlockField => ({ key, label, kind: 'json' }),
};

export const BLOCK_LIBRARY: BlockDef[] = [
  // Layout
  {
    type: 'columns',
    label: 'ستون‌ها',
    category: 'layout',
    description: 'چند ستون برای چیدمان',
    defaultProps: { cols: 3, gap: 'md' },
    fields: [
      F.select('cols', 'تعداد ستون', [
        { label: '۲', value: 2 },
        { label: '۳', value: 3 },
        { label: '۴', value: 4 },
      ]),
      F.select('gap', 'فاصله', [
        { label: 'کم', value: 'sm' },
        { label: 'متوسط', value: 'md' },
        { label: 'زیاد', value: 'lg' },
      ]),
    ],
  },
  {
    type: 'column',
    label: 'ستون',
    category: 'layout',
    defaultProps: { span: 1 },
    fields: [F.number('span', 'عرض ستون')],
  },
  {
    type: 'spacer',
    label: 'فاصله',
    category: 'layout',
    defaultProps: { size: 'md' },
    fields: [
      F.select('size', 'اندازه', [
        { label: 'کم', value: 'sm' },
        { label: 'متوسط', value: 'md' },
        { label: 'زیاد', value: 'lg' },
      ]),
    ],
  },
  {
    type: 'divider',
    label: 'خط جداکننده',
    category: 'layout',
    defaultProps: {},
    fields: [],
  },

  // Content
  {
    type: 'heading',
    label: 'تیتر',
    category: 'content',
    defaultProps: { text: 'عنوان', as: 'h2', size: 'lg' },
    fields: [
      F.text('text', 'متن'),
      F.select('as', 'تگ', [
        { label: 'H1', value: 'h1' },
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' },
      ]),
    ],
  },
  {
    type: 'paragraph',
    label: 'پاراگراف',
    category: 'content',
    defaultProps: { text: 'متن پاراگراف...' },
    fields: [F.textarea('text', 'متن')],
  },
  {
    type: 'rich-text',
    label: 'متن غنی (HTML)',
    category: 'content',
    defaultProps: { html: '<p>متن</p>' },
    fields: [F.textarea('html', 'HTML')],
  },
  {
    type: 'quote',
    label: 'نقل قول',
    category: 'content',
    defaultProps: { text: 'متن نقل قول', author: 'نام' },
    fields: [F.textarea('text', 'متن'), F.text('author', 'نویسنده')],
  },
  {
    type: 'code',
    label: 'کد',
    category: 'content',
    defaultProps: { code: 'console.log("hello");' },
    fields: [F.textarea('code', 'کد')],
  },
  {
    type: 'alert',
    label: 'اعلان',
    category: 'content',
    defaultProps: { kind: 'info', text: 'متن اعلان' },
    fields: [
      F.select('kind', 'نوع', [
        { label: 'اطلاع', value: 'info' },
        { label: 'موفق', value: 'success' },
        { label: 'هشدار', value: 'warning' },
        { label: 'خطا', value: 'error' },
      ]),
      F.textarea('text', 'متن'),
    ],
  },
  {
    type: 'faq',
    label: 'سوالات متداول',
    category: 'content',
    defaultProps: { title: 'سوالات متداول' },
    fields: [F.text('title', 'عنوان')],
  },
  {
    type: 'faq-item',
    label: 'یک سوال',
    category: 'content',
    defaultProps: { question: 'سوال؟', answer: 'پاسخ' },
    fields: [F.text('question', 'سوال'), F.textarea('answer', 'پاسخ')],
  },

  // Media
  {
    type: 'image',
    label: 'تصویر',
    category: 'media',
    defaultProps: { src: '', alt: '', ratio: '16/9', caption: '' },
    fields: [
      F.image('src', 'تصویر'),
      F.text('alt', 'متن جایگزین'),
      F.text('caption', 'کپشن'),
      F.select('ratio', 'نسبت', [
        { label: '۱:۱', value: '1/1' },
        { label: '۴:۳', value: '4/3' },
        { label: '۱۶:۹', value: '16/9' },
        { label: '۲۱:۹', value: '21/9' },
      ]),
    ],
  },
  {
    type: 'video',
    label: 'ویدیو',
    category: 'media',
    defaultProps: { src: '', title: '', poster: '' },
    fields: [
      F.url('src', 'آدرس (YouTube یا MP4)'),
      F.text('title', 'عنوان'),
      F.image('poster', 'پوستر'),
    ],
  },
  {
    type: 'gallery',
    label: 'گالری',
    category: 'media',
    defaultProps: { cols: 3 },
    fields: [
      F.select('cols', 'ستون‌ها', [
        { label: '۲', value: 2 },
        { label: '۳', value: 3 },
        { label: '۴', value: 4 },
      ]),
    ],
  },
  {
    type: 'map',
    label: 'نقشه',
    category: 'media',
    defaultProps: { embed: '', address: '' },
    fields: [F.textarea('embed', 'Embed URL'), F.text('address', 'آدرس متنی')],
  },

  // Marketing
  {
    type: 'hero',
    label: 'هیرو (بخش اصلی)',
    category: 'marketing',
    defaultProps: {
      eyebrow: 'پلتفرم تخصصی',
      title: 'عنوان اصلی',
      subtitle: 'توضیحات کوتاه',
      bgImage: '',
    },
    fields: [
      F.text('eyebrow', 'تیتر کوچک'),
      F.textarea('title', 'عنوان'),
      F.textarea('subtitle', 'زیرعنوان'),
      F.image('bgImage', 'تصویر پس‌زمینه'),
    ],
  },
  {
    type: 'features',
    label: 'بخش ویژگی‌ها',
    category: 'marketing',
    defaultProps: { title: 'ویژگی‌ها', subtitle: '' },
    fields: [F.text('title', 'عنوان'), F.text('subtitle', 'زیرعنوان')],
  },
  {
    type: 'feature',
    label: 'یک ویژگی',
    category: 'marketing',
    defaultProps: {
      icon: 'zap',
      color: 'from-[hsl(var(--primary))] to-[hsl(var(--accent))]',
      title: 'عنوان ویژگی',
      desc: 'توضیح کوتاه',
      tags: ['تگ ۱', 'تگ ۲'],
    },
    fields: [
      F.icon('icon', 'آیکون'),
      F.text('title', 'عنوان'),
      F.textarea('desc', 'توضیحات'),
      F.list('tags', 'برچسب‌ها', 'tags'),
    ],
  },
  {
    type: 'pricing',
    label: 'بخش قیمت',
    category: 'marketing',
    defaultProps: { title: 'قیمت‌گذاری' },
    fields: [F.text('title', 'عنوان')],
  },
  {
    type: 'pricing-plan',
    label: 'یک پلن قیمت',
    category: 'marketing',
    defaultProps: {
      name: 'پلن',
      price: '۰',
      period: '/ ماه',
      desc: '',
      features: ['ویژگی ۱', 'ویژگی ۲'],
      highlighted: false,
      badge: '',
    },
    fields: [
      F.text('name', 'نام'),
      F.text('price', 'قیمت'),
      F.text('period', 'دوره'),
      F.textarea('desc', 'توضیحات'),
      F.list('features', 'امکانات', 'tags'),
      F.boolean('highlighted', 'پلن پیشنهادی'),
      F.text('badge', 'نشان'),
    ],
  },
  {
    type: 'cta',
    label: 'فراخوان',
    category: 'marketing',
    defaultProps: { title: 'عنوان CTA', subtitle: '' },
    fields: [F.text('title', 'عنوان'), F.text('subtitle', 'زیرعنوان')],
  },
  {
    type: 'testimonials',
    label: 'نظرات مشتریان',
    category: 'marketing',
    defaultProps: { title: 'مشتریان ما' },
    fields: [F.text('title', 'عنوان')],
  },
  {
    type: 'testimonial',
    label: 'یک نظر',
    category: 'marketing',
    defaultProps: { quote: 'متن نظر', author: 'نام', role: 'سمت', rating: 5 },
    fields: [
      F.textarea('quote', 'متن'),
      F.text('author', 'نام'),
      F.text('role', 'سمت'),
      F.number('rating', 'امتیاز'),
    ],
  },
  {
    type: 'stats',
    label: 'آمار',
    category: 'marketing',
    defaultProps: {},
    fields: [],
  },
  {
    type: 'stat',
    label: 'یک آمار',
    category: 'marketing',
    defaultProps: { value: '۱۰۰', label: 'مورد' },
    fields: [F.text('value', 'مقدار'), F.text('label', 'برچسب')],
  },
  {
    type: 'articles',
    label: 'مقالات',
    category: 'marketing',
    defaultProps: { title: 'آخرین مقالات' },
    fields: [F.text('title', 'عنوان')],
  },
  {
    type: 'article',
    label: 'یک مقاله',
    category: 'marketing',
    defaultProps: {
      image: '',
      category: '',
      title: 'عنوان مقاله',
      excerpt: 'خلاصه',
      href: '#',
    },
    fields: [
      F.image('image', 'تصویر شاخص'),
      F.text('category', 'دسته'),
      F.text('title', 'عنوان'),
      F.textarea('excerpt', 'خلاصه'),
      F.url('href', 'لینک'),
    ],
  },
  {
    type: 'logos',
    label: 'لوگوها',
    category: 'marketing',
    defaultProps: { title: '' },
    fields: [F.text('title', 'عنوان')],
  },
  {
    type: 'logo',
    label: 'یک لوگو',
    category: 'marketing',
    defaultProps: { src: '', name: '' },
    fields: [F.image('src', 'لوگو'), F.text('name', 'نام')],
  },
  {
    type: 'cards',
    label: 'کارت‌ها',
    category: 'marketing',
    defaultProps: { title: '', cols: 3 },
    fields: [
      F.text('title', 'عنوان'),
      F.select('cols', 'ستون‌ها', [
        { label: '۲', value: 2 },
        { label: '۳', value: 3 },
        { label: '۴', value: 4 },
      ]),
    ],
  },
  {
    type: 'card',
    label: 'یک کارت',
    category: 'marketing',
    defaultProps: { icon: 'zap', title: 'عنوان', text: 'متن' },
    fields: [F.icon('icon', 'آیکون'), F.text('title', 'عنوان'), F.textarea('text', 'متن')],
  },
  {
    type: 'steps',
    label: 'مراحل',
    category: 'marketing',
    defaultProps: { title: 'مراحل کار' },
    fields: [F.text('title', 'عنوان')],
  },
  {
    type: 'step',
    label: 'یک مرحله',
    category: 'marketing',
    defaultProps: { number: 1, title: 'مرحله', text: 'توضیح' },
    fields: [F.number('number', 'شماره'), F.text('title', 'عنوان'), F.textarea('text', 'توضیح')],
  },
  {
    type: 'newsletter',
    label: 'خبرنامه',
    category: 'marketing',
    defaultProps: { title: 'عضویت در خبرنامه', subtitle: '' },
    fields: [F.text('title', 'عنوان'), F.text('subtitle', 'زیرعنوان')],
  },
  {
    type: 'countdown',
    label: 'شمارش معکوس',
    category: 'marketing',
    defaultProps: { title: '', target: '2026-12-31T00:00:00' },
    fields: [F.text('title', 'عنوان'), F.text('target', 'تاریخ هدف (ISO)')],
  },
  {
    type: 'contact',
    label: 'اطلاعات تماس',
    category: 'marketing',
    defaultProps: { email: '', phone: '', address: '' },
    fields: [F.text('email', 'ایمیل'), F.text('phone', 'تلفن'), F.textarea('address', 'نشانی')],
  },

  // Buttons / navigation
  {
    type: 'auth-brand',
    label: 'پنل برند صفحات ورود',
    category: 'marketing',
    description: 'محتوای ستون چپ صفحات ورود/عضویت (تیتر، متن، تیرها و تصویر)',
    defaultProps: {
      title: 'پلتفرم تخصصی مهندسی برق',
      subtitle: 'محاسبات استاندارد، کیفیت توان و هوش مصنوعی مهندسی در یک فضای کاری یکپارچه.',
      bullets: ['۸۰+ محاسبه‌گر استاندارد IEC/IEEE', 'مشاور هوش مصنوعی', 'گزارش حرفه‌ای PDF'],
      image: '',
    },
    fields: [
      F.textarea('title', 'عنوان'),
      F.textarea('subtitle', 'زیرعنوان'),
      F.list('bullets', 'موارد', 'tags'),
      F.image('image', 'تصویر (اختیاری)'),
    ],
  },
  {
    type: 'branding',
    label: 'لوگو و برند',
    category: 'navigation',
    description: 'لوگو، نام برند و شعار هدر/فوتر',
    defaultProps: {
      name: 'Xennic',
      href: '/',
      logo: '',
      logoDark: '',
      tagline: '',
      showShape: true,
    },
    fields: [
      F.text('name', 'نام برند'),
      F.url('href', 'لینک لوگو'),
      F.image('logo', 'لوگو (روشن)'),
      F.image('logoDark', 'لوگو (تیره — برای دارک‌مود)'),
      F.text('tagline', 'شعار/زیرعنوان'),
      F.boolean('showShape', 'نمایش شکل پیش‌فرض کنار نام'),
    ],
  },
  {
    type: 'buttons',
    label: 'گروه دکمه',
    category: 'navigation',
    defaultProps: { justify: 'center' },
    fields: [
      F.select('justify', 'چیدمان', [
        { label: 'راست', value: 'start' },
        { label: 'وسط', value: 'center' },
        { label: 'چپ', value: 'end' },
      ]),
    ],
  },
  {
    type: 'button',
    label: 'دکمه',
    category: 'navigation',
    defaultProps: {
      label: 'دکمه',
      href: '#',
      variant: 'primary',
      size: 'md',
      showArrow: false,
      external: false,
    },
    fields: [
      F.text('label', 'متن'),
      F.url('href', 'لینک'),
      F.select('variant', 'نوع', [
        { label: 'اصلی', value: 'primary' },
        { label: 'حاشیه', value: 'outline' },
        { label: 'شبح', value: 'ghost' },
      ]),
      F.select('size', 'اندازه', [
        { label: 'کوچک', value: 'sm' },
        { label: 'متوسط', value: 'md' },
        { label: 'بزرگ', value: 'lg' },
      ]),
      F.boolean('showArrow', 'نمایش فلش'),
      F.boolean('external', 'لینک خارجی'),
    ],
  },
  {
    type: 'footer-column',
    label: 'ستون فوتر',
    category: 'navigation',
    defaultProps: { title: 'عنوان' },
    fields: [F.text('title', 'عنوان')],
  },
  {
    type: 'nav-links',
    label: 'منوی لینک‌ها',
    category: 'navigation',
    defaultProps: { links: [] },
    fields: [F.list('links', 'لینک‌ها', 'links')],
  },
  {
    type: 'social-links',
    label: 'شبکه‌های اجتماعی',
    category: 'navigation',
    defaultProps: {},
    fields: [],
  },
  {
    type: 'social-link',
    label: 'یک شبکه',
    category: 'navigation',
    defaultProps: { href: '#', label: '', icon: 'globe' },
    fields: [F.url('href', 'لینک'), F.text('label', 'نام'), F.icon('icon', 'آیکون')],
  },
  {
    type: 'html',
    label: 'HTML سفارشی',
    category: 'content',
    defaultProps: { html: '' },
    fields: [F.textarea('html', 'کد HTML')],
  },
];

export function getBlockDef(type: string): BlockDef | undefined {
  return BLOCK_LIBRARY.find((b) => b.type === type);
}

export function instantiateBlock(type: string): CmsBlock {
  const def = getBlockDef(type);
  if (!def) return createBlock(type, {});
  return createBlock(
    def.type,
    JSON.parse(JSON.stringify(def.defaultProps)),
    def.defaultChildren ? JSON.parse(JSON.stringify(def.defaultChildren)) : undefined,
    def.defaultStyle ? JSON.parse(JSON.stringify(def.defaultStyle)) : undefined,
  );
}
