import { Global, Module } from '@nestjs/common';

// Controllers
import { ProvidersController } from './presentation/controllers/providers.controller.js';
import { ProviderModelsController } from './presentation/controllers/provider-models.controller.js';
import { ProviderAdminController } from './presentation/controllers/provider-admin.controller.js';
import { RoutingPolicyController } from './presentation/controllers/routing-policy.controller.js';

// Repository interfaces (tokens)
import { IPROVIDER_REPOSITORY } from './application/ports/provider-repository.interface.js';
import { ICREDENTIAL_REPOSITORY } from './application/ports/credential-repository.interface.js';
import { IMODEL_REPOSITORY } from './application/ports/model-repository.interface.js';
import { IHEALTH_REPOSITORY } from './application/ports/health-repository.interface.js';
import { ISTATISTICS_REPOSITORY } from './application/ports/statistics-repository.interface.js';
import { IUSAGE_REPOSITORY } from './application/ports/usage-repository.interface.js';
import { IQUOTA_REPOSITORY } from './application/ports/quota-repository.interface.js';
import { IROUTING_POLICY_REPOSITORY } from './application/ports/routing-policy-repository.interface.js';

// Repository implementations
import { PrismaProviderRepository } from './infrastructure/persistence/prisma-provider.repository.js';
import { PrismaCredentialRepository } from './infrastructure/persistence/prisma-credential.repository.js';
import { PrismaModelRepository } from './infrastructure/persistence/prisma-model.repository.js';
import { PrismaHealthRepository } from './infrastructure/persistence/prisma-health.repository.js';
import { PrismaStatisticsRepository } from './infrastructure/persistence/prisma-statistics.repository.js';
import { PrismaUsageRepository } from './infrastructure/persistence/prisma-usage.repository.js';
import { PrismaQuotaRepository } from './infrastructure/persistence/prisma-quota.repository.js';
import { PrismaRoutingPolicyRepository } from './infrastructure/persistence/prisma-routing-policy.repository.js';

// Application services
import { EncryptionService } from './application/services/encryption.service.js';
import { ProviderRegistryService } from './application/services/provider-registry.service.js';
import { CredentialService } from './application/services/credential.service.js';
import { ProviderHealthService } from './application/services/provider-health.service.js';
import { ModelRegistryService } from './application/services/model-registry.service.js';
import { RoutingEngineService } from './application/services/routing-engine.service.js';
import { FailoverService } from './application/services/failover.service.js';
import { ProviderDiscoveryService } from './application/services/provider-discovery.service.js';
import { ProviderMetricsService } from './application/services/provider-metrics.service.js';
import { ProviderMigrationService } from './application/services/provider-migration.service.js';
import { ProviderExecutionService } from './application/services/provider-execution.service.js';
import { QuotaService } from './application/services/quota.service.js';
import { RoutingPolicyService } from './application/services/routing-policy.service.js';

// Infrastructure
import { AesEncryptionService } from './infrastructure/encryption/aes-encryption.service.js';
import { CircuitBreakerService } from './infrastructure/circuit-breaker/circuit-breaker.service.js';
import { ProviderHttpClient } from './infrastructure/http/provider-http.client.js';
import { DiscoveryStrategyFactory } from './infrastructure/discovery/discovery-strategy.factory.js';

// Guards
import { AdminGuard } from '../admin/infrastructure/guards/admin.guard.js';

@Module({
  controllers: [
    ProvidersController,
    ProviderModelsController,
    ProviderAdminController,
    RoutingPolicyController,
  ],
  providers: [
    // Repository tokens → implementations
    { provide: IPROVIDER_REPOSITORY, useClass: PrismaProviderRepository },
    { provide: ICREDENTIAL_REPOSITORY, useClass: PrismaCredentialRepository },
    { provide: IMODEL_REPOSITORY, useClass: PrismaModelRepository },
    { provide: IHEALTH_REPOSITORY, useClass: PrismaHealthRepository },
    { provide: ISTATISTICS_REPOSITORY, useClass: PrismaStatisticsRepository },
    { provide: IUSAGE_REPOSITORY, useClass: PrismaUsageRepository },
    { provide: IQUOTA_REPOSITORY, useClass: PrismaQuotaRepository },
    {
      provide: IROUTING_POLICY_REPOSITORY,
      useClass: PrismaRoutingPolicyRepository,
    },

    // Infrastructure singletons
    AesEncryptionService,
    CircuitBreakerService,
    ProviderHttpClient,
    DiscoveryStrategyFactory,

    // Application services
    EncryptionService,
    ProviderRegistryService,
    CredentialService,
    ProviderHealthService,
    ModelRegistryService,
    RoutingEngineService,
    FailoverService,
    ProviderDiscoveryService,
    ProviderMetricsService,
    ProviderMigrationService,
    ProviderExecutionService,
    QuotaService,
    RoutingPolicyService,

    // Guards for @UseGuards(JwtAuthGuard, AdminGuard) resolution
    AdminGuard,
  ],
  exports: [
    ProviderRegistryService,
    CredentialService,
    ModelRegistryService,
    RoutingEngineService,
    FailoverService,
    EncryptionService,
    ProviderExecutionService,
    ProviderDiscoveryService,
    ProviderMetricsService,
    ProviderHealthService,
    QuotaService,
    RoutingPolicyService,
  ],
})
@Global()
export class AiProviderManagementModule {}
