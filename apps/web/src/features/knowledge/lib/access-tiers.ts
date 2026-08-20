export type AccessTier = 'free' | 'basic' | 'pro' | 'enterprise';

export const TIER_LABEL_FA: Record<AccessTier, string> = {
  free: 'بسیار ساده (عمومی)',
  basic: 'متوسط (کاربران واردشده)',
  pro: 'تخصصی (پلن Pro)',
  enterprise: 'فوق‌تخصصی (سازمانی)',
};

export const TIER_DESCRIPTION_FA: Record<AccessTier, string> = {
  free: 'بدون نیاز به ورود، قابل نمایش برای همه و ایندکس توسط موتورهای جستجو.',
  basic: 'پس از ورود به حساب کاربری قابل مشاهده است.',
  pro: 'نیازمند اشتراک فعال پلن حرفه‌ای.',
  enterprise: 'فقط برای مشترکین پلن سازمانی.',
};

export const TIER_BADGE_COLORS: Record<AccessTier, string> = {
  free: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  basic: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  pro: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  enterprise: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
};

export const ACCESS_TIERS: AccessTier[] = ['free', 'basic', 'pro', 'enterprise'];
