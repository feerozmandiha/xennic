import { Injectable } from '@nestjs/common';
import type { IDynamicConfigService } from '../../domain/interfaces/config-interfaces.js';
import type { ConfigEntry } from '../../domain/types/config.types.js';
import { ConfigValueType, ConfigScope } from '../../domain/types/config.types.js';

@Injectable()
export class DynamicConfigService implements IDynamicConfigService {
  private overrides = new Map<string, unknown>();
  private watchers = new Map<string, Array<(value: unknown) => void>>();

  async get(key: string): Promise<unknown | null> {
    return this.overrides.get(key) ?? null;
  }

  async getWithDefault<T>(key: string, defaultValue: T): Promise<T> {
    const val = this.overrides.get(key);
    return (val !== undefined ? val : defaultValue) as T;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.overrides.set(key, value);
    const cbs = this.watchers.get(key);
    if (cbs) for (const cb of cbs) cb(value);
  }

  async delete(key: string): Promise<void> {
    this.overrides.delete(key);
  }

  async watch(key: string, callback: (value: unknown) => void): Promise<void> {
    if (!this.watchers.has(key)) this.watchers.set(key, []);
    this.watchers.get(key)!.push(callback);
  }

  async list(tags?: string[]): Promise<ConfigEntry[]> {
    return Array.from(this.overrides.entries()).map(([key, value]) => ({
      key, value, scope: ConfigScope.SYSTEM, type: ConfigValueType.JSON,
      description: '', version: 1, tags: tags ?? [], isEncrypted: false,
      createdAt: new Date(), updatedAt: new Date(),
    }));
  }
}
