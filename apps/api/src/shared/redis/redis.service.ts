import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private connected = false;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    const redisUrl = process.env.REDIS_URL ||
      (() => {
        const host = process.env.REDIS_HOST ?? 'localhost';
        const port = process.env.REDIS_PORT ?? '6379';
        const password = process.env.REDIS_PASSWORD;
        return password
          ? `redis://:${encodeURIComponent(password)}@${host}:${port}`
          : `redis://${host}:${port}`;
      })();

    this.client = createClient({ url: redisUrl });
    this.client.on('error', (err) => {
      this.logger.warn(`Redis connection error: ${err.message}`);
    });
  }

  async onModuleInit(): Promise<void> {
    if (process.env['SKIP_INFRA_CONNECT'] === 'true') {
      this.logger.warn('Skipping Redis connection (SKIP_INFRA_CONNECT)');
      return;
    }
    try {
      await this.client.connect();
      this.connected = true;
      this.logger.log('Redis connected');
    } catch {
      this.logger.warn('Redis not available — running without cache');
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connected) {
      try {
        await this.client.quit();
      } catch {
        // ignore shutdown errors
      }
    }
  }

  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error('Redis is not connected');
    }
  }

  async get(key: string): Promise<string | null> {
    this.ensureConnected();
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.ensureConnected();
    if (ttlSeconds !== undefined) {
      await this.client.setEx(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    this.ensureConnected();
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    this.ensureConnected();
    const result = await this.client.exists(key);
    return result === 1;
  }

  getClient(): RedisClientType {
    this.ensureConnected();
    return this.client;
  }

  async ping(): Promise<string> {
    this.ensureConnected();
    return this.client.ping();
  }

  isConnected(): boolean {
    return this.connected;
  }
}
