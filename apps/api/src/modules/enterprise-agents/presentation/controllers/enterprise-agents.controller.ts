import {
  Controller, Post, Get, Body, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { AgentOrchestratorService } from '../../application/services/agent-orchestrator.service.js';
import { AgentRegistry } from '../../application/services/agent-registry.service.js';
import { AgentQueryDto, AgentResponseDto } from '../dtos/agent.dto.js';
import type { AgentQuery } from '../../domain/types/agent.types.js';

@ApiTags('enterprise-agents')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('enterprise-agents')
export class EnterpriseAgentsController {
  constructor(
    private readonly orchestrator: AgentOrchestratorService,
    private readonly registry: AgentRegistry,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Execute an enterprise agent',
    description: 'Routes a query to the specified AI agent, executes relevant tools, and returns analysis with safety validation.',
  })
  @ApiResponse({ status: 200, description: 'Agent execution result' })
  async execute(@Req() req: any, @Body() dto: AgentQueryDto) {
    const query: AgentQuery = {
      query: dto.query,
      agentSlug: dto.agentSlug,
      sessionId: dto.sessionId,
      workspaceId: req.workspaceId || dto.workspaceId,
      context: dto.context,
      options: {
        maxSteps: dto.maxSteps ?? 50,
        includeMemory: dto.includeMemory ?? true,
        timeout: dto.timeout,
      },
    };
    const result = await this.orchestrator.execute(query);
    return { success: result.success, data: result.data, error: result.error };
  }

  @Get('agents')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List available agents' })
  @ApiResponse({ status: 200, description: 'List of registered agents' })
  async listAgents() {
    const agents = this.registry.listActive();
    return {
      success: true,
      data: agents.map((a) => ({
        name: a.name, slug: a.slug, description: a.description, type: a.type,
        capabilities: a.capabilities.map((c) => ({ type: c.type, description: c.description })),
        version: a.version,
      })),
    };
  }
}
