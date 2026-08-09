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
  cta: CmsCtaSection;
  footer: CmsFooter;
}
export const DEFAULT_LANDING_CONTENT: LandingContent = {
  seo: {
    title: 'Xennic — پلتفرم تخصصی مهندسی برق',
    description: 'محاسبات مهندسی برق، کیفیت توان و انرژی‌های تجدیدپذیر با استانداردهای IEC و IEEE.',
    keywords: ['مهندسی برق', 'محاسبات مهندسی', 'کیفیت توان', 'THD', 'IEEE 519', 'IEC 60364', 'Xennic'],
  },
  branding: { platformName: 'Xennic', tagline: 'پلتفرم تخصصی مهندسی برق و انرژی‌های نو' },
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
    subtitle: 'همه محاسبات تخصصی شما در یک پلتفرم یکپارچه',
    primaryButton: { label: 'شروع رایگان', href: '/register' },
    secondaryButton: { label: 'امتحان رایگان', href: '#calculations' },
    showTerminalMockup: true,
    stats: [
      { value: '۲۰+', label: 'محاسبه استاندارد' },
      { value: 'IEC', label: '60364 / 60076' },
      { value: 'IEEE', label: '519 / C57.110' },
    ],
  },
  calculations: { visible: true, title: 'محاسبات رایگان', items: [] },
  features: { visible: true, title: 'چرا Xennic؟', items: [] },
  cta: {
    visible: true,
    title: 'محاسبات مهندسی خود را',
    highlightedText: 'حرفه‌ای کنید',
    button: { label: 'شروع رایگان', href: '/register' },
  },
  footer: {
    visible: true,
    aboutText: 'پلتفرم تخصصی محاسبات مهندسی برق و انرژی‌های تجدیدپذیر',
    copyright: '© ۱۴۰۴ Xennic — تمام حقوق محفوظ است',
    columns: [],
  },
};
export function mergeLandingContent(partial?: Partial<LandingContent> | null): LandingContent {
  if (!partial) return structuredClone(DEFAULT_LANDING_CONTENT);
  return {
    ...structuredClone(DEFAULT_LANDING_CONTENT),
    ...partial,
    seo: { ...DEFAULT_LANDING_CONTENT.seo, ...(partial.seo ?? {}) },
    branding: { ...DEFAULT_LANDING_CONTENT.branding, ...(partial.branding ?? {}) },
    header: { ...DEFAULT_LANDING_CONTENT.header, ...(partial.header ?? {}) },
    hero: { ...DEFAULT_LANDING_CONTENT.hero, ...(partial.hero ?? {}) },
    calculations: { ...DEFAULT_LANDING_CONTENT.calculations, ...(partial.calculations ?? {}) },
    features: { ...DEFAULT_LANDING_CONTENT.features, ...(partial.features ?? {}) },
    cta: { ...DEFAULT_LANDING_CONTENT.cta, ...(partial.cta ?? {}) },
    footer: { ...DEFAULT_LANDING_CONTENT.footer, ...(partial.footer ?? {}) },
  };
}
