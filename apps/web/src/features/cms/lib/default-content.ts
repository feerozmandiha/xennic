import { createBlock as _createBlock, newBlockId, type CmsBlock, type CmsDocument } from './types';

// Stable createBlock for default content — accepts optional fixed id as 2nd arg
// to avoid hydration mismatches (the random id from newBlockId differs between
// server and client module evaluation).
function createBlock(
  type: CmsBlock['type'],
  idOrProps?: string | Record<string, unknown>,
  propsOrChildren?: Record<string, unknown> | CmsBlock[],
  childrenOrStyle?: CmsBlock[] | Record<string, unknown>,
  maybeStyle?: Record<string, unknown>,
): CmsBlock {
  if (typeof idOrProps === 'string') {
    const id = idOrProps;
    const props = (propsOrChildren as Record<string, unknown>) ?? {};
    const children = Array.isArray(childrenOrStyle) ? (childrenOrStyle as CmsBlock[]) : undefined;
    const style = Array.isArray(childrenOrStyle)
      ? (maybeStyle as Record<string, unknown> | undefined)
      : (childrenOrStyle as Record<string, unknown> | undefined);
    return { type, id, props, ...(children ? { children } : {}), ...(style ? { style } : {}) };
  }
  const props = (idOrProps as Record<string, unknown>) ?? {};
  const children = Array.isArray(propsOrChildren) ? (propsOrChildren as CmsBlock[]) : undefined;
  const style = Array.isArray(propsOrChildren)
    ? (childrenOrStyle as Record<string, unknown> | undefined)
    : (propsOrChildren as Record<string, unknown> | undefined);
  return {
    type,
    id: newBlockId(),
    props,
    ...(children ? { children } : {}),
    ...(style ? { style } : {}),
  };
}
void _createBlock;

/* ──────────────────────────────────────────────────────────────
 *  Default / seed content (schema v2 — includes style)
 * ──────────────────────────────────────────────────────────── */

export const DEFAULT_HEADER: CmsDocument = {
  schema: 'xennic-cms/v2',
  blocks: [
    createBlock('nav-links', 'default-nav-links-1', {
      links: [
        { label: 'صفحه اصلی', href: '/' },
        { label: 'امکانات', href: '/#features' },
        { label: 'قیمت‌ها', href: '/#pricing' },
        { label: 'سوالات', href: '/#faq' },
        { label: 'تماس', href: '/contact' },
      ],
    }),
    createBlock('buttons', 'default-buttons-1', { justify: 'end' }, [
      createBlock('button', 'default-button-1', {
        label: 'ورود',
        href: '/login',
        variant: 'ghost',
        size: 'sm',
      }),
      createBlock('button', 'default-button-2', {
        label: 'شروع رایگان',
        href: '/register',
        variant: 'primary',
        size: 'sm',
      }),
    ]),
  ],
};

export const DEFAULT_FOOTER: CmsDocument = {
  schema: 'xennic-cms/v2',
  blocks: [],
};

