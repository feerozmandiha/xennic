import { Global, Module, OnModuleInit, Logger } from '@nestjs/common';
import { ICALCULATION_REPOSITORY } from './application/ports/calculation-repository.interface.js';
import { IRESULT_REPOSITORY } from './application/ports/result-repository.interface.js';
import { ICERTIFICATE_REPOSITORY } from './application/ports/certificate-repository.interface.js';
import { IAUDIT_REPOSITORY } from './application/ports/audit-repository.interface.js';
import { IUNIT_REPOSITORY } from './application/ports/unit-repository.interface.js';
import { IPLUGIN_REPOSITORY } from './application/ports/plugin-repository.interface.js';

import { PrismaCalculationRepository } from './infrastructure/persistence/prisma-calculation.repository.js';
import { PrismaResultRepository } from './infrastructure/persistence/prisma-result.repository.js';
import { PrismaCertificateRepository } from './infrastructure/persistence/prisma-certificate.repository.js';
import { PrismaAuditRepository } from './infrastructure/persistence/prisma-audit.repository.js';
import { PrismaUnitRepository } from './infrastructure/persistence/prisma-unit.repository.js';
import { PrismaPluginRepository } from './infrastructure/persistence/prisma-plugin.repository.js';

import { FormulaEngine } from './infrastructure/engines/formula-engine.js';
import { UnitConversionEngine } from './infrastructure/engines/unit-conversion-engine.js';
import { DslRuntime } from './infrastructure/engines/dsl-runtime.js';
import { ValidationEngine } from './infrastructure/engines/validation-engine.js';
import { PluginRegistry } from './infrastructure/plugin-registry.js';

import { CalculationCacheService } from './infrastructure/cache/calculation-cache.service.js';
import { FormulaSanitizer } from './infrastructure/security/formula-sanitizer.js';
import { DslValidator } from './infrastructure/security/dsl-validator.js';
import { InputSanitizer } from './infrastructure/security/input-sanitizer.js';
import { PluginSandbox } from './infrastructure/sandbox/plugin-sandbox.js';
import { CalculationMetricsService } from './infrastructure/observability/calculation-metrics.service.js';
import { CalculationTracingService } from './infrastructure/observability/calculation-tracing.service.js';
import { CalculationLoggerService } from './infrastructure/observability/calculation-logger.service.js';

import { CalculationRegistryService } from './application/services/calculation-registry.service.js';
import { CalculationExecutionService } from './application/services/calculation-execution.service.js';
import { CalculationValidationService } from './application/services/calculation-validation.service.js';
import { UnitConversionService } from './application/services/unit-conversion.service.js';
import { CertificateService } from './application/services/certificate.service.js';
import { AuditService } from './application/services/audit.service.js';
import { PluginService } from './application/services/plugin.service.js';
import { CalculationVersioningService } from './application/services/calculation-versioning.service.js';

import { CalculationsController } from './presentation/controllers/calculations.controller.js';
import { CalculationAdminController } from './presentation/controllers/calculation-admin.controller.js';
import { CalculationFormulasController } from './presentation/controllers/calculation-formulas.controller.js';
import { CalculationUnitsController } from './presentation/controllers/calculation-units.controller.js';
import { CalculationCertificatesController } from './presentation/controllers/calculation-certificates.controller.js';

import { UnitConversionService as UnitAppService } from './application/services/unit-conversion.service.js';

@Global()
@Module({
  controllers: [
    CalculationsController,
    CalculationAdminController,
    CalculationFormulasController,
    CalculationUnitsController,
    CalculationCertificatesController,
  ],
  providers: [
    // Repository bindings
    { provide: ICALCULATION_REPOSITORY, useClass: PrismaCalculationRepository },
    { provide: IRESULT_REPOSITORY, useClass: PrismaResultRepository },
    { provide: ICERTIFICATE_REPOSITORY, useClass: PrismaCertificateRepository },
    { provide: IAUDIT_REPOSITORY, useClass: PrismaAuditRepository },
    { provide: IUNIT_REPOSITORY, useClass: PrismaUnitRepository },
    { provide: IPLUGIN_REPOSITORY, useClass: PrismaPluginRepository },

    // Infrastructure engines
    FormulaEngine,
    UnitConversionEngine,
    DslRuntime,
    ValidationEngine,
    PluginRegistry,

    // Infrastructure cache, security, sandbox, observability
    CalculationCacheService,
    FormulaSanitizer,
    DslValidator,
    InputSanitizer,
    PluginSandbox,
    CalculationMetricsService,
    CalculationTracingService,
    CalculationLoggerService,

    // Application services
    CalculationRegistryService,
    CalculationExecutionService,
    CalculationValidationService,
    UnitConversionService,
    CertificateService,
    AuditService,
    PluginService,
    CalculationVersioningService,
  ],
  exports: [
    CalculationRegistryService,
    CalculationExecutionService,
    CalculationValidationService,
    UnitConversionService,
    CertificateService,
    AuditService,
    PluginService,
    CalculationVersioningService,
  ],
})
@Global()
export class CalculationPlatformModule implements OnModuleInit {
  private readonly logger = new Logger(CalculationPlatformModule.name);

  constructor(private readonly unitService: UnitAppService) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'test' || process.env.CI === 'true') {
      this.logger.log('Unit seeding skipped in test/CI environment');
      return;
    }
    try {
      const count = await this.unitService.seedDefaultUnits();
      if (count > 0) {
        this.logger.log(`Seeded ${count} default unit definitions`);
      }
    } catch (error) {
      this.logger.warn(
        `Unit seeding skipped (DB may not be available): ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }
  }
}
