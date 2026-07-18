import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsObject,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateProviderDto {
  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  displayName?: string;

  @ApiPropertyOptional({ description: 'Base URL override' })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional({ description: 'Organization ID' })
  @IsOptional()
  @IsString()
  orgId?: string;

  @ApiPropertyOptional({ description: 'New API key' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'Priority (lower = preferred)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  priority?: number;

  @ApiPropertyOptional({ description: 'Routing weight' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultWeight?: number;

  @ApiPropertyOptional({ description: 'Visibility' })
  @IsOptional()
  @IsString()
  visibility?: string;

  @ApiPropertyOptional({ description: 'Enable/disable provider' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Custom HTTP headers' })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Requests per minute' })
  @IsOptional()
  @IsInt()
  @Min(1)
  requestsPerMin?: number;

  @ApiPropertyOptional({ description: 'Tokens per minute' })
  @IsOptional()
  @IsInt()
  @Min(1)
  tokensPerMin?: number;

  @ApiPropertyOptional({ description: 'Max concurrent requests' })
  @IsOptional()
  @IsInt()
  @Min(1)
  concurrentMax?: number;
}
