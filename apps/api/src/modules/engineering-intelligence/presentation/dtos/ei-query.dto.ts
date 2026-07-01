import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, Min, Max, MinLength } from 'class-validator';

export class EiQueryDto {
  @ApiProperty({ description: 'Engineering goal description' })
  @IsString()
  @MinLength(5)
  goal!: string;

  @ApiProperty({ description: 'Goal type', enum: ['calculation', 'selection', 'verification', 'analysis', 'estimation', 'compliance'] })
  @IsString()
  goalType!: 'calculation' | 'selection' | 'verification' | 'analysis' | 'estimation' | 'compliance';

  @ApiProperty({ description: 'Engineering domain' })
  @IsString()
  domain!: string;

  @ApiPropertyOptional({ description: 'Max reasoning steps', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  maxSteps?: number;

  @ApiPropertyOptional({ description: 'Timeout in ms' })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  timeout?: number;

  @ApiPropertyOptional({ description: 'Include generated report', default: true })
  @IsOptional()
  @IsBoolean()
  includeReport?: boolean;

  @ApiPropertyOptional({ description: 'Report format', default: 'markdown' })
  @IsOptional()
  @IsString()
  format?: 'markdown' | 'json' | 'pdf-ready' | 'machine';

  @ApiPropertyOptional({ description: 'Constraints', type: 'array', isArray: true })
  @IsOptional()
  @IsArray()
  constraints?: Array<{ type: string; operator: string; value: unknown; description: string }>;
}

export class EiResponseDto {
  @ApiProperty({ default: true })
  success!: boolean;

  @ApiProperty()
  data!: {
    executionId: string;
    traceId: string;
    decisions: unknown[];
    report?: unknown;
    audit: unknown;
    metrics: { totalDuration: number; stepCount: number; calculationCount: number; evidenceCount: number; confidence: number };
  };
}
