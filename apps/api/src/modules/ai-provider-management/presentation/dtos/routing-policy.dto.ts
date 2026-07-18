import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  IsInt,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateRoutingPolicyDto {
  @ApiProperty({ description: 'Policy name', example: 'production-routing' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Routing policy type',
    enum: [
      'manual',
      'priority',
      'round_robin',
      'least_latency',
      'lowest_cost',
      'highest_quality',
      'random',
      'weighted',
      'capability_based',
      'fallback_chain',
    ],
  })
  @IsString()
  @IsNotEmpty()
  policyType!: string;

  @ApiPropertyOptional({ description: 'Policy configuration' })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Enable policy', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Workspace ID for scoped policies' })
  @IsOptional()
  @IsString()
  workspaceId?: string;

  @ApiPropertyOptional({ description: 'Feature flag name' })
  @IsOptional()
  @IsString()
  featureFlag?: string;

  @ApiPropertyOptional({ description: 'Routing rules' })
  @IsOptional()
  @IsArray()
  rules?: RoutingRuleDto[];
}

export class RoutingRuleDto {
  @ApiProperty({ description: 'Provider ID' })
  @IsString()
  @IsNotEmpty()
  providerId!: string;

  @ApiPropertyOptional({ description: 'Model ID (optional)' })
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiProperty({ description: 'Priority (lower = preferred)', default: 0 })
  @IsInt()
  @Min(0)
  priority!: number;

  @ApiProperty({ description: 'Weight for weighted routing', default: 1.0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weight!: number;

  @ApiPropertyOptional({ description: 'Routing conditions' })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;
}
