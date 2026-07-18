import { Injectable, Logger } from '@nestjs/common';
import type {
  CacheNamespace,
  CacheOptions,
  ICacheManager,
  ICacheInvalidation,
} from '../../domain/interfaces/cache-manager.interface.js';

interface StoreEntry<T = unknown> {
  value: T;
  expiresAt: number;
  tags: string[];
}

@Injectable()
export class CacheManagerService implements ICacheManager, ICacheInvalidation {
  private readonly logger = new Logger(CacheManagerService.name);
  private readonly stores = new Map<string, Map<string, StoreEntry>>();
  private readonly tagIndex = new Map<string, Set<string>>();

  private _getStore(namespace: CacheNamespace): Map<string, StoreEntry> {
    if (!this.stores.has(namespace)) {
      this.stores.set(namespace, new Map());
    }
    return this.stores.get(namespace)!;
  }

  private _tagKey(namespace: CacheNamespace, tag: string): string {
    return `${namespace}:tag:${tag}`;
  }

  private _isExpired(entry: StoreEntry): boolean {
    return entry.expiresAt > 0 && Date.now() > entry.expiresAt;
  }

  async get<T>(namespace: CacheNamespace, key: string): Promise<T | null> {
    const store = this._getStore(namespace);
    const entry = store.get(key);
    if (!entry) return null;
    if (this._isExpired(entry)) {
      store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(
    namespace: CacheNamespace,
    key: string,
    value: T,
    options?: CacheOptions,
  ): Promise<void> {
    const ttlMs = options?.ttlMs ?? 300_000;
    const tags = options?.tags ?? [];
    const expiresAt = ttlMs > 0 ? Date.now() + ttlMs : 0;

    const store = this._getStore(namespace);
    store.set(key, { value, expiresAt, tags });

    for (const tag of tags) {
      const tagKey = this._tagKey(namespace, tag);
      if (!this.tagIndex.has(tagKey)) {
        this.tagIndex.set(tagKey, new Set());
      }
      this.tagIndex.get(tagKey)!.add(key);
    }

    this.logger.debug(`Cache SET ${namespace}:${key} (ttl=${ttlMs}ms, tags=${tags.join(',')})`);
  }

  async delete(namespace: CacheNamespace, key: string): Promise<boolean> {
    const store = this._getStore(namespace);
    const entry = store.get(key);
    if (!entry) return false;

    store.delete(key);
    for (const tag of entry.tags) {
      const tagKey = this._tagKey(namespace, tag);
      this.tagIndex.get(tagKey)?.delete(key);
    }
    return true;
  }

  async clear(namespace?: CacheNamespace): Promise<void> {
    if (namespace) {
      this.stores.set(namespace, new Map());
    } else {
      this.stores.clear();
    }
    this.logger.log(`Cache cleared${namespace ? ` for namespace ${namespace}` : ''}`);
  }

  async getByTag(namespace: CacheNamespace, tag: string): Promise<string[]> {
    const tagKey = this._tagKey(namespace, tag);
    const keys = this.tagIndex.get(tagKey);
    return keys ? Array.from(keys) : [];
  }

  async invalidateByTag(namespace: CacheNamespace, tag: string): Promise<number> {
    const keys = await this.getByTag(namespace, tag);
    let count = 0;
    for (const key of keys) {
      if (await this.delete(namespace, key)) count++;
    }
    this.logger.log(`Cache invalidated ${count} entries by tag ${namespace}:${tag}`);
    return count;
  }

  async invalidateByNamespace(namespace: CacheNamespace): Promise<number> {
    const store = this._getStore(namespace);
    const count = store.size;
    store.clear();
    this.logger.log(`Cache invalidated ${count} entries in namespace ${namespace}`);
    return count;
  }

  async invalidateByPattern(namespace: CacheNamespace, pattern: string): Promise<number> {
    const store = this._getStore(namespace);
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let count = 0;
    for (const key of store.keys()) {
      if (regex.test(key)) {
        await this.delete(namespace, key);
        count++;
      }
    }
    this.logger.log(`Cache invalidated ${count} entries by pattern ${namespace}:${pattern}`);
    return count;
  }
}
