export interface ThemeTokens {
  // Brand
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
  // Surfaces
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  secondary: string;
  secondaryForeground: string;
  border: string;
  input: string;
  // Status
  destructive: string;
  destructiveForeground: string;
  success?: string;
  warning?: string;
  // Sidebar
  sidebar: string;
  sidebarForeground: string;
  // Radius + font
  radius: string;
  fontFamilySans?: string;
}

export const DEFAULT_THEME: ThemeTokens = {
  // Xennic corporate palette (from docs/SMOS)
  primary: '210 56% 23%', // #1A3A5C (Xennic Blue)
  primaryForeground: '0 0% 100%',
  accent: '204 47% 44%', // #3A7CA5 (Xennic Light Blue)
  accentForeground: '0 0% 100%',
  ring: '204 47% 44%',

  background: '0 0% 100%',
  foreground: '210 64% 11%', // #0D1B2A
  card: '0 0% 100%',
  cardForeground: '210 64% 11%',
  muted: '210 16% 96%',
  mutedForeground: '208 7% 45%', // #6C757D
  secondary: '204 47% 94%',
  secondaryForeground: '210 64% 11%',
  border: '210 16% 88%',
  input: '210 16% 88%',

  destructive: '354 70% 54%', // #DC3545
  destructiveForeground: '0 0% 100%',
  success: '134 61% 41%', // #28A745
  warning: '45 100% 51%', // #FFC107

  sidebar: '210 64% 11%',
  sidebarForeground: '0 0% 100%',

  radius: '0.625rem',
  fontFamilySans: "'Vazirmatn','IRANSans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
};
