import type { CmsBlockStyle } from './types';

/**
 * ابزارهای تبدیل CmsBlockStyle به کلاس/استایل بومی
 */

const PADDING_Y: Record<NonNullable<CmsBlockStyle['paddingY']>, string> = {
  none: 'py-0',
  sm: 'py-6',
  md: 'py-10',
  lg: 'py-16 md:py-20',
  xl: 'py-24 md:py-32',
};

const PADDING_X: Record<NonNullable<CmsBlockStyle['paddingX']>, string> = {
  none: 'px-0',
  sm: 'px-3',
  md: 'px-5 md:px-6',
  lg: 'px-8 md:px-12',
};

const MARGIN_Y: Record<NonNullable<CmsBlockStyle['marginY']>, string> = {
  none: 'my-0',
  sm: 'my-3',
  md: 'my-6',
  lg: 'my-10',
};

const MAX_W: Record<NonNullable<CmsBlockStyle['maxWidth']>, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

const ROUNDED: Record<NonNullable<CmsBlockStyle['rounded']>, string> = {
  none: 'rounded-none',
  sm: 'rounded-md',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  full: 'rounded-full',
};

const SHADOW: Record<NonNullable<CmsBlockStyle['shadow']>, string> = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-2xl',
};

const TEXT_SIZE: Record<NonNullable<CmsBlockStyle['textSize']>, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
};

const FONT_WEIGHT: Record<NonNullable<CmsBlockStyle['fontWeight']>, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const ALIGN: Record<NonNullable<CmsBlockStyle['align']>, string> = {
  start: 'items-start text-right',
  center: 'items-center text-center',
  end: 'items-end text-left',
};

const TEXT_ALIGN: Record<NonNullable<CmsBlockStyle['textAlign']>, string> = {
  right: 'text-right',
  center: 'text-center',
  left: 'text-left',
};

export function styleToClasses(s?: CmsBlockStyle): string {
  if (!s) return '';
  const classes: string[] = [];
  if (s.paddingY) classes.push(PADDING_Y[s.paddingY]);
  if (s.paddingX) classes.push(PADDING_X[s.paddingX]);
  if (s.marginY) classes.push(MARGIN_Y[s.marginY]);
  if (s.maxWidth) classes.push(MAX_W[s.maxWidth]);
  if (s.rounded) classes.push(ROUNDED[s.rounded]);
  if (s.shadow) classes.push(SHADOW[s.shadow]);
  if (s.textSize) classes.push(TEXT_SIZE[s.textSize]);
  if (s.fontWeight) classes.push(FONT_WEIGHT[s.fontWeight]);
  if (s.textAlign) classes.push(TEXT_ALIGN[s.textAlign]);
  if (s.align) classes.push(ALIGN[s.align]);
  if (s.border) classes.push('border border-[hsl(var(--border))]');
  if (s.className) classes.push(s.className);
  return classes.join(' ');
}

export function styleToCss(s?: CmsBlockStyle): React.CSSProperties {
  if (!s) return {};
  const css: React.CSSProperties = {};
  if (s.backgroundColor) css.backgroundColor = s.backgroundColor;
  if (s.textColor) css.color = s.textColor;
  if (s.gradient) css.backgroundImage = s.gradient;
  if (s.backgroundImage) {
    css.backgroundImage = css.backgroundImage
      ? `${css.backgroundImage as string}, url(${s.backgroundImage})`
      : `url(${s.backgroundImage})`;
    css.backgroundSize = 'cover';
    css.backgroundPosition = 'center';
  }
  if (s.backgroundOverlay) css.position = 'relative';
  return css;
}

/**
 * برای بلوک‌های container مانند hero/cta/section که پس‌زمینه و پدینگ دارند.
 */
export function containerStyleProps(s?: CmsBlockStyle) {
  return {
    className: styleToClasses(s),
    style: styleToCss(s),
  };
}
