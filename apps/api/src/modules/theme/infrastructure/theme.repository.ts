import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DEFAULT_THEME, type ThemeTokens } from '../domain/theme.types.js';

/**
 * File-backed theme repository. Stores the current theme overrides as a
 * JSON file under `<cwd>/.data/cms/theme.json`. If the file doesn't exist
 * or is invalid, the default theme is returned.
 */
@Injectable()
export class ThemeRepository {
  private readonly logger = new Logger(ThemeRepository.name);
  private readonly filePath = path.resolve(process.cwd(), '.data', 'cms', 'theme.json');
  private cache: ThemeTokens | null = null;

  async get(): Promise<ThemeTokens> {
    if (this.cache) return this.cache;
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<ThemeTokens>;
      this.cache = { ...DEFAULT_THEME, ...parsed };
    } catch {
      this.cache = { ...DEFAULT_THEME };
    }
    return this.cache;
  }

  async save(tokens: ThemeTokens): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(tokens, null, 2), 'utf-8');
    this.cache = tokens;
    this.logger.log('Theme updated');
  }

  async reset(): Promise<ThemeTokens> {
    await fs.rm(this.filePath, { force: true });
    this.cache = { ...DEFAULT_THEME };
    return this.cache;
  }
}
