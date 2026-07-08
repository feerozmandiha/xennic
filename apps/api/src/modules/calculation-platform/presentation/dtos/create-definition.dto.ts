import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, MinLength, MaxLength } from 'class-validator';

export class CreateDefinitionDto {
  @ApiProperty({ description: 'Category ID', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ description: 'Unique slug identifier', example: 'voltage-drop' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  slug!: string;

  @ApiProperty({ description: 'Display name', example: 'Voltage Drop' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Engineering standard code', example: 'IEC-60287' })
  @IsOptional()
  @IsString()
  standard?: string;

  @ApiPropertyOptional({ description: 'Standard reference' })
  @IsOptional()
  @IsString()
  standardRef?: string;

  @ApiPropertyOptional({ description: 'Enable AI review' })
  @IsOptional()
  @IsBoolean()
  aiReview?: boolean;

  @ApiPropertyOptional({ description: 'Generate certificates' })
  @IsOptional()
  @IsBoolean()
  certificate?: boolean;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
