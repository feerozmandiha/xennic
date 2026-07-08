import { Injectable, Logger } from '@nestjs/common';
import type { IQuotaRepository } from '../ports/quota-repository.interface.js';
import { IQUOTA_REPOSITORY } from '../ports/quota-repository.interface.js';
import type { IUsageRepository } from '../ports/usage-repository.interface.js';
import { IUSAGE_REPOSITORY } from '../ports/usage-repository.interface.js';
import { Inject } from '@nestjs/common';

@Injectable()
export class QuotaService {
  private readonly logger = new Logger(QuotaService.name);

  constructor(
    @Inject(IQUOTA_REPOSITORY)
    private readonly quotaRepo: IQuotaRepository,
    @Inject(IUSAGE_REPOSITORY)
    private readonly usageRepo: IUsageRepository,
  ) {}

  private readonly requestCounters = new Map<string, { count: number; resetAt: number }>();
  private readonly tokenCounters = new Map<string, { count: number; resetAt: number }>();

  async checkQuota(providerId: string, tokens: number): Promise<{ allowed: boolean; reason?: string }> {
    const quota = await this.quotaRepo.findByProviderId(providerId);
    if (!quota) return { allowed: true };

    const now = Date.now();
    const minute = 60_000;

    // Request rate limiting (in-memory, resets every minute)
    const reqKey = `req:${providerId}`;
    let reqCounter = this.requestCounters.get(reqKey);
    if (!reqCounter || now > reqCounter.resetAt) {
      reqCounter = { count: 0, resetAt: now + minute };
      this.requestCounters.set(reqKey, reqCounter);
    }
    reqCounter.count++;
    if (reqCounter.count > quota.requestsPerMin) {
      return { allowed: false, reason: 'Request rate limit exceeded' };
    }

    // Token rate limiting
    const tokKey = `tok:${providerId}`;
    let tokCounter = this.tokenCounters.get(tokKey);
    if (!tokCounter || now > tokCounter.resetAt) {
      tokCounter = { count: 0, resetAt: now + minute };
      this.tokenCounters.set(tokKey, tokCounter);
    }
    tokCounter.count += tokens;
    if (tokCounter.count > quota.tokensPerMin) {
      return { allowed: false, reason: 'Token rate limit exceeded' };
    }

    return { allowed: true };
  }

  async getQuota(providerId: string) {
    return this.quotaRepo.findByProviderId(providerId);
  }
}
