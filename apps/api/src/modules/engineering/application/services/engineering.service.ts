import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EngineeringClientService } from '../../infrastructure/http/engineering-client.service.js';
import type { ICalculationRepository } from '../../domain/interfaces/calculation.repository.interface.js';
import { CalculationEntity } from '../../domain/entities/calculation.entity.js';
import { SubscriptionService, FEATURE } from '../../../subscription/application/services/subscription.service.js';

// ─── نگاشت calculation type به path در Python service ─────────────────────────

const CALCULATION_ROUTES: Record<string, string> = {
  // Basic Electrical
  'BASIC-001': '/api/v1/engineering/basic/ohms-law',
  'BASIC-002': '/api/v1/engineering/basic/active-power',
  'BASIC-003': '/api/v1/engineering/basic/apparent-power',
  'BASIC-004': '/api/v1/engineering/basic/reactive-power',
  'BASIC-005': '/api/v1/engineering/basic/power-factor',

  // Cable Engineering
  'CABLE-001': '/api/v1/engineering/cable/sizing',
  'CABLE-002': '/api/v1/engineering/cable/voltage-drop',
  'CABLE-003': '/api/v1/engineering/cable/short-circuit',
  'CABLE-004': '/api/v1/engineering/cable/pe-sizing',

  // Transformer Engineering
  'TRF-001': '/api/v1/engineering/transformer/sizing',
  'TRF-002': '/api/v1/engineering/transformer/losses',
  'TRF-003': '/api/v1/engineering/transformer/regulation',
  'TRF-004': '/api/v1/engineering/transformer/k-factor',

  // Protection Engineering
  'PROT-001':  '/api/v1/engineering/protection/mccb-selection',
  'SC-001':    '/api/v1/engineering/protection/short-circuit',
  'PROT-002':  '/api/v1/engineering/protection/arc-flash',
  'GND-001':   '/api/v1/engineering/protection/grounding',

  // Power Quality ✅
  'PQ-001': '/api/v1/engineering/power-quality/thd',
  'PQ-002': '/api/v1/engineering/power-quality/tdd',
  'PQ-003': '/api/v1/engineering/power-quality/k-factor',
  'PQ-004': '/api/v1/engineering/power-quality/resonance',
  'PQ-005': '/api/v1/engineering/power-quality/passive-filter',
  'PQ-006': '/api/v1/engineering/power-quality/active-filter',

  // Renewable Energy & Motors
  'PV-001':  '/api/v1/engineering/renewable/solar-pv',
  'MOT-001': '/api/v1/engineering/renewable/motor-starting',
  'BAT-001': '/api/v1/engineering/renewable/battery-storage',

  // Energy Analyzer
  'EA-001':  '/api/v1/engineering/energy/analyze',
};

// ─── Plan limits ──────────────────────────────────────────────────────────────

// calculator های که فقط PRO+ می‌توانند استفاده کنند (بر اساس Authorization Spec)
const PRO_ONLY_CALCULATIONS = new Set([
  'PROT-001', // Protection Coordination
  // Power Quality (آینده)
  'PQ-001', 'PQ-002', 'PQ-003', 'PQ-004', 'PQ-005', 'PQ-006',
  // Power System Studies (آینده)
  'PS-001', 'PS-002',
  // Arc Flash (آینده)
  'ARC-001',
]);

export interface RunCalculationInput {
  workspaceId: string;
  projectId?: string;
  userId: string;
  type: string;                          // e.g. "BASIC-001"
  inputs: Record<string, unknown>;
  planSlug?: string;                     // 'free' | 'pro' | 'enterprise'
}

export interface PaginatedCalculations {
  data: CalculationEntity[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class EngineeringService {
  constructor(
    private readonly engineeringClient: EngineeringClientService,
    @Inject('ICalculationRepository')
    private readonly calculationRepository: ICalculationRepository,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  // ─── run ──────────────────────────────────────────────────────────────────────

  async run(input: RunCalculationInput): Promise<{
    calculation: CalculationEntity;
    result: Record<string, unknown>;
  }> {
    // 1. دریافت plan slug واقعی از دیتابیس
    const planSlug = await this.subscriptionService.getActivePlanSlug(input.workspaceId);

    // 2. بررسی plan دسترسی
    this._checkPlanAccess(input.type, planSlug);

    // 3. بررسی quota ماهانه و ثبت usage
    await this.subscriptionService.consumeQuota(input.workspaceId, FEATURE.CALCULATIONS);

    // 4. یافتن مسیر Python service
    const path = CALCULATION_ROUTES[input.type];
    if (!path) {
      throw new NotFoundException(
        `Calculation type "${input.type}" is not supported`,
      );
    }

    // 5. اجرا در Python service + اندازه‌گیری زمان
    const start = Date.now();
    const response = await this.engineeringClient.calculate(path, input.inputs);
    const durationMs = Date.now() - start;

    const data = response.data as Record<string, unknown>;

    // 6. ذخیره در دیتابیس
    const calculation = CalculationEntity.create({
      workspaceId:     input.workspaceId,
      projectId:       input.projectId ?? null,
      userId:          input.userId,
      type:            input.type,
      version:         (data['formula_version'] as string) ?? '1.0',
      inputs:          (data['inputs']   as Record<string, unknown>) ?? input.inputs,
      results:         (data['results']  as Record<string, unknown>) ?? {},
      engineVersion:   (data['engine_version']   as string) ?? 'unknown',
      standardVersion: (data['standard_version'] as string) ?? 'unknown',
      durationMs,
    });

    await this.calculationRepository.save(calculation);

    return { calculation, result: data };
  }

  // ─── findAll ──────────────────────────────────────────────────────────────────

  async findAll(
    workspaceId: string,
    page = 1,
    limit = 20,
    projectId?: string,
    type?: string,
  ): Promise<PaginatedCalculations> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.calculationRepository.findAll(workspaceId, { projectId, type, offset, limit }),
      this.calculationRepository.count(workspaceId, projectId),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── findOne ──────────────────────────────────────────────────────────────────

  async findOne(id: string, workspaceId: string): Promise<CalculationEntity> {
    const calc = await this.calculationRepository.findById(id);
    if (!calc) throw new NotFoundException(`Calculation "${id}" not found`);
    if (calc.workspaceId !== workspaceId) {
      throw new ForbiddenException('Access denied to this calculation');
    }
    return calc;
  }

  // ─── delete ───────────────────────────────────────────────────────────────────

  async delete(id: string, workspaceId: string): Promise<void> {
    await this.findOne(id, workspaceId); // workspace isolation check
    await this.calculationRepository.delete(id);
  }

  // ─── availableCalculations ────────────────────────────────────────────────────

  availableCalculations(planSlug = 'free'): string[] {
    return Object.keys(CALCULATION_ROUTES).filter((type) => {
      if (PRO_ONLY_CALCULATIONS.has(type)) {
        return planSlug === 'pro' || planSlug === 'enterprise';
      }
      return true;
    });
  }

  // ─── engineeringHealth ───────────────────────────────────────────────────────

  async engineeringHealth() {
    return this.engineeringClient.health();
  }

  // ─── private helpers ─────────────────────────────────────────────────────────

  private _checkPlanAccess(type: string, planSlug: string): void {
    if (PRO_ONLY_CALCULATIONS.has(type)) {
      if (planSlug !== 'pro' && planSlug !== 'enterprise') {
        throw new ForbiddenException(
          `Calculation "${type}" requires a Pro or Enterprise subscription`,
        );
      }
    }
  }
}
