import {
  Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { EiOrchestratorService } from '../../application/services/ei-orchestrator.service.js';
import { EiQueryDto, EiResponseDto } from '../dtos/ei-query.dto.js';
import type { IntelligenceQuery } from '../../domain/types/ei.types.js';

@ApiTags('engineering-intelligence')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('engineering-intelligence')
export class EngineeringIntelligenceController {
  constructor(private readonly orchestrator: EiOrchestratorService) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Execute engineering intelligence workflow',
    description: 'Decomposes a goal, plans execution, runs reasoning steps, and produces decisions with audit trail.',
  })
  @ApiResponse({ status: 200, description: 'Execution result with decisions and audit' })
  async execute(@Req() req: any, @Body() dto: EiQueryDto) {
    const query: IntelligenceQuery = {
      goal: dto.goal,
      goalType: dto.goalType,
      workspaceId: req.workspaceId,
      domain: dto.domain,
      constraints: dto.constraints as any,
      options: {
        maxSteps: dto.maxSteps ?? 50,
        timeout: dto.timeout,
        includeReport: dto.includeReport ?? true,
        format: dto.format,
      },
    };
    const result = await this.orchestrator.execute(query);
    return { success: true, data: result };
  }
}
