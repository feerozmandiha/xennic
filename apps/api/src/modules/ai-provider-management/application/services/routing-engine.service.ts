import { Injectable, Logger } from '@nestjs/common';
import type { IProviderRepository } from '../ports/provider-repository.interface.js';
import { IPROVIDER_REPOSITORY } from '../ports/provider-repository.interface.js';
import type { IModelRepository } from '../ports/model-repository.interface.js';
import { IMODEL_REPOSITORY } from '../ports/model-repository.interface.js';
import type { IHealthRepository } from '../ports/health-repository.interface.js';
import { IHEALTH_REPOSITORY } from '../ports/health-repository.interface.js';
import { Inject } from '@nestjs/common';
import { AIProviderEntity } from '../../domain/entities/ai-provider.entity.js';
import { AIModelEntity, ModelType } from '../../domain/entities/ai-model.entity.js';
import { CircuitBreakerService } from '../../infrastructure/circuit-breaker/circuit-breaker.service.js';

export interface RoutingTarget {
  provider: AIProviderEntity;
  model: AIModelEntity | null;
  score: number;
}

export interface RoutingRequest {
  capability?: ModelType | string;
  preferredProviderId?: string;
  preferredModelId?: string;
  workspaceId?: string;
  featureFlag?: string;
  minLatency?: number;
  maxCost?: number;
}

@Injectable()
export class RoutingEngineService {
  private readonly logger = new Logger(RoutingEngineService.name);

  constructor(
    @Inject(IPROVIDER_REPOSITORY)
    private readonly providerRepo: IProviderRepository,
    @Inject(IMODEL_REPOSITORY)
    private readonly modelRepo: IModelRepository,
    @Inject(IHEALTH_REPOSITORY)
    private readonly healthRepo: IHealthRepository,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  async route(request: RoutingRequest): Promise<RoutingTarget> {
    const providers = await this.getAvailableProviders();

    if (providers.length === 0) {
      throw new Error('No available AI providers');
    }

    // Specific provider requested
    if (request.preferredProviderId) {
      const provider = providers.find(p => p.id === request.preferredProviderId);
      if (provider) {
        const model = request.preferredModelId
          ? (await this.modelRepo.findByModelId(provider.id, request.preferredModelId)) ?? null
          : null;
        return { provider, model, score: 1.0 };
      }
    }

    // Filter by capability
    if (request.capability) {
      const models = await this.modelRepo.findByType(request.capability as ModelType, { enabledOnly: true });
      const capableProviders = providers.filter(p => models.some(m => m.providerId === p.id));
      if (capableProviders.length > 0) {
        return this.selectBest(capableProviders, request);
      }
    }

    // Default: select by priority
    return this.selectBest(providers, request);
  }

  async routeWithFallback(request: RoutingRequest): Promise<RoutingTarget> {
    const primary = await this.route(request);
    if (this.circuitBreaker.isAvailable(primary.provider.id)) {
      return primary;
    }

    this.logger.warn(`Provider ${primary.provider.name} circuit open, attempting failover`);
    const fallback = await this.fallback(primary.provider.id, request);
    return fallback;
  }

  private async fallback(excludeProviderId: string, request: RoutingRequest): Promise<RoutingTarget> {
    const providers = (await this.getAvailableProviders())
      .filter(p => p.id !== excludeProviderId && this.circuitBreaker.isAvailable(p.id));

    if (providers.length === 0) {
      throw new Error('No fallback providers available');
    }

    return this.selectBest(providers, request);
  }

  private async selectBest(providers: AIProviderEntity[], _request: RoutingRequest): Promise<RoutingTarget> {
    const scored: RoutingTarget[] = [];

    for (const provider of providers) {
      const health = await this.healthRepo.findLatestByProviderId(provider.id);
      const latency = health?.latencyMs ?? 1000;
      const isHealthy = health?.status === 'healthy' || !health;

      let score = provider.defaultWeight * (isHealthy ? 1.0 : 0.3);
      score *= Math.max(0.1, 1 - (latency / 5000));
      score *= (1 / (provider.priority + 1));

      scored.push({ provider, model: null, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored[0]!;
  }

  private async getAvailableProviders(): Promise<AIProviderEntity[]> {
    const providers = await this.providerRepo.findAll({ enabled: true });
    return providers.filter(p => this.circuitBreaker.isAvailable(p.id));
  }

  async getRoutingMetrics(): Promise<{
    total: number; available: number; circuitOpen: number;
  }> {
    const all = await this.providerRepo.findAll();
    const available = all.filter(p => this.circuitBreaker.isAvailable(p.id)).length;
    const circuitOpen = all.filter(p => !this.circuitBreaker.isAvailable(p.id)).length;
    return { total: all.length, available, circuitOpen };
  }
}
