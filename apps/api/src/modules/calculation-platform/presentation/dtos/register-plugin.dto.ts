import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class RegisterPluginDto {
  @ApiProperty({ description: 'Unique plugin slug', example: 'voltage-drop' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ description: 'Plugin display name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Plugin description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Plugin version', example: '1.0.0' })
  @IsString()
  @IsNotEmpty()
  version!: string;

  @ApiPropertyOptional({ description: 'Enable immediately' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Plugin configuration' })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
