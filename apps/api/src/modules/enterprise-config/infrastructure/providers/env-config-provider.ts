import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EnvConfigProvider {
  private readonly logger = new Logger(EnvConfigProvider.name);

  get(key: string): string | undefined {
    return process.env[key];
  }

  getInt(key: string, defaultValue: number): number {
    const val = process.env[key];
    if (val === undefined) return defaultValue;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }

  getBool(key: string, defaultValue: boolean): boolean {
    const val = process.env[key];
    if (val === undefined) return defaultValue;
    return val === 'true' || val === '1';
  }

  getOrThrow(key: string): string {
    const val = process.env[key];
    if (val === undefined) {
      throw new Error(`Required environment variable not set: ${key}`);
    }
    return val;
  }
}
