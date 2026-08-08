export type TaxonomyType = 'category' | 'topic' | 'tag' | 'discipline' | 'audience';

export interface TaxonomyMeta {
  type: TaxonomyType;
  labelFa: string;
  labelEn: string;
  icon: string;
  color: string;
  descriptionFa: string;
}

export const TAXONOMY_META: Record<TaxonomyType, TaxonomyMeta> = {
  category: {
    type: 'category',
    labelFa: 'دسته‌بندی',
    labelEn: 'Category',
    icon: '📁',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    descriptionFa: 'دسته‌بندی اصلی مقالات فنی',
  },
  topic: {
    type: 'topic',
    labelFa: 'موضوع',
    labelEn: 'Topic',
    icon: '📌',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    descriptionFa: 'موضوعات تخصصی مهندسی برق',
  },
  tag: {
    type: 'tag',
    labelFa: 'برچسب',
    labelEn: 'Tag',
    icon: '🏷️',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    descriptionFa: 'برچسب‌های کلیدی و کلمات مرتبط',
  },
  discipline: {
    type: 'discipline',
    labelFa: 'رشته',
    labelEn: 'Discipline',
    icon: '⚡',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    descriptionFa: 'حوزه‌های تخصصی مانند فشار قوی، توزیع، حفاظت',
  },
  audience: {
    type: 'audience',
    labelFa: 'مخاطب',
    labelEn: 'Audience',
    icon: '👥',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    descriptionFa: 'سطح مخاطب: مبتدی تا متخصص',
  },
};

export const DIFFICULTY_META: Record<
  string,
  { fa: string; en: string; color: string; level: number }
> = {
  beginner: {
    fa: 'مبتدی',
    en: 'Beginner',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    level: 1,
  },
  intermediate: {
    fa: 'متوسط',
    en: 'Intermediate',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    level: 2,
  },
  advanced: {
    fa: 'پیشرفته',
    en: 'Advanced',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    level: 3,
  },
  expert: {
    fa: 'متخصص',
    en: 'Expert',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    level: 4,
  },
};
