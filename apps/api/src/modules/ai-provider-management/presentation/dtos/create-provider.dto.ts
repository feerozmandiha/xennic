import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsObject,
  Min,
  Max,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateProviderDto {
  @ApiProperty({ description: 'Unique provider name', example: 'my-openai' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Human-readable display name', example: 'My OpenAI Provider' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  displayName!: string;

  @ApiProperty({
    description: 'Provider type',
    example: 'openai',
    enum: [
      'openai',
      'anthropic',
      'gemini',
      'mistral',
      'groq',
      'openrouter',
      'together',
      'deepseek',
      'cohere',
      'voyageai',
      'ollama',
      'lm_studio',
      'azure_openai',
      'openai_compatible',
      'custom',
    ],
  })
  @IsString()
  @IsNotEmpty()
  providerType!: string;

  @ApiPropertyOptional({ description: 'API key for this provider' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'Base URL override', example: 'https://api.openai.com/v1' })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional({ description: 'Organization ID' })
  @IsOptional()
  @IsString()
  orgId?: string;

  @ApiPropertyOptional({ description: 'Priority (lower = preferred)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  priority?: number;

  @ApiPropertyOptional({ description: 'Routing weight', default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultWeight?: number;

  @ApiPropertyOptional({
    description: 'Visibility',
    default: 'global',
    enum: ['global', 'admin_only', 'workspace'],
  })
  @IsOptional()
  @IsString()
  visibility?: string;

  @ApiPropertyOptional({ description: 'Custom HTTP headers as key-value pairs' })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Requests per minute limit', default: 60 })
  @IsOptional()
  @IsInt()
  @Min(1)
  requestsPerMin?: number;

  @ApiPropertyOptional({ description: 'Tokens per minute limit', default: 100000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  tokensPerMin?: number;

  @ApiPropertyOptional({ description: 'Max concurrent requests', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  concurrentMax?: number;

  @ApiPropertyOptional({ description: 'Run discovery after creation', default: true })
  @IsOptional()
  @IsBoolean()
  discover?: boolean;
}
