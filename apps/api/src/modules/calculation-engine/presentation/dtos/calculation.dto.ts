import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class CalculationQueryDto {
  @ApiProperty({ description: 'Formula ID to execute' })
  @IsString()
  formulaId!: string;

  @ApiProperty({ description: 'Input parameters for the formula' })
  @IsObject()
  inputs!: Record<string, number>;

  @ApiProperty({ description: 'Workspace ID' })
  @IsString()
  workspaceId!: string;

  @ApiPropertyOptional({ description: 'Decimal precision for results', default: 6 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(15)
  precision?: number;

  @ApiPropertyOptional({ description: 'Run sensitivity analysis', default: false })
  @IsOptional()
  @IsBoolean()
  sensitivityAnalysis?: boolean;

  @ApiPropertyOptional({ description: 'Run uncertainty analysis', default: false })
  @IsOptional()
  @IsBoolean()
  uncertaintyAnalysis?: boolean;

  @ApiPropertyOptional({ description: 'Sensitivity variation percent', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  sensitivityVariation?: number;

  @ApiPropertyOptional({ description: 'Confidence level for uncertainty', default: 0.95 })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(0.999)
  confidenceLevel?: number;
}

export class CalculationResponseDto {
  @ApiProperty({ default: true })
  success!: boolean;

  @ApiPropertyOptional()
  data?: unknown;

  @ApiPropertyOptional()
  error?: string;
}
