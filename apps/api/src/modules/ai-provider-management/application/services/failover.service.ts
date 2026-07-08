import { Injectable, Logger } from '@nestjs/common';
import { CircuitBreakerService } from '../../infrastructure/circuit-breaker/circuit-breaker.service.js';
import type { IProviderRepository } from '../ports/provider-repository.interface.js';
import { IPROVIDER_REPOSITORY } from '../ports/provider-repository.interface.js';
import type { IHealthRepository } from '../ports/health-repository.interface.js';
import { IHEALTH_REPOSITORY } from '../ports/health-repository.interface.js';
import { Inject } from '@nestjs/common';

export interface FailoverResult {
  success: boolean;
  providerId: string;
  latencyMs: number;
  attempts: number;
  error?: string;
}

@Injectable()
export class FailoverService {
  private readonly logger = new Logger(FailoverService.name);

  constructor(
    private readonly circuitBreaker: CircuitBreakerService,
    @Inject(IPROVIDER_REPOSITORY)
    private readonly providerRepo: IProviderRepository,
    @Inject(IHEALTH_REPOSITORY)
    private readonly healthRepo: IHealthRepository,
  ) {}

  async executeWithRetry(
    providerId: string,
    operation: () => Promise<unknown>,
    options?: { maxRetries?: number; baseDelayMs?: number },
  ): Promise<FailoverResult> {
    const maxRetries = options?.maxRetries ?? 3;
    const baseDelayMs = options?.baseDelayMs ?? 1000;
    const start = Date.now();
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!this.circuitBreaker.isAvailable(providerId)) {
          throw new Error(`Circuit breaker open for provider ${providerId}`);
        }

        await operation();
        const latency = Date.now() - start;
        this.circuitBreaker.recordSuccess(providerId);
        return { success: true, providerId, latencyMs: latency, attempts: attempt };
      } catch (err) {
        lastError = (err as Error).message;
        this.circuitBreaker.recordFailure(providerId);
        this.logger.warn(`Attempt ${attempt}/${maxRetries} failed for ${providerId}: ${lastError}`);

        if (attempt < maxRetries) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          this.logger.log(`Backoff: waiting ${delay}ms before retry ${attempt + 1}`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

    return {
      success: false, providerId,
      latencyMs: Date.now() - start,
      attempts: maxRetries, error: lastError,
    };
  }

  async getFailoverChain(providerId: string): Promise<string[]> {
    const providers = await this.providerRepo.findAll({ enabled: true });
    const chain = providers
      .sort((a, b) => a.priority - b.priority)
      .map(p => p.id);
    const index = chain.indexOf(providerId);
    if (index === -1) return chain;
    const primary = chain[index]!; return [primary, ...chain.slice(0, index), ...chain.slice(index + 1)];
  }

  recordSuccess(providerId: string): void {
    this.circuitBreaker.recordSuccess(providerId);
  }

  recordFailure(providerId: string): void {
    this.circuitBreaker.recordFailure(providerId);
  }

  getCircuitState(providerId: string): string {
    return this.circuitBreaker.getState(providerId);
  }
}
