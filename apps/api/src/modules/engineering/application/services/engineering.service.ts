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
  'CABLE-005': '/api/v1/engineering/cable/tray-sizing',

  // Transformer Engineering
  'TRF-001': '/api/v1/engineering/transformer/sizing',
  'TRF-002': '/api/v1/engineering/transformer/losses',
  'TRF-003': '/api/v1/engineering/transformer/regulation',
  'TRF-004': '/api/v1/engineering/transformer/k-factor',
  'TRF-005': '/api/v1/engineering/transformer/efficiency',

  // Protection Engineering
  'PROT-001':  '/api/v1/engineering/protection/mccb-selection',
  'SC-001':    '/api/v1/engineering/protection/short-circuit',
  'PROT-002':  '/api/v1/engineering/protection/arc-flash',
  'GND-001':   '/api/v1/engineering/protection/grounding',
  'PROT-004':  '/api/v1/engineering/protection/fuse-selection',
  'SWT-001':   '/api/v1/engineering/switchgear/main-switch',
  'LIGHT-001': '/api/v1/engineering/lighting/lumen-method',
  'LIGHT-002': '/api/v1/engineering/lighting/road-lighting',
  'GND-002':   '/api/v1/engineering/grounding/grid-design',
  'HARM-001':  '/api/v1/engineering/power-quality/advanced-harmonic',
  'BATTERY-002': '/api/v1/engineering/renewable/battery-charger',
  'PROT-005':  '/api/v1/engineering/protection/coordination',
  'ARC-001':   '/api/v1/engineering/protection/arc-incident',
  'SOLAR-002': '/api/v1/engineering/renewable/inverter-sizing',
  'SOLAR-003': '/api/v1/engineering/renewable/solar-battery',
  'PFC-001':   '/api/v1/engineering/power-quality/capacitor-bank',
  'BAT-BU-001':'/api/v1/engineering/renewable/backup-time',
  'ECO-001':   '/api/v1/engineering/economics/roi',
  'ECO-002':   '/api/v1/engineering/economics/npv',
  'ECO-003':   '/api/v1/engineering/economics/irr',

  // Power Quality ✅
  'PQ-001': '/api/v1/engineering/power-quality/thd',
  'PQ-002': '/api/v1/engineering/power-quality/tdd',
  'PQ-003': '/api/v1/engineering/power-quality/k-factor',
  'PQ-004': '/api/v1/engineering/power-quality/resonance',
  'PQ-005': '/api/v1/engineering/power-quality/passive-filter',
  'PQ-006': '/api/v1/engineering/power-quality/active-filter',
  'CAP-001': '/api/v1/engineering/power-quality/power-factor',

  // Renewable Energy & Motors
  'PV-001':  '/api/v1/engineering/renewable/solar-pv',
  'MOT-001': '/api/v1/engineering/renewable/motor-starting',
  'MOT-002': '/api/v1/engineering/renewable/motor-efficiency',
  'BAT-001': '/api/v1/engineering/renewable/battery-storage',

  // Power System Studies
  'PS-001': '/api/v1/engineering/power-system/load-flow',
  'PS-002': '/api/v1/engineering/power-system/short-circuit',
  'PS-003': '/api/v1/engineering/power-system/motor-starting',
  'PS-004': '/api/v1/engineering/power-system/busbar-sizing',

  // Energy Analyzer
  'EA-001':  '/api/v1/engineering/energy/analyze',
};

// ─── Plan limits ──────────────────────────────────────────────────────────────

// تمام محاسباتی که نیاز به پلن Pro+ دارند
const PRO_ONLY_CALCULATIONS = new Set([
  // Cable
  'CABLE-003', 'CABLE-004', 'CABLE-005',
  // Transformer
  'TRF-002', 'TRF-003', 'TRF-004', 'TRF-005',
  // Protection
  'PROT-001', 'SC-001', 'PROT-002', 'ARC-001',
  'PROT-003', 'PROT-005', 'SWT-001', 'GND-001', 'GND-002',
  // Power Quality
  'PQ-001', 'PQ-002', 'PQ-003', 'PQ-004', 'PQ-005', 'PQ-006',
  'HARM-001', 'PFC-001',
  // Power System Studies
  'PS-001', 'PS-002', 'PS-003', 'PS-004',
  // Renewable Energy
  'BAT-001', 'BAT-BU-001', 'BATTERY-002', 'SOLAR-002', 'SOLAR-003', 'MOT-002',
  // Lighting
  'LIGHT-002',
  // Economics
  'ECO-001', 'ECO-002', 'ECO-003',
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
