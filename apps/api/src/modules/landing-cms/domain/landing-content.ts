/**
 * Landing CMS — نوع‌های محتوای قابل تنظیم صفحه فرود.
 *
 * این نوع‌ها فقط پوسته و ساختار «برندینگ/هدر/هرو/CTA/فوتر» را نگه می‌دارند.
 * داده‌های واقعی مقالات و پلن‌ها از endpointهای موجود خوانده می‌شوند تا
 * کد تکراری ایجاد نشود:
 *   - مقالات: GET /public/knowledge
 *   - پلن‌ها: GET /subscriptions/plans
 */

export interface CmsImage {
  fileId?: string;
  url?: string;
  alt?: string;
}

export interface CmsLink {
  label: string;
  href: string;
}

export interface CmsButton {
  label: string;
  href: string;
}

export interface CmsSeo {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: CmsImage;
}

export interface CmsBranding {
  platformName: string;
  logo?: CmsImage;
  favicon?: CmsImage;
  tagline?: string;
}

export interface CmsHeader {
  visible: boolean;
  links: CmsLink[];
  showLanguageSwitcher: boolean;
  showThemeToggle: boolean;
  ctaButton?: CmsButton;
}

export interface CmsHero {
  visible: boolean;
  badge?: string;
  title: string;
  highlightedWord?: string;
  subtitle: string;
  primaryButton?: CmsButton;
  secondaryButton?: CmsButton;
  backgroundImage?: CmsImage;
  showTerminalMockup: boolean;
  stats: { value: string; label: string }[];
}

export interface CmsCalcStub {
  code: string;
  label: string;
  formula?: string;
}

export interface CmsCalculationsSection {
  visible: boolean;
  title?: string;
  subtitle?: string;
  items: CmsCalcStub[];
}

export interface CmsFeatureItem {
  icon?: string;
  title: string;
  description: string;
}

export interface CmsFeaturesSection {
  visible: boolean;
  title?: string;
  subtitle?: string;
  items: CmsFeatureItem[];
}

export interface CmsCtaSection {
  visible: boolean;
  eyebrow?: string;
  title: string;
  highlightedText?: string;
  subtitle?: string;
  button?: CmsButton;
  trustBadges?: string[];
}

export interface CmsFooter {
  visible: boolean;
  aboutText?: string;
  copyright: string;
  version?: string;
  columns: { title: string; links: CmsLink[] }[];
}

