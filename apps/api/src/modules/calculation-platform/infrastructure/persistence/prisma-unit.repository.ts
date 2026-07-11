import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IUnitRepository } from '../../application/ports/unit-repository.interface.js';
import { UnitDefinitionEntity } from '../../domain/entities/unit-definition.entity.js';
import { UnitConversionEntity } from '../../domain/entities/unit-conversion.entity.js';

@Injectable()
export class PrismaUnitRepository implements IUnitRepository {
  private readonly logger = new Logger(PrismaUnitRepository.name);

  async findUnitById(id: string): Promise<UnitDefinitionEntity | null> {
    const row = await prisma.unit_definitions.findUnique({ where: { id } });
    return row ? UnitDefinitionEntity.reconstitute(row) : null;
  }

  async findUnitBySymbol(symbol: string): Promise<UnitDefinitionEntity | null> {
    const row = await prisma.unit_definitions.findFirst({ where: { symbol } });
    return row ? UnitDefinitionEntity.reconstitute(row) : null;
  }

  async findUnitsByCategory(category: string): Promise<UnitDefinitionEntity[]> {
    const rows = await prisma.unit_definitions.findMany({ where: { category } });
    return rows.map(UnitDefinitionEntity.reconstitute);
  }

  async findAllUnits(): Promise<UnitDefinitionEntity[]> {
    const rows = await prisma.unit_definitions.findMany();
    return rows.map(UnitDefinitionEntity.reconstitute);
  }

  async saveUnit(unit: UnitDefinitionEntity): Promise<void> {
    await prisma.unit_definitions.upsert({
      where: { id: unit.id },
      update: {
        name: unit.name,
        symbol: unit.symbol,
        factor: unit.factor,
        offset: unit.offset,
        description: unit.description,
      },
      create: {
        id: unit.id,
        category: unit.category,
        name: unit.name,
        symbol: unit.symbol,
        base_unit: unit.baseUnit,
        factor: unit.factor,
        offset: unit.offset,
        description: unit.description,
        created_at: unit.createdAt,
      },
    });
  }

  async findConversion(fromUnitId: string, toUnitId: string): Promise<UnitConversionEntity | null> {
    const row = await prisma.unit_conversions.findFirst({
      where: { from_unit_id: fromUnitId, to_unit_id: toUnitId },
    });
    return row ? UnitConversionEntity.reconstitute(row) : null;
  }

  async findConversionsByUnitId(unitId: string): Promise<UnitConversionEntity[]> {
    const rows = await prisma.unit_conversions.findMany({
      where: { OR: [{ from_unit_id: unitId }, { to_unit_id: unitId }] },
    });
    return rows.map(UnitConversionEntity.reconstitute);
  }

  async saveConversion(conversion: UnitConversionEntity): Promise<void> {
    await prisma.unit_conversions.upsert({
      where: { id: conversion.id },
      update: { factor: conversion.factor, offset: conversion.offset, formula: conversion.formula },
      create: {
        id: conversion.id,
        from_unit_id: conversion.fromUnitId,
        to_unit_id: conversion.toUnitId,
        factor: conversion.factor,
        offset: conversion.offset,
        formula: conversion.formula,
        created_at: conversion.createdAt,
      },
    });
  }
}
