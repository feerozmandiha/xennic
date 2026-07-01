import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsNumber, IsBoolean, Min, Max, MinLength } from 'class-validator';

export class AgentQueryDto {
  @ApiProperty({ description: 'Query or request for the agent' })
  @IsString()
  @MinLength(2)
  query!: string;

  @ApiProperty({ description: 'Agent slug (e.g. electrical-engineer, solar-consultant)', example: 'electrical-engineer' })
  @IsString()
  agentSlug!: string;

  @ApiPropertyOptional({ description: 'Existing session ID for continuing conversation' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ description: 'Workspace ID' })
  @IsString()
  workspaceId!: string;

  @ApiPropertyOptional({ description: 'Additional context parameters' })
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Max execution steps', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  maxSteps?: number;

  @ApiPropertyOptional({ description: 'Include memory context', default: true })
  @IsOptional()
  @IsBoolean()
  includeMemory?: boolean;

  @ApiPropertyOptional({ description: 'Timeout in ms' })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  timeout?: number;
}

export class AgentResponseDto {
  @ApiProperty({ default: true })
  success!: boolean;

  @ApiPropertyOptional()
  data?: {
    response: string;
    agentSlug: string;
    agentName: string;
    sessionId: string;
    steps?: unknown[];
    toolsUsed?: unknown[];
    memoryUsed?: unknown[];
    safetyCheck?: unknown;
    metrics: { totalTimeMs: number; stepsExecuted: number; toolsCalled: number; memoryRetrieved: number; safetyScore: number };
  };

  @ApiPropertyOptional()
  error?: string;
}