export const DEFAULT_LANDING: CmsDocument = {
  schema: 'xennic-cms/v2',
  blocks: [
    createBlock(
      'hero',
      'default-hero-1',
      {
        eyebrow: 'پلتفرم تخصصی مهندسی برق',
        title: 'محاسبات، دانش و هوش مصنوعی در یک پلتفرم',
        subtitle:
          'زنیک با استانداردهای IEC، IEEE و VDE، محاسبات مهندسی برق، کیفیت توان و انرژی‌های تجدیدپذیر را در یک فضای کاری یکپارچه ارائه می‌دهد.',
      },
      [
        createBlock('buttons', 'default-buttons-2', { justify: 'center' }, [
          createBlock('button', 'default-button-3', {
            label: 'شروع رایگان',
            href: '/register',
            variant: 'primary',
            showArrow: true,
          }),
          createBlock('button', 'default-button-4', {
            label: 'مشاهده دمو',
            href: '/engineering',
            variant: 'outline',
          }),
        ]),
      ],
    ),

    createBlock('stats', 'default-stats-1', {}, [
      createBlock('stat', 'default-stat-1', { value: '۸۰+', label: 'محاسبه‌گر' }),
      createBlock('stat', 'default-stat-2', { value: '۱۰k+', label: 'مهندس فعال' }),
      createBlock('stat', 'default-stat-3', { value: '۹۹.۹٪', label: 'در دسترس بودن' }),
      createBlock('stat', 'default-stat-4', { value: '۲۴/۷', label: 'پشتیبانی' }),
    ]),

    createBlock(
      'features',
      'default-features-1',
      { title: 'چرا زنیک؟', subtitle: 'همه چیز برای مهندسان برق در یک پلتفرم' },
      [
        createBlock('feature', 'default-feature-1', {
          icon: 'flask',
          color: 'from-[#3b82f6] to-[#6366f1]',
          title: 'محاسبات استاندارد',
          desc: '۲۰+ محاسبه تخصصی مطابق IEC 60364، IEC 60076، IEEE 519 و IEEE C57.110',
          tags: ['کابل‌سایزینگ', 'افت ولتاژ', 'اتصال کوتاه'],
        }),
        createBlock('feature', 'default-feature-2', {
          icon: 'barChart3',
          color: 'from-[#06b6d4] to-[#3b82f6]',
          title: 'کیفیت توان',
          desc: 'تحلیل THD، TDD، K-Factor و طراحی فیلتر پسیو/فعال مطابق IEEE 519',
          tags: ['THD', 'TDD', 'فیلتر'],
        }),
        createBlock('feature', 'default-feature-3', {
          icon: 'cpu',
          color: 'from-[#8b5cf6] to-[#6366f1]',
          title: 'هوش مصنوعی',
          desc: 'مشاور AI تخصصی برق با دانش استانداردها و تشخیص خطا',
          tags: ['مشاور', 'تشخیص', 'بهینه‌سازی'],
        }),
        createBlock('feature', 'default-feature-4', {
          icon: 'layers',
          color: 'from-[#f59e0b] to-[#ef4444]',
          title: 'مدیریت پروژه',
          desc: 'سازماندهی پروژه‌ها، یادداشت‌های فنی، تاریخچه و همکاری تیمی',
          tags: ['Multi-tenant', 'RBAC'],
        }),
        createBlock('feature', 'default-feature-5', {
          icon: 'shield',
          color: 'from-[#10b981] to-[#06b6d4]',
          title: 'امنیت و تطابق',
          desc: 'احراز هویت JWT، کنترل دسترسی نقش‌محور و ثبت کامل رویدادها',
          tags: ['JWT', 'RBAC', 'Audit'],
        }),
        createBlock('feature', 'default-feature-6', {
          icon: 'globe',
          color: 'from-[#6366f1] to-[#8b5cf6]',
          title: 'چندزبانه و RTL',
          desc: 'پشتیبانی کامل فارسی با چینش RTL، فونت استاندارد و تقویم شمسی',
          tags: ['فارسی', 'RTL'],
        }),
      ],
    ),

    createBlock('steps', 'default-steps-1', { title: 'در سه گام شروع کنید' }, [
      createBlock('step', 'default-step-1', {
        number: 1,
        title: 'ثبت‌نام',
        text: 'با ایمیل خود در کمتر از یک دقیقه حساب بسازید.',
      }),
      createBlock('step', 'default-step-2', {
        number: 2,
        title: 'ایجاد پروژه',
        text: 'پروژه‌ی مهندسی خود را ایجاد و تیم را دعوت کنید.',
      }),
      createBlock('step', 'default-step-3', {
        number: 3,
        title: 'محاسبه و خروجی',
        text: 'محاسبات را اجرا و گزارش PDF استاندارد دریافت کنید.',
      }),
    ]),

    createBlock(
      'pricing',
      'default-pricing-1',
      { title: 'قیمت‌گذاری شفاف', subtitle: 'پلنی متن نیاز خود انتخاب کنید' },
      [
        createBlock(
          'pricing-plan',
          'default-pricing-plan-1',
          {
            name: 'رایگان',
            price: '۰',
            period: 'تومان / ماه',
            desc: 'برای آشنایی با پلتفرم',
            features: ['۱۰۰ محاسبه در ماه', 'محاسبات پایه', '۱ فضای کاری', '۱ گیگابایت فضا'],
          },
          [
            createBlock('button', 'default-button-5', {
              label: 'شروع رایگان',
              href: '/register',
              variant: 'outline',
            }),
          ],
        ),
        createBlock(
          'pricing-plan',
          'default-pricing-plan-2',
          {
            name: 'حرفه‌ای',
            price: '۴۹۰,۰۰۰',
            period: 'تومان / ماه',
            desc: 'برای مهندسان حرفه‌ای',
            badge: 'محبوب‌ترین',
            highlighted: true,
            features: [
              'محاسبات نامحدود',
              'همه ماژول‌ها',
              '۵ فضای کاری',
              '۵۰ گیگابایت فضا',
              'AI (۵۰۰ درخواست/ماه)',
            ],
          },
          [
            createBlock('button', 'default-button-6', {
              label: 'شروع با Pro',
              href: '/register?plan=pro',
              variant: 'primary',
            }),
          ],
        ),
        createBlock(
          'pricing-plan',
          'default-pricing-plan-3',
          {
            name: 'سازمانی',
            price: 'تماس',
            period: 'برای قیمت',
            desc: 'برای شرکت‌ها',
            features: ['همه امکانات Pro', 'فضای کاری نامحدود', 'AI نامحدود', 'SSO & SAML'],
          },
          [
            createBlock('button', 'default-button-7', {
              label: 'تماس با فروش',
              href: '/contact',
              variant: 'outline',
            }),
          ],
        ),
      ],
    ),

    createBlock('testimonials', 'default-testimonials-1', { title: 'نظر مهندسان' }, [
      createBlock('testimonial', 'default-testimonial-1', {
        quote: 'گزارش‌های استاندارد این پلتفرم در زمان طراحی تابلوها بسیار کمک‌کننده بود.',
        author: 'مهندس رضایی',
        role: 'طراح ارشد',
        rating: 5,
      }),
      createBlock('testimonial', 'default-testimonial-2', {
        quote: 'کیفیت توان و هارمونیک‌ها را دقیق محاسبه می‌کند.',
        author: 'دکتر موسوی',
        role: 'مشاور کیفیت توان',
        rating: 5,
      }),
      createBlock('testimonial', 'default-testimonial-3', {
        quote: 'پشتیبانی سریع و رابط کاربری حرفه‌ای دارد.',
        author: 'مهندس کریمی',
        role: 'پیمانکار برق',
        rating: 4,
      }),
    ]),

    createBlock('faq', 'default-faq-1', { title: 'سوالات متداول' }, [
      createBlock('faq-item', 'default-faq-item-1', {
        question: 'آیا می‌توانم رایگان شروع کنم؟',
        answer: 'بله، پلن رایگان شامل ۱۰۰ محاسبه در ماه است و بدون نیاز به کارت بانکی فعال می‌شود.',
      }),
      createBlock('faq-item', 'default-faq-item-2', {
        question: 'محاسبات مطابق کدام استانداردهاست؟',
        answer: 'IEC 60364، IEC 60076، IEEE 519، IEEE C57.110 و استانداردهای داخلی وزارت نیرو.',
      }),
      createBlock('faq-item', 'default-faq-item-3', {
        question: 'داده‌های من امن است؟',
        answer:
          'بله. تمام ارتباطات TLS، رمزنگاری در حالت سکون، JWT و RBAC فعال است و لاگ کامل رویدادها ثبت می‌شود.',
      }),
    ]),

    createBlock('newsletter', 'default-newsletter-1', {
      title: 'عضویت در خبرنامه',
      subtitle: 'از آخرین به‌روزرسانی‌ها و مقالات مهندسی باخبر شوید.',
    }),

    createBlock(
      'cta',
      'default-cta-1',
      {
        title: 'آماده‌اید محاسبات خود را هوشمند کنید؟',
        subtitle: 'همین حالا به جمع مهندسان حرفه‌ای بپیوندید.',
      },
      [
        createBlock('buttons', 'default-buttons-3', { justify: 'center' }, [
          createBlock('button', 'default-button-8', {
            label: 'شروع رایگان',
            href: '/register',
            variant: 'primary',
          }),
          createBlock('button', 'default-button-9', {
            label: 'تماس با ما',
            href: '/contact',
            variant: 'outline',
          }),
        ]),
      ],
    ),
  ],
};

export const DEFAULT_CONTENT: Record<string, CmsDocument> = {
  'site/header': DEFAULT_HEADER,
  'site/footer': DEFAULT_FOOTER,
  'landing/page': DEFAULT_LANDING,
};

export function getDefaultDocument(slot: string): CmsDocument | undefined {
  return DEFAULT_CONTENT[slot];
}

export const EDITABLE_SLOTS: { slot: string; label: string; description: string }[] = [
  { slot: 'landing/page', label: 'صفحه فرود', description: 'محتوای کامل صفحه اصلی' },
  { slot: 'site/header', label: 'هدر سایت', description: 'منو و دکمه‌های نوار بالا' },
  { slot: 'site/footer', label: 'فوتر سایت', description: 'ستون‌ها و لینک‌های پاورقی' },
];

// Back-compat: re-export BLOCK_LIBRARY consumers can import from this file.
export { BLOCK_LIBRARY } from './block-library';

export type { CmsBlock };
