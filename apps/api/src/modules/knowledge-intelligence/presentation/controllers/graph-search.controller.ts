import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { GraphWorkspaceGuard } from '../guards/graph-workspace.guard.js';
<<<<<<< ours
=======
import { GraphSearchQueryDto } from '../dtos/graph-query.dto.js';
>>>>>>> theirs
import { boundedInteger } from '../query-parameters.js';
import { GraphSearchService } from '../../application/services/graph-search.service.js';

@ApiTags('knowledge-intelligence')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard, GraphWorkspaceGuard)
@RequirePermissions('knowledge.read')
@Controller('knowledge-intelligence')
export class GraphSearchController {
  constructor(private readonly graphSearchService: GraphSearchService) {}

  @Get('search/graph')
  @ApiOperation({ summary: 'Semantic search over the knowledge graph' })
<<<<<<< ours
  async searchGraph(@Request() req: any, @Query('query') query: string) {
    const results = await this.graphSearchService.semanticSearch(req.workspaceId, query);
=======
  async searchGraph(@Request() req: any, @Query() query: GraphSearchQueryDto) {
    const results = await this.graphSearchService.semanticSearch(
      req.workspaceId,
      query.query.trim(),
    );
>>>>>>> theirs
    return { success: true, data: results };
  }

  @Get('search/related/:nodeId')
  @ApiOperation({ summary: 'Find related documents via graph traversal' })
  async relatedDocuments(@Param('nodeId') nodeId: string, @Query('limit') limit?: string) {
    const results = await this.graphSearchService.relatedDocuments(
      nodeId,
      boundedInteger(limit, 10, 1, 100),
    );
    return { success: true, data: results };
  }
}
