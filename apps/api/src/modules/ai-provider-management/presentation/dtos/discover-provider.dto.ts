import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DiscoverProviderDto {
  @ApiProperty({ description: 'API key' })
  @IsString()
  @IsNotEmpty()
  apiKey!: string;

  @ApiProperty({ description: 'Provider type', example: 'openai' })
  @IsString()
  @IsNotEmpty()
  providerType!: string;

  @ApiPropertyOptional({ description: 'Base URL override' })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional({ description: 'Organization ID' })
  @IsOptional()
  @IsString()
  orgId?: string;
}
