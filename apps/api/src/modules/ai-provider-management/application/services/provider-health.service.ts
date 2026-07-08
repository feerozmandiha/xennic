import { Injectable, Logger } from '@nestjs/common';
import type { IHealthRepository } from '../ports/health-repository.interface.js';
import { IHEALTH_REPOSITORY } from '../ports/health-repository.interface.js';
import type { IProviderRepository } from '../ports/provider-repository.interface.js';
import { IPROVIDER_REPOSITORY } from '../ports/provider-repository.interface.js';
import { Inject } from '@nestjs/common';
import { ProviderHealthEntity, HealthStatus } from '../../domain/entities/provider-health.entity.js';
import { ProviderHttpClient } from '../../infrastructure/http/provider-http.client.js';

@Injectable()
export class ProviderHealthService {
  private readonly logger = new Logger(ProviderHealthService.name);

  constructor(
    @Inject(IHEALTH_REPOSITORY)
    private readonly healthRepo: IHealthRepository,
    @Inject(IPROVIDER_REPOSITORY)
    private readonly providerRepo: IProviderRepository,
    private readonly httpClient: ProviderHttpClient,
  ) {}

  async checkHealth(providerId: string, testUrl?: string): Promise<ProviderHealthEntity> {
    const provider = await this.providerRepo.findById(providerId);
    if (!provider) throw new Error(`Provider ${providerId} not found`);

    const start = Date.now();
    let status: HealthStatus = 'healthy';
    let errorMsg: string | null = null;

    try {
      const url = testUrl || provider.baseUrl || `https://api.${provider.providerType}.com/v1`;
      const res = await this.httpClient.request(`${url}/models`, { timeout: 10000 });

      if (!res.ok) {
        status = res.status === 0 ? 'unhealthy' : 'degraded';
        errorMsg = `HTTP ${res.status}`;
      }
    } catch (err) {
      status = 'unhealthy';
      errorMsg = (err as Error).message;
    }

    const latency = Date.now() - start;
    const health = ProviderHealthEntity.create(providerId, status, latency, errorMsg ?? undefined);
    await this.healthRepo.save(health);

    if (status !== 'healthy') {
      this.logger.warn(`Provider ${provider.name} health: ${status} (${latency}ms)`);
    }

    return health;
  }

  async getHealthHistory(providerId: string, limit = 20): Promise<ProviderHealthEntity[]> {
    return this.healthRepo.findByProviderId(providerId, limit);
  }

  async getLatestHealth(providerId: string): Promise<ProviderHealthEntity | null> {
    return this.healthRepo.findLatestByProviderId(providerId);
  }

  async getUnhealthyProviders(): Promise<Array<{ providerId: string; status: HealthStatus }>> {
    return this.healthRepo.findUnhealthyProviders();
  }

  async runScheduledCheck(): Promise<void> {
    const providers = await this.providerRepo.findAll({ enabled: true });
    this.logger.log(`Running health check for ${providers.length} providers`);

    for (const provider of providers) {
      try {
        await this.checkHealth(provider.id);
      } catch (err) {
        this.logger.error(`Health check failed for ${provider.name}: ${(err as Error).message}`);
      }
    }
  }
}
