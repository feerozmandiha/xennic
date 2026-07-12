import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../../admin/infrastructure/guards/admin.guard.js';
import { ProviderRegistryService } from '../../application/services/provider-registry.service.js';
import { CredentialService } from '../../application/services/credential.service.js';
import { ProviderHealthService } from '../../application/services/provider-health.service.js';
import { ProviderDiscoveryService } from '../../application/services/provider-discovery.service.js';
import { RoutingEngineService } from '../../application/services/routing-engine.service.js';
import { FailoverService } from '../../application/services/failover.service.js';
import { ProviderMetricsService } from '../../application/services/provider-metrics.service.js';
import { ProviderMigrationService } from '../../application/services/provider-migration.service.js';
import { QuotaService } from '../../application/services/quota.service.js';
import { CircuitBreakerService } from '../../infrastructure/circuit-breaker/circuit-breaker.service.js';
import { TestConnectionDto } from '../dtos/test-connection.dto.js';
import { DiscoverProviderDto } from '../dtos/discover-provider.dto.js';
import { CreateRoutingPolicyDto } from '../dtos/routing-policy.dto.js';
import { HealthResponseDto } from '../dtos/health-response.dto.js';
import { ProviderResponseDto } from '../dtos/provider-response.dto.js';

@ApiTags('AI Provider Management - Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/ai')
export class ProviderAdminController {
  constructor(
    private readonly registry: ProviderRegistryService,
    private readonly credentials: CredentialService,
    private readonly health: ProviderHealthService,
    private readonly discovery: ProviderDiscoveryService,
    private readonly routing: RoutingEngineService,
    private readonly failover: FailoverService,
    private readonly metrics: ProviderMetricsService,
    private readonly migration: ProviderMigrationService,
    private readonly quota: QuotaService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  // ── Credentials ────────────────────────────────────────────────────────────

  @Get('providers/:id/credentials')
  @ApiOperation({ summary: 'Get provider credentials (masked)' })
  async getCredentials(@Param('id') id: string) {
    const creds = await this.registry.getCredentials(id);
    return { success: true, data: creds };
  }

  @Get('providers/:id/api-key')
  @ApiOperation({ summary: 'Get decrypted API key for a provider' })
  async getApiKey(@Param('id') id: string) {
    const key = await this.registry.getApiKey(id);
    return { success: true, data: { apiKey: key } };
  }

  // ── Health ─────────────────────────────────────────────────────────────────

  @Post('providers/:id/health/check')
  @ApiOperation({ summary: 'Run health check for a provider' })
  async checkHealth(@Param('id') id: string, @Query('testUrl') testUrl?: string) {
    const entity = await this.health.checkHealth(id, testUrl);
    return { success: true, data: HealthResponseDto.fromEntity(entity) };
  }

  @Get('providers/:id/health')
  @ApiOperation({ summary: 'Get health check history' })
  @HttpCode(HttpStatus.OK)
  async getHealthHistory(@Param('id') id: string, @Query('limit') limit?: string) {
    const entities = await this.health.getHealthHistory(id, Number(limit ?? 20));
    return { success: true, data: HealthResponseDto.fromEntities(entities) };
  }

  @Get('providers/:id/health/latest')
  @ApiOperation({ summary: 'Get latest health check result' })
  async getLatestHealth(@Param('id') id: string) {
    const entity = await this.health.getLatestHealth(id);
    return { success: true, data: entity ? HealthResponseDto.fromEntity(entity) : null };
  }

  @Get('health/unhealthy')
  @ApiOperation({ summary: 'List all unhealthy providers' })
  async getUnhealthyProviders() {
    const data = await this.health.getUnhealthyProviders();
    return { success: true, data };
  }

  // ── Discovery ──────────────────────────────────────────────────────────────

  @Post('discovery/test-connection')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test connection to a provider' })
  async testConnection(@Body() dto: TestConnectionDto) {
    const result = await this.discovery.testConnection(
      dto.apiKey,
      dto.providerType ?? 'openai',
      dto.baseUrl,
    );
    return { success: true, data: result };
  }

  @Post('discovery/connect')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Discover models and create provider' })
  async discoverAndCreate(@Body() dto: DiscoverProviderDto, @Req() req: any) {
    const discovered = await this.discovery.discover(dto.apiKey, dto.providerType, dto.baseUrl);
    const entity = await this.registry.register({
      name: `${dto.providerType}-${Date.now()}`,
      displayName: discovered.providerName || dto.providerType,
      providerType: dto.providerType,
      apiKey: dto.apiKey,
      baseUrl: dto.baseUrl,
      orgId: dto.orgId,
      createdBy: req.user.userId,
    });
    const saved = await this.discovery.saveDiscoveredModels(entity.id, discovered.models);
    return {
      success: true,
      data: {
        provider: ProviderResponseDto.fromEntity(entity),
        models: saved.map((m) => ({
          modelId: m.modelId,
          displayName: m.displayName,
          modelType: m.modelType,
        })),
      },
    };
  }

  @Post('discovery/refresh/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh models for a provider' })
  async refreshModels(@Param('id') id: string) {
    const models = await this.discovery.refreshModels(id);
    return { success: true, data: { models: models.length } };
  }

