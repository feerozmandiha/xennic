import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional, IsBoolean } from 'class-validator';

export class RunCalculationDto {
  @ApiProperty({ description: 'Calculation definition slug or ID', example: 'voltage-drop' })
  @IsString()
  @IsNotEmpty()
  definitionId!: string;

  @ApiProperty({ description: 'Calculation inputs key-value pairs', example: { voltage: 400, current: 100, length: 50, cableSize: '16mm²' } })
  @IsObject()
  inputs!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Only validate inputs, do not execute' })
  @IsOptional()
  @IsBoolean()
  validateOnly?: boolean;

  @ApiPropertyOptional({ description: 'Skip AI review' })
  @IsOptional()
  @IsBoolean()
  skipAiReview?: boolean;

  @ApiPropertyOptional({ description: 'Skip certificate generation' })
  @IsOptional()
  @IsBoolean()
  skipCertificate?: boolean;
}
