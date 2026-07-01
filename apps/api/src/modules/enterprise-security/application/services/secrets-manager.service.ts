import { Injectable, Logger } from '@nestjs/common';
import type { ISecretsManager } from '../../domain/interfaces/security-interfaces.js';
import type { SecretEntry } from '../../domain/types/security.types.js';

@Injectable()
export class SecretsManager implements ISecretsManager {
  private readonly logger = new Logger(SecretsManager.name);
  private store = new Map<string, SecretEntry>();

  async get(key: string): Promise<string | null> {
    const envValue = process.env[`SECRET_${key}`] ?? process.env[key];
    if (envValue) return envValue;
    return this.store.get(key)?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    const existing = this.store.get(key);
    this.store.set(key, {
      key, value,
      version: (existing?.version ?? 0) + 1,
      rotationDate: new Date(Date.now() + 90 * 86400000),
      environment: process.env.NODE_ENV ?? 'development',
    });
    this.logger.debug(`Secret set: ${key}`);
  }

  async rotate(key: string): Promise<void> {
    const existing = this.store.get(key);
    if (!existing) throw new Error(`Secret not found: ${key}`);
    this.logger.log(`Secret rotated: ${key} v${existing.version} → v${existing.version + 1}`);
  }

  async list(environment?: string): Promise<SecretEntry[]> {
    const entries = Array.from(this.store.values());
    return environment ? entries.filter((e) => e.environment === environment) : entries;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
    this.logger.debug(`Secret deleted: ${key}`);
  }
}