  @Get('discovery/supported-types')
  @ApiOperation({ summary: 'List supported provider types' })
  getSupportedTypes() {
    return { success: true, data: this.discovery.getSupportedTypes() };
  }

  // ── Routing ────────────────────────────────────────────────────────────────

  @Post('routing/route')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Route a request to the best provider' })
  async route(@Body() dto: CreateRoutingPolicyDto) {
    const target = await this.routing.route({
      capability: dto.config?.capability as string | undefined,
      preferredProviderId: dto.config?.preferredProviderId as string | undefined,
      preferredModelId: dto.config?.preferredModelId as string | undefined,
      workspaceId: dto.workspaceId,
      featureFlag: dto.featureFlag,
    });
    return {
      success: true,
      data: {
        provider: { id: target.provider.id, name: target.provider.name },
        model: target.model ? { id: target.model.id, modelId: target.model.modelId } : null,
        score: target.score,
      },
    };
  }

  @Post('routing/fallback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Route with automatic fallback' })
  async routeWithFallback(@Body() dto: CreateRoutingPolicyDto) {
    const target = await this.routing.routeWithFallback({
      capability: dto.config?.capability as string | undefined,
      preferredProviderId: dto.config?.preferredProviderId as string | undefined,
      preferredModelId: dto.config?.preferredModelId as string | undefined,
      workspaceId: dto.workspaceId,
    });
    return {
      success: true,
      data: {
        provider: { id: target.provider.id, name: target.provider.name },
        model: target.model ? { id: target.model.id, modelId: target.model.modelId } : null,
        score: target.score,
      },
    };
  }

  @Get('routing/metrics')
  @ApiOperation({ summary: 'Get routing metrics' })
  async getRoutingMetrics() {
    const data = await this.routing.getRoutingMetrics();
    return { success: true, data };
  }

  // ── Failover / Circuit Breaker ─────────────────────────────────────────────

  @Get('providers/:id/circuit')
  @ApiOperation({ summary: 'Get circuit breaker state' })
  async getCircuitState(@Param('id') id: string) {
    const state = this.circuitBreaker.getState(id);
    const metrics = this.circuitBreaker.getMetrics(id);
    return { success: true, data: { state, metrics } };
  }

  @Get('providers/:id/routing/chain')
  @ApiOperation({ summary: 'Get failover chain for a provider' })
  async getFailoverChain(@Param('id') id: string) {
    const chain = await this.failover.getFailoverChain(id);
    return { success: true, data: chain };
  }

  @Get('circuits')
  @ApiOperation({ summary: 'List all circuit breaker states' })
  async getAllCircuits() {
    const providers = await this.registry.findAll({ enabled: true });
    const circuits = providers.map((p) => ({
      providerId: p.id,
      providerName: p.name,
      state: this.circuitBreaker.getState(p.id),
      metrics: this.circuitBreaker.getMetrics(p.id),
    }));
    return { success: true, data: circuits };
  }

  // ── Migration ──────────────────────────────────────────────────────────────

  @Post('migration/from-env')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Migrate providers from environment variables' })
  async migrateFromEnv(@Req() req: any) {
    const result = await this.migration.migrateFromEnv(req.user.userId);
    return { success: true, data: result };
  }

  @Get('migration/needed')
  @ApiOperation({ summary: 'Check if migration from env is needed' })
  async isMigrationNeeded() {
    const needed = await this.migration.isMigrationNeeded();
    return { success: true, data: { needed } };
  }

  // ── Metrics ────────────────────────────────────────────────────────────────

  @Get('providers/:id/metrics')
  @ApiOperation({ summary: 'Get provider metrics' })
  async getProviderMetrics(@Param('id') id: string) {
    const data = await this.metrics.getStats(id);
    return { success: true, data };
  }

  @Get('metrics/aggregated')
  @ApiOperation({ summary: 'Get aggregated metrics across all providers' })
  async getAggregatedMetrics() {
    const data = await this.metrics.getAggregatedMetrics();
    return { success: true, data };
  }

  // ── Quota ──────────────────────────────────────────────────────────────────

  @Get('providers/:id/quota')
  @ApiOperation({ summary: 'Get quota for a provider' })
  async getQuota(@Param('id') id: string) {
    const data = await this.quota.getQuota(id);
    return { success: true, data };
  }
}
