import { createBlock, type CmsBlock, type CmsDocument } from './types';

/* ──────────────────────────────────────────────────────────────
 *  Default / seed content
 *  در صورت نبود رکورد در دیتابیس، از این مقادیر به‌عنوان پیش‌فرض
 *  استفاده می‌شود. این مقادیر با همان ساختار قابل ویرایش هستند.
 * ──────────────────────────────────────────────────────────── */

export const DEFAULT_HEADER: CmsDocument = {
  schema: 'xennic-cms/v1',
  blocks: [
    createBlock('nav-links', {
      links: [
        { label: 'صفحه اصلی', href: '/' },
        { label: 'امکانات', href: '/#features' },
        { label: 'قیمت‌ها', href: '/#pricing' },
        { label: 'سوالات متداول', href: '/#faq' },
        { label: 'تماس', href: '/contact' },
      ],
    }),
    createBlock('buttons', {}, [
      createBlock('button', { label: 'ورود', href: '/login', variant: 'ghost' }),
      createBlock('button', {
        label: 'شروع رایگان',
        href: '/register',
        variant: 'primary',
      }),
    ]),
  ],
};

export const DEFAULT_FOOTER: CmsDocument = {
  schema: 'xennic-cms/v1',
  blocks: [
    createBlock('columns', { cols: 4 }, [
      createBlock('footer-column', { title: 'زنیک' }, [
        createBlock('paragraph', {
          align: 'right',
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
      createBlock('footer-column', { title: 'حقوقی' }, [
        createBlock('nav-links', {
          links: [
            { label: 'حریم خصوصی', href: '/privacy' },
            { label: 'شرایط استفاده', href: '/terms' },
          ],
        }),
      ]),
    ]),
  ],
};

export const DEFAULT_LANDING: CmsDocument = {
  schema: 'xennic-cms/v1',
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
        createBlock('buttons', {}, [
          createBlock('button', {
            label: 'شروع رایگان',
            href: '/register',
            variant: 'primary',
            showArrow: true,
          }),
          createBlock('button', {
            label: 'مشاهده دمو',
            href: '/engineering',
            variant: 'outline',
          }),
        ]),
      ],
    ),

    createBlock('stats', {
      items: [
        { value: '۸۰+', label: 'محاسبه‌گر' },
        { value: '۱۰k+', label: 'مهندس فعال' },
        { value: '۹۹.۹٪', label: 'در دسترس بودن' },
        { value: '۲۴/۷', label: 'پشتیبانی' },
      ],
    }),

    createBlock('features', { title: 'چرا زنیک؟', id: 'features' }, [
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
    ]),

    createBlock('pricing', { title: 'قیمت‌گذاری شفاف', id: 'pricing' }, [
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
    ]),

    createBlock('faq', { title: 'سوالات متداول', id: 'faq' }, [
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

    createBlock(
      'cta',
      {
        title: 'آماده‌اید محاسبات خود را هوشمند کنید؟',
        subtitle: 'همین حالا به جمع مهندسان حرفه‌ای بپیوندید.',
      },
      [
        createBlock('buttons', {}, [
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

export const BLOCK_LIBRARY: {
  type: CmsBlock['type'];
  label: string;
  defaultProps: Record<string, unknown>;
}[] = [
  {
    type: 'hero',
    label: 'هیرو',
    defaultProps: { title: 'عنوان', subtitle: 'توضیحات', eyebrow: 'تیتر کوچک' },
  },
  { type: 'features', label: 'بخش ویژگی‌ها', defaultProps: { title: 'عنوان بخش' } },
  {
    type: 'feature',
    label: 'ویژگی تکی',
    defaultProps: { title: 'عنوان', desc: 'توضیح', icon: 'zap' },
  },
  { type: 'pricing', label: 'بخش قیمت', defaultProps: { title: 'قیمت‌ها' } },
  {
    type: 'pricing-plan',
    label: 'پلن قیمت',
    defaultProps: { name: 'پلن', price: '۰', period: '/ماه' },
  },
  { type: 'cta', label: 'فراخوان', defaultProps: { title: 'عنوان', subtitle: 'توضیح' } },
  { type: 'faq', label: 'سوالات متداول', defaultProps: { title: 'سوالات' } },
  { type: 'faq-item', label: 'سوال', defaultProps: { question: 'سوال؟', answer: 'پاسخ' } },
  { type: 'stats', label: 'آمار', defaultProps: { items: [] } },
  { type: 'testimonials', label: 'نظرات', defaultProps: { title: 'مشتریان' } },
  {
    type: 'testimonial',
    label: 'نظر تکی',
    defaultProps: { quote: 'متن نظر', author: 'نام', rating: 5 },
  },
  { type: 'contact', label: 'اطلاعات تماس', defaultProps: {} },
  { type: 'heading', label: 'تیتر', defaultProps: { text: 'عنوان', as: 'h2', size: 'lg' } },
  { type: 'paragraph', label: 'پاراگراف', defaultProps: { text: 'متن پاراگراف', align: 'center' } },
  { type: 'rich-text', label: 'متن غنی', defaultProps: { html: '<p>متن</p>' } },
  { type: 'image', label: 'تصویر', defaultProps: { src: '', alt: '', ratio: '16/9' } },
  { type: 'buttons', label: 'گروه دکمه', defaultProps: {} },
  { type: 'button', label: 'دکمه', defaultProps: { label: 'دکمه', href: '#', variant: 'primary' } },
  { type: 'columns', label: 'ستون‌ها', defaultProps: { cols: 3 } },
  { type: 'spacer', label: 'فاصله', defaultProps: { size: 'md' } },
  { type: 'divider', label: 'جداکننده', defaultProps: {} },
  { type: 'html', label: 'HTML سفارشی', defaultProps: { html: '' } },
];
