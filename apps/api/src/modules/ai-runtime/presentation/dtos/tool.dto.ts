import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ToolDefinition } from '../../domain/types/tool.types.js';

export class RegisterToolDto {
  @ApiProperty({ example: 'calculate_cable_size' })
  @IsString() @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'محاسبه سایز کابل بر اساس جریان و طول' })
  @IsString() @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  parameters?: { name: string; type: string; description: string; required: boolean }[];

  @ApiPropertyOptional({ default: ['engineering'] })
  @IsOptional()
  tags?: string[];
}

export class ToolResponseDto {
  name!: string;
  description!: string;
  status!: string;
  parameters!: { name: string; type: string; description: string; required: boolean }[];
  tags!: string[];

  static fromDefinition(def: ToolDefinition): ToolResponseDto {
    return {
      name:        def.name,
      description: def.description,
      status:      def.status,
      parameters:  def.parameters,
      tags:        def.tags,
    };
  }

  static fromList(defs: ToolDefinition[]): ToolResponseDto[] {
    return defs.map(d => ToolResponseDto.fromDefinition(d));
  }
}
