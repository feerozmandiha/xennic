import { createBlock, type CmsBlock, type CmsDocument } from './types';

/* ──────────────────────────────────────────────────────────────
 *  Default / seed content (schema v2 — includes style)
 * ──────────────────────────────────────────────────────────── */

export const DEFAULT_HEADER: CmsDocument = {
  schema: 'xennic-cms/v2',
  blocks: [
    createBlock('nav-links', {
      links: [
        { label: 'صفحه اصلی', href: '/' },
        { label: 'امکانات', href: '/#features' },
        { label: 'قیمت‌ها', href: '/#pricing' },
        { label: 'سوالات', href: '/#faq' },
        { label: 'تماس', href: '/contact' },
      ],
    }),
    createBlock('buttons', { justify: 'end' }, [
      createBlock('button', { label: 'ورود', href: '/login', variant: 'ghost', size: 'sm' }),
      createBlock('button', {
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
  blocks: [
    createBlock('columns', { cols: 4, gap: 'md' }, [
      createBlock('footer-column', { title: 'زنیک' }, [
        createBlock('paragraph', {
          text: 'پلتفرم تخصصی مهندسی برق با موتور محاسبات استاندارد و هوش مصنوعی.',
        }),
      ]),
      createBlock('footer-column', { title: 'محصول' }, [
        createBlock('nav-links', {
          links: [
            { label: 'موتور محاسبات', href: '/engineering' },
            { label: 'هوش مصنوعی', href: '/ai' },
            { label: 'دانشنامه', href: '/knowledge' },
            { label: 'بازارگاه', href: '/marketplace' },
          ],
        }),
      ]),
      createBlock('footer-column', { title: 'شرکت' }, [
        createBlock('nav-links', {
          links: [
            { label: 'درباره ما', href: '/about' },
            { label: 'تماس', href: '/contact' },
            { label: 'وبلاگ', href: '/articles' },
          ],
        }),
      ]),
      createBlock('footer-column', { title: 'ما را دنبال کنید' }, [
        createBlock('social-links', {}, [
          createBlock('social-link', { href: '#', label: 'وب‌سایت', icon: 'globe' }),
          createBlock('social-link', { href: '#', label: 'تلگرام', icon: 'send' }),
        ]),
      ]),
    ]),
  ],
};

export const DEFAULT_LANDING: CmsDocument = {
  schema: 'xennic-cms/v2',
  blocks: [
    createBlock(
      'hero',
      {
        eyebrow: 'پلتفرم تخصصی مهندسی برق',
        title: 'محاسبات، دانش و هوش مصنوعی در یک پلتفرم',
        subtitle:
          'زنیک با استانداردهای IEC، IEEE و VDE، محاسبات مهندسی برق، کیفیت توان و انرژی‌های تجدیدپذیر را در یک فضای کاری یکپارچه ارائه می‌دهد.',
      },
      [
        createBlock('buttons', { justify: 'center' }, [
          createBlock('button', {
            label: 'شروع رایگان',
            href: '/register',
            variant: 'primary',
            showArrow: true,
          }),
          createBlock('button', { label: 'مشاهده دمو', href: '/engineering', variant: 'outline' }),
        ]),
      ],
    ),

    createBlock('stats', {}, [
      createBlock('stat', { value: '۸۰+', label: 'محاسبه‌گر' }),
      createBlock('stat', { value: '۱۰k+', label: 'مهندس فعال' }),
      createBlock('stat', { value: '۹۹.۹٪', label: 'در دسترس بودن' }),
      createBlock('stat', { value: '۲۴/۷', label: 'پشتیبانی' }),
    ]),

    createBlock(
      'features',
      { title: 'چرا زنیک؟', subtitle: 'همه چیز برای مهندسان برق در یک پلتفرم' },
      [
        createBlock('feature', {
          icon: 'flask',
          color: 'from-[#3b82f6] to-[#6366f1]',
          title: 'محاسبات استاندارد',
          desc: '۲۰+ محاسبه تخصصی مطابق IEC 60364، IEC 60076، IEEE 519 و IEEE C57.110',
          tags: ['کابل‌سایزینگ', 'افت ولتاژ', 'اتصال کوتاه'],
        }),
        createBlock('feature', {
          icon: 'barChart3',
          color: 'from-[#06b6d4] to-[#3b82f6]',
          title: 'کیفیت توان',
          desc: 'تحلیل THD، TDD، K-Factor و طراحی فیلتر پسیو/فعال مطابق IEEE 519',
          tags: ['THD', 'TDD', 'فیلتر'],
        }),
        createBlock('feature', {
          icon: 'cpu',
          color: 'from-[#8b5cf6] to-[#6366f1]',
          title: 'هوش مصنوعی',
          desc: 'مشاور AI تخصصی برق با دانش استانداردها و تشخیص خطا',
          tags: ['مشاور', 'تشخیص', 'بهینه‌سازی'],
        }),
        createBlock('feature', {
          icon: 'layers',
          color: 'from-[#f59e0b] to-[#ef4444]',
          title: 'مدیریت پروژه',
          desc: 'سازماندهی پروژه‌ها، یادداشت‌های فنی، تاریخچه و همکاری تیمی',
          tags: ['Multi-tenant', 'RBAC'],
        }),
        createBlock('feature', {
          icon: 'shield',
          color: 'from-[#10b981] to-[#06b6d4]',
          title: 'امنیت و تطابق',
          desc: 'احراز هویت JWT، کنترل دسترسی نقش‌محور و ثبت کامل رویدادها',
          tags: ['JWT', 'RBAC', 'Audit'],
        }),
        createBlock('feature', {
          icon: 'globe',
          color: 'from-[#6366f1] to-[#8b5cf6]',
          title: 'چندزبانه و RTL',
          desc: 'پشتیبانی کامل فارسی با چینش RTL، فونت استاندارد و تقویم شمسی',
          tags: ['فارسی', 'RTL'],
        }),
      ],
    ),

    createBlock('steps', { title: 'در سه گام شروع کنید' }, [
      createBlock('step', {
        number: 1,
        title: 'ثبت‌نام',
        text: 'با ایمیل خود در کمتر از یک دقیقه حساب بسازید.',
      }),
      createBlock('step', {
        number: 2,
        title: 'ایجاد پروژه',
        text: 'پروژه‌ی مهندسی خود را ایجاد و تیم را دعوت کنید.',
      }),
      createBlock('step', {
        number: 3,
        title: 'محاسبه و خروجی',
        text: 'محاسبات را اجرا و گزارش PDF استاندارد دریافت کنید.',
      }),
    ]),

    createBlock(
      'pricing',
      { title: 'قیمت‌گذاری شفاف', subtitle: 'پلنی متن نیاز خود انتخاب کنید' },
      [
        createBlock(
          'pricing-plan',
          {
            name: 'رایگان',
            price: '۰',
            period: 'تومان / ماه',
            desc: 'برای آشنایی با پلتفرم',
            features: ['۱۰۰ محاسبه در ماه', 'محاسبات پایه', '۱ فضای کاری', '۱ گیگابایت فضا'],
          },
          [createBlock('button', { label: 'شروع رایگان', href: '/register', variant: 'outline' })],
        ),
        createBlock(
          'pricing-plan',
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
            createBlock('button', {
              label: 'شروع با Pro',
              href: '/register?plan=pro',
              variant: 'primary',
            }),
          ],
        ),
        createBlock(
          'pricing-plan',
          {
            name: 'سازمانی',
            price: 'تماس',
            period: 'برای قیمت',
            desc: 'برای شرکت‌ها',
            features: ['همه امکانات Pro', 'فضای کاری نامحدود', 'AI نامحدود', 'SSO & SAML'],
          },
          [createBlock('button', { label: 'تماس با فروش', href: '/contact', variant: 'outline' })],
        ),
      ],
    ),

    createBlock('testimonials', { title: 'نظر مهندسان' }, [
      createBlock('testimonial', {
        quote: 'گزارش‌های استاندارد این پلتفرم در زمان طراحی تابلوها بسیار کمک‌کننده بود.',
        author: 'مهندس رضایی',
        role: 'طراح ارشد',
        rating: 5,
      }),
      createBlock('testimonial', {
        quote: 'کیفیت توان و هارمونیک‌ها را دقیق محاسبه می‌کند.',
        author: 'دکتر موسوی',
        role: 'مشاور کیفیت توان',
        rating: 5,
      }),
      createBlock('testimonial', {
        quote: 'پشتیبانی سریع و رابط کاربری حرفه‌ای دارد.',
        author: 'مهندس کریمی',
        role: 'پیمانکار برق',
        rating: 4,
      }),
    ]),

    createBlock('faq', { title: 'سوالات متداول' }, [
      createBlock('faq-item', {
        question: 'آیا می‌توانم رایگان شروع کنم؟',
        answer: 'بله، پلن رایگان شامل ۱۰۰ محاسبه در ماه است و بدون نیاز به کارت بانکی فعال می‌شود.',
      }),
      createBlock('faq-item', {
        question: 'محاسبات مطابق کدام استانداردهاست؟',
        answer: 'IEC 60364، IEC 60076، IEEE 519، IEEE C57.110 و استانداردهای داخلی وزارت نیرو.',
      }),
      createBlock('faq-item', {
        question: 'داده‌های من امن است؟',
        answer:
          'بله. تمام ارتباطات TLS، رمزنگاری در حالت سکون، JWT و RBAC فعال است و لاگ کامل رویدادها ثبت می‌شود.',
      }),
    ]),

    createBlock('newsletter', {
      title: 'عضویت در خبرنامه',
      subtitle: 'از آخرین به‌روزرسانی‌ها و مقالات مهندسی باخبر شوید.',
    }),

    createBlock(
      'cta',
      {
        title: 'آماده‌اید محاسبات خود را هوشمند کنید؟',
        subtitle: 'همین حالا به جمع مهندسان حرفه‌ای بپیوندید.',
      },
      [
        createBlock('buttons', { justify: 'center' }, [
          createBlock('button', { label: 'شروع رایگان', href: '/register', variant: 'primary' }),
          createBlock('button', { label: 'تماس با ما', href: '/contact', variant: 'outline' }),
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
