import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IMemoryStore } from '../domain/memory-store.interface.js';

@Injectable()
export class MemoryExpirationService {
  private readonly logger = new Logger(MemoryExpirationService.name);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject('IMemoryStore') private readonly store: IMemoryStore,
  ) {}

  async checkExpiration(): Promise<number> {
    const deleted = await this.store.deleteExpired();
    if (deleted > 0) {
      this.logger.log(`Expired ${deleted} memory entries`);
    }
    return deleted;
  }

  scheduleInterval(ms: number): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      this.checkExpiration().catch(err => {
        this.logger.error('Expiration check failed', err);
      });
    }, ms);
    this.logger.log(`Memory expiration scheduled every ${ms}ms`);
  }

  stopInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.logger.log('Memory expiration interval stopped');
    }
  }
}
