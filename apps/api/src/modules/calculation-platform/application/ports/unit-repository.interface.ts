import type { UnitDefinitionEntity } from '../../domain/entities/unit-definition.entity.js';
import type { UnitConversionEntity } from '../../domain/entities/unit-conversion.entity.js';

export interface IUnitRepository {
  findUnitById(id: string): Promise<UnitDefinitionEntity | null>;
  findUnitBySymbol(symbol: string): Promise<UnitDefinitionEntity | null>;
  findUnitsByCategory(category: string): Promise<UnitDefinitionEntity[]>;
  findAllUnits(): Promise<UnitDefinitionEntity[]>;
  saveUnit(unit: UnitDefinitionEntity): Promise<void>;

  findConversion(fromUnitId: string, toUnitId: string): Promise<UnitConversionEntity | null>;
  findConversionsByUnitId(unitId: string): Promise<UnitConversionEntity[]>;
  saveConversion(conversion: UnitConversionEntity): Promise<void>;
}

export const IUNIT_REPOSITORY = 'IUnitRepository';