export interface LandingContent {
  seo: CmsSeo;
  branding: CmsBranding;
  header: CmsHeader;
  hero: CmsHero;
  calculations: CmsCalculationsSection;
  features: CmsFeaturesSection;
  // مقالات و قیمت‌گذاری در CMS ذخیره نمی‌شوند؛ از API موجود خوانده می‌شوند.
  cta: CmsCtaSection;
  footer: CmsFooter;
}

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  seo: {
    title: 'Xennic — پلتفرم تخصصی مهندسی برق',
    description:
      'محاسبات مهندسی برق، کیفیت توان (IEEE 519) و انرژی‌های تجدیدپذیر با استانداردهای IEC و IEEE. رایگان شروع کنید.',
    keywords: [
      'مهندسی برق',
      'محاسبات مهندسی',
      'کیفیت توان',
      'THD',
      'IEEE 519',
      'IEC 60364',
      'Xennic',
    ],
  },
  branding: {
    platformName: 'Xennic',
    tagline: 'پلتفرم تخصصی مهندسی برق و انرژی‌های نو',
  },
  header: {
    visible: true,
    showLanguageSwitcher: true,
    showThemeToggle: true,
    links: [
      { label: 'صفحه اصلی', href: '/' },
      { label: 'محاسبات', href: '#calculations' },
      { label: 'مقالات', href: '/knowledge' },
      { label: 'درباره ما', href: '/about' },
      { label: 'تماس', href: '/contact' },
    ],
    ctaButton: { label: 'ورود', href: '/login' },
  },
  hero: {
    visible: true,
    badge: 'پلتفرم تخصصی مهندسی برق و انرژی‌های نو',
    title: 'محاسبات مهندسی',
    highlightedWord: 'هوشمند',
    subtitle:
      'از طراحی کابل تا آنالیز کیفیت توان، از خورشیدی تا شبکه هوشمند — همه محاسبات تخصصی شما در یک پلتفرم یکپارچه',
    primaryButton: { label: 'شروع رایگان', href: '/register' },
    secondaryButton: { label: 'امتحان رایگان', href: '#calculations' },
    showTerminalMockup: true,
    stats: [
      { value: '۲۰+', label: 'محاسبه استاندارد' },
      { value: 'IEC', label: '60364 / 60076' },
      { value: 'IEEE', label: '519 / C57.110' },
      { value: 'RTL', label: 'پشتیبانی فارسی' },
    ],
  },
  calculations: {
    visible: true,
    title: 'محاسبات رایگان',
    subtitle: 'بدون ثبت‌نام، سریع و مطابق استاندارد',
    items: [
      { code: 'BASIC-001', label: 'قانون اهم', formula: 'V = I × R' },
      { code: 'BASIC-002', label: 'توان اکتیو', formula: 'P = V × I × PF' },
      { code: 'CABLE-001', label: 'سایزینگ کابل', formula: 'S = ρLI/ΔV' },
      { code: 'CABLE-002', label: 'افت ولتاژ', formula: 'ΔV = 2ρLI/S' },
    ],
  },
  features: {
    visible: true,
    title: 'چرا Xennic؟',
    subtitle: 'یک پلتفرم یکپارچه برای تمام نیازهای مهندسی',
    items: [
      {
        icon: 'FlaskConical',
        title: 'محاسبات استاندارد',
        description: '۲۰+ محاسبه تخصصی مطابق IEC 60364، IEC 60076، IEEE 519 و IEEE C57.110',
      },
      {
        icon: 'BarChart3',
        title: 'کیفیت توان',
        description: 'تحلیل THD، TDD و طراحی فیلتر مطابق IEEE 519',
      },
      {
        icon: 'Cpu',
        title: 'هوش مصنوعی مهندسی',
        description: 'مشاور AI تخصصی برق با دانش استانداردها',
      },
      {
        icon: 'Shield',
        title: 'امنیت سازمانی',
        description: 'جداسازی چنداجاره‌ای، RBAC و رمزنگاری end-to-end',
      },
    ],
  },
  cta: {
    visible: true,
    eyebrow: 'شروع کنید',
    title: 'محاسبات مهندسی خود را',
    highlightedText: 'حرفه‌ای کنید',
    subtitle: 'همین الان ثبت‌نام کنید — بدون نیاز به کارت اعتباری، رایگان شروع کنید',
    button: { label: 'شروع رایگان', href: '/register' },
    trustBadges: ['امنیت کامل', 'بروزرسانی مداوم', 'پشتیبانی فارسی'],
  },
  footer: {
    visible: true,
    aboutText:
      'پلتفرم تخصصی محاسبات مهندسی برق، کیفیت توان و انرژی‌های تجدیدپذیر با استانداردهای IEC و IEEE',
    copyright: '© ۱۴۰۴ Xennic — تمام حقوق محفوظ است',
    version: 'v1.0.0',
    columns: [
      {
        title: 'محصول',
        links: [
          { label: 'ویژگی‌ها', href: '#features' },
          { label: 'محاسبات', href: '#calculations' },
          { label: 'پلن‌ها', href: '#pricing' },
        ],
      },
      {
        title: 'سایر',
        links: [
          { label: 'درباره ما', href: '/about' },
          { label: 'تماس', href: '/contact' },
          { label: 'ورود', href: '/login' },
        ],
      },
    ],
  },
};

export function mergeWithDefaults(partial: unknown): LandingContent {
  if (!partial || typeof partial !== 'object') return structuredClone(DEFAULT_LANDING_CONTENT);
  const src = partial as Record<string, any>;
  const def = structuredClone(DEFAULT_LANDING_CONTENT) as Record<string, any>;
  for (const key of Object.keys(def)) {
    if (src[key] && typeof src[key] === 'object' && !Array.isArray(src[key])) {
      def[key] = { ...def[key], ...src[key] };
    } else if (src[key] !== undefined) {
      def[key] = src[key];
    }
  }
  return def as LandingContent;
}
