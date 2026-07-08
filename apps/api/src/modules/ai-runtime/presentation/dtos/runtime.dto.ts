import { IsString, IsNotEmpty, IsOptional, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ExecutionResult } from '../../domain/types/execution.types.js';

export class ExecuteDto {
  @ApiProperty({ example: 'محاسبه جریان نامی موتور' })
  @IsString() @IsNotEmpty() @MaxLength(4000)
  input!: string;

  @ApiPropertyOptional({ example: { conversationId: 'uuid' } })
  @IsOptional() @IsObject()
  metadata?: Record<string, unknown>;
}

export class ExecutionResultDto {
  success!: boolean;
  output!: unknown;
  error!: string | null;
  totalDurationMs!: number;
  stages!: { stage: string; durationMs: number }[];

  static fromResult(result: ExecutionResult): ExecutionResultDto {
    return {
      success:         result.success,
      output:          result.output,
      error:           result.error,
      totalDurationMs: result.totalDurationMs,
      stages:          result.stages.map(s => ({ stage: s.stage, durationMs: s.durationMs })),
    };
  }
}

export class RuntimeInfoDto {
  version!: string;
  sessionCount!: number;
  toolCount!: number;
  templateCount!: number;
  uptimeMs!: number;

  static create(data: {
    version: string;
    sessionCount: number;
    toolCount: number;
    templateCount: number;
    uptimeMs: number;
  }): RuntimeInfoDto {
    return { ...data };
  }
}
