import { Injectable } from '@nestjs/common';
import { ThemeRepository } from '../../infrastructure/theme.repository.js';
import { DEFAULT_THEME, type ThemeTokens } from '../../domain/theme.types.js';

const HSL_TRIPLE = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/;

@Injectable()
export class ThemeService {
  constructor(private readonly repo: ThemeRepository) {}

  async getTheme(): Promise<ThemeTokens> {
    return this.repo.get();
  }

  async updateTheme(tokens: Partial<ThemeTokens>): Promise<ThemeTokens> {
    const current = await this.repo.get();
    for (const [k, v] of Object.entries(tokens)) {
      if (v === undefined || v === null || v === '') continue;
      const key = k as keyof ThemeTokens;
      if (key === 'radius') {
        if (typeof v !== 'string' || !/^\d+(\.\d+)?(px|rem)?$/.test(v)) {
          throw new Error('radius باید عدد با واحد px یا rem باشد');
        }
        current[key] = v;
      } else if (key === 'fontFamilySans') {
        if (typeof v !== 'string') throw new Error('fontFamilySans نامعتبر است');
        current[key] = v;
      } else {
        if (typeof v !== 'string' || !HSL_TRIPLE.test(v)) {
          throw new Error(`${k} باید با فرمت H S% L% باشد (مثال: 210 56% 23%)`);
        }
        (current as unknown as Record<string, string>)[key] = v;
      }
    }
    await this.repo.save(current);
    return current;
  }

  async resetTheme(): Promise<ThemeTokens> {
    return this.repo.reset();
  }

  /** Generate a CSS string that sets the HSL tokens on :root */
  async getCss(): Promise<string> {
    const t = await this.repo.get();
    const lines = Object.entries(t)
      .filter(([, v]) => typeof v === 'string' && v.length > 0)
      .map(([k, v]) => `  --${camelToKebab(k)}: ${v};`);
    return `:root {\n${lines.join('\n')}\n}\n`;
  }

  getDefault(): ThemeTokens {
    return DEFAULT_THEME;
  }
}

function camelToKebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}
