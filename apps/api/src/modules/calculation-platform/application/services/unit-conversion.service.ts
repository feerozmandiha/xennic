import { Injectable, Logger, Inject } from '@nestjs/common';
import { IUNIT_REPOSITORY } from '../ports/unit-repository.interface.js';
import type { IUnitRepository } from '../ports/unit-repository.interface.js';
import { UnitDefinitionEntity } from '../../domain/entities/unit-definition.entity.js';
import { UnitConversionEntity } from '../../domain/entities/unit-conversion.entity.js';
import { UnitConversionEngine } from '../../infrastructure/engines/unit-conversion-engine.js';
import { UNIT_CONVERSION_MATRIX } from '../../shared/constants/unit-categories.js';

@Injectable()
export class UnitConversionService {
  private readonly logger = new Logger(UnitConversionService.name);

  constructor(
    @Inject(IUNIT_REPOSITORY)
    private readonly repo: IUnitRepository,
    private readonly engine: UnitConversionEngine,
  ) {}

  async getAllUnits() {
    return this.repo.findAllUnits();
  }

  async getUnitsByCategory(category: string) {
    return this.repo.findUnitsByCategory(category);
  }

  async getUnitBySymbol(symbol: string) {
    return this.repo.findUnitBySymbol(symbol);
  }

  async createUnit(data: { category: string; name: string; symbol: string; baseUnit: string; factor: number; offset?: number; description?: string | null }): Promise<UnitDefinitionEntity> {
    const entity = UnitDefinitionEntity.create(data);
    await this.repo.saveUnit(entity);
    return entity;
  }

  async convert(value: number, fromUnit: string, toUnit: string): Promise<{ value: number; unit: string }> {
    const result = this.engine.convert(value, fromUnit, toUnit);
    return { value: result, unit: toUnit };
  }

  normalize(value: number, unit: string): number {
    const category = this.engine.getCategory(unit);
    if (!category) throw new Error(`Unknown unit: ${unit}`);
    const normalized = this.engine.normalize(value, unit, category);
    return normalized.value;
  }

  async format(value: number, unit: string, precision?: number) {
    return this.engine.format(value, unit, precision);
  }

  getCategories(): string[] {
    return Object.keys(UNIT_CONVERSION_MATRIX);
  }

  canConvert(fromUnit: string, toUnit: string): boolean {
    return this.engine.canConvert(fromUnit, toUnit);
  }

  async seedDefaultUnits(): Promise<number> {
    let count = 0;
    for (const [category, info] of Object.entries(UNIT_CONVERSION_MATRIX)) {
      for (const [symbol, def] of Object.entries(info.units)) {
        const existing = await this.repo.findUnitBySymbol(symbol);
        if (!existing) {
          const entity = UnitDefinitionEntity.create({
            category,
            name: symbol,
            symbol,
            baseUnit: info.base,
            factor: def.factor,
            offset: def.offset ?? 0,
          });
          await this.repo.saveUnit(entity);
          count++;
        }
      }
    }
    return count;
  }
}
