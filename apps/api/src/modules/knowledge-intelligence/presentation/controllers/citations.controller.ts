import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { GraphWorkspaceGuard } from '../guards/graph-workspace.guard.js';
import { boundedInteger } from '../query-parameters.js';
import { CitationExpansionService } from '../../application/services/citation-expansion.service.js';

@ApiTags('knowledge-intelligence')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard, GraphWorkspaceGuard)
@RequirePermissions('knowledge.read')
@Controller('knowledge-intelligence')
export class CitationsController {
  constructor(private readonly citationExpansionService: CitationExpansionService) {}

  @Get('citations/graph')
  @ApiOperation({ summary: 'Get citation graph visualization data' })
  async getCitationGraph(
    @Request() req: any,
    @Query('sourceId') sourceId?: string,
    @Query('targetId') targetId?: string,
  ) {
    const graph = await this.citationExpansionService.getCitationGraph(
      req.workspaceId,
      sourceId?.trim() || undefined,
      targetId?.trim() || undefined,
    );
    return { success: true, data: graph };
  }

  @Get('citations/expand/:nodeId')
  @ApiOperation({ summary: 'Expand citations from a node' })
  async expandCitations(
    @Request() req: any,
    @Param('nodeId') nodeId: string,
    @Query('maxDepth') maxDepth?: string,
  ) {
    const expanded = await this.citationExpansionService.expand(
      req.workspaceId,
      nodeId,
      boundedInteger(maxDepth, 3, 1, 10),
    );
    return { success: true, data: expanded };
  }
}
