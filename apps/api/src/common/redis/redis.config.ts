/**
 * Redis configuration — single source of truth for all Redis connections.
 *
 * Every Redis consumer in the app (ioredis clients, BullMQ queues/workers)
 * must derive its connection from here so the whole platform targets the
 * same REDIS_URL (host, port, password, db). This prevents the mismatch
 * where BullMQ fell back to `127.0.0.1:6379` (no password) while other
 * clients used `REDIS_URL` — causing NOAUTH / ECONNREFUSED at boot.
 */

export interface RedisConnectionOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

const DEFAULT_REDIS_URL = 'redis://localhost:6379';

/**
 * Parse REDIS_URL into ioredis/BullMQ connection options.
 *
 * Supported formats:
 *   redis://localhost:6379
 *   redis://:password@localhost:6379
 *   redis://:password@redis.internal:6380/3
 */
export function getRedisConnectionOptions(): RedisConnectionOptions {
  const raw = process.env.REDIS_URL || DEFAULT_REDIS_URL;
  try {
    const url = new URL(raw);
    return {
      host: url.hostname || 'localhost',
      port: url.port ? Number(url.port) : 6379,
      password: url.password ? decodeURIComponent(url.password) : undefined,
      db: url.pathname && url.pathname.length > 1 ? Number(url.pathname.slice(1)) : undefined,
    };
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}

/** The REDIS_URL the app resolves to (for logging / health checks). */
export function getRedisUrl(): string {
  return process.env.REDIS_URL || DEFAULT_REDIS_URL;
}
