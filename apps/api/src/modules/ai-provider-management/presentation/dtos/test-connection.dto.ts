import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TestConnectionDto {
  @ApiProperty({ description: 'API key to test' })
  @IsString()
  @IsNotEmpty()
  apiKey!: string;

  @ApiPropertyOptional({ description: 'Provider type', example: 'openai' })
  @IsOptional()
  @IsString()
  providerType?: string;

  @ApiPropertyOptional({ description: 'Base URL' })
  @IsOptional()
  @IsString()
  baseUrl?: string;
}
