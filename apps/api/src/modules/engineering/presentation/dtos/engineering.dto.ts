import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsObject, IsOptional, IsUUID, IsEnum,
} from 'class-validator';
import type { CalculationEntity } from '../../domain/entities/calculation.entity.js';

// ─── Calculation Type Enum (همه type های پشتیبانی‌شده) ──────────────────────

export const SUPPORTED_CALCULATION_TYPES = [
  'BASIC-001', 'BASIC-002', 'BASIC-003', 'BASIC-004', 'BASIC-005',
  'CABLE-001', 'CABLE-002', 'CABLE-003', 'CABLE-004', 'CABLE-005',
  'TRF-001',   'TRF-002',   'TRF-003',   'TRF-004',   'TRF-005',
  // Protection
  'PROT-001',  'PROT-002',  'PROT-004',  'PROT-005',
  'SC-001',    'GND-001',   'ARC-001',
  // Power Quality
  'PQ-001', 'PQ-002', 'PQ-003', 'PQ-004', 'PQ-005', 'PQ-006',
  'CAP-001',
  // Power System Studies
  'PS-001', 'PS-002', 'PS-003', 'PS-004',
  // Switchgear & Lighting
  'SWT-001',
  'LIGHT-001', 'LIGHT-002',
  // Grounding
  'GND-002',
  // Renewable & Motors
  'MOT-002',
  'BATTERY-002',
  'SOLAR-002', 'SOLAR-003',
  'BAT-BU-001',
  // Power Factor Correction
  'PFC-001',
  // Harmonic
  'HARM-001',
  // Economics
  'ECO-001', 'ECO-002', 'ECO-003',
] as const;

export type CalculationType = typeof SUPPORTED_CALCULATION_TYPES[number];

// ─── Request DTO ─────────────────────────────────────────────────────────────

export class RunCalculationDto {
  @ApiProperty({
    enum: SUPPORTED_CALCULATION_TYPES,
    example: 'BASIC-001',
    description: 'Calculation type code (e.g. BASIC-001 = Ohm\'s Law)',
  })
  @IsEnum(SUPPORTED_CALCULATION_TYPES)
  type!: CalculationType;

  @ApiProperty({
    example: { current_a: 10.0, resistance_ohm: 23.0 },
    description: 'Calculation inputs — structure depends on calculation type',
  })
  @IsObject()
  @IsNotEmpty()
  inputs!: Record<string, unknown>;

  @ApiProperty({
    example: 'project-uuid',
    description: 'Optional project ID to associate the calculation with',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class CalculationResponseDto {
  @ApiProperty({ description: 'Calculation record ID (UUIDv7)' })
  id!: string;

  @ApiProperty() workspaceId!: string;
  @ApiProperty({ nullable: true }) projectId!: string | null;
  @ApiProperty() userId!: string;
  @ApiProperty({ example: 'BASIC-001' }) type!: string;
  @ApiProperty({ example: '1.0' }) version!: string;
  @ApiProperty({ example: { current_a: 10 } }) inputs!: Record<string, unknown>;
  @ApiProperty({ example: { voltage_v: 230 } }) results!: Record<string, unknown>;
  @ApiProperty() engineVersion!: string;
  @ApiProperty() standardVersion!: string;
  @ApiProperty({ example: 42, description: 'Execution time in milliseconds' })
  durationMs!: number;
  @ApiProperty() createdAt!: Date;

  static fromEntity(c: CalculationEntity): CalculationResponseDto {
    const dto            = new CalculationResponseDto();
    dto.id               = c.id;
    dto.workspaceId      = c.workspaceId;
    dto.projectId        = c.projectId;
    dto.userId           = c.userId;
    dto.type             = c.type;
    dto.version          = c.version;
    dto.inputs           = c.inputs;
    dto.results          = c.results;
    dto.engineVersion    = c.engineVersion;
    dto.standardVersion  = c.standardVersion;
    dto.durationMs       = c.durationMs;
    dto.createdAt        = c.createdAt;
    return dto;
  }
}

export class CalculationResultDto {
  @ApiProperty({ description: 'Saved calculation record' })
  calculation!: CalculationResponseDto;

  @ApiProperty({ description: 'Full result from engineering engine' })
  result!: Record<string, unknown>;
}
