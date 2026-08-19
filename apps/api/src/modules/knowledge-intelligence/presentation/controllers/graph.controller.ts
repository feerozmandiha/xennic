import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { GraphWorkspaceGuard } from '../guards/graph-workspace.guard.js';
import { boundedInteger } from '../query-parameters.js';
import { GraphTraversalService } from '../../application/services/graph-traversal.service.js';
import { KnowledgeProvenanceService } from '../../application/services/knowledge-provenance.service.js';
import { DependencyResolutionService } from '../../application/services/dependency-resolution.service.js';
import { ConflictDetectionService } from '../../application/services/conflict-detection.service.js';

@ApiTags('knowledge-intelligence')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard, GraphWorkspaceGuard)
@RequirePermissions('knowledge.read')
@Controller('knowledge-intelligence')
export class GraphController {
  constructor(
    private readonly traversalService: GraphTraversalService,
    private readonly provenanceService: KnowledgeProvenanceService,
    private readonly dependencyService: DependencyResolutionService,
    private readonly conflictService: ConflictDetectionService,
  ) {}

  @Get('graph/shortest-path/:sourceId/:targetId')
  @ApiOperation({ summary: 'Find shortest path between two graph nodes' })
  async shortestPath(
    @Request() req: any,
    @Param('sourceId') sourceId: string,
    @Param('targetId') targetId: string,
    @Query('maxDepth') maxDepth?: string,
  ) {
    const result = await this.traversalService.findShortestPath(
      sourceId,
      targetId,
      boundedInteger(maxDepth, 10, 1, 20),
    );
    return { success: true, data: result };
  }

  @Get('graph/neighbors/:nodeId')
  @ApiOperation({ summary: 'Get neighbors of a graph node' })
  async neighbors(
    @Request() req: any,
    @Param('nodeId') nodeId: string,
    @Query('direction') direction: 'in' | 'out' | 'both' = 'both',
    @Query('edgeType') edgeType?: string,
  ) {
    const neighbors = await this.traversalService.getNeighbors(nodeId, direction, edgeType);
    return { success: true, data: neighbors };
  }

  @Get('graph/subgraph')
  @ApiOperation({ summary: 'Get subgraph for a set of node IDs' })
  async subgraph(@Query('nodeIds') nodeIds: string) {
    const ids = nodeIds.split(',').filter(Boolean);
    const subgraph = await this.traversalService.getSubgraph(ids);
    return { success: true, data: subgraph };
  }

  @Get('graph/ancestors/:nodeId')
  @ApiOperation({ summary: 'Get all ancestors of a node' })
  async ancestors(
    @Request() req: any,
    @Param('nodeId') nodeId: string,
    @Query('maxDepth') maxDepth?: string,
  ) {
    const ancestors = await this.traversalService.getAncestors(
      nodeId,
      boundedInteger(maxDepth, 10, 1, 20),
    );
    return { success: true, data: ancestors };
  }

  @Get('graph/descendants/:nodeId')
  @ApiOperation({ summary: 'Get all descendants of a node' })
  async descendants(
    @Request() req: any,
    @Param('nodeId') nodeId: string,
    @Query('maxDepth') maxDepth?: string,
  ) {
    const descendants = await this.traversalService.getDescendants(
      nodeId,
      boundedInteger(maxDepth, 10, 1, 20),
    );
    return { success: true, data: descendants };
  }

  @Get('graph/provenance/:nodeId')
  @ApiOperation({ summary: 'Build provenance chain for a node' })
  async provenance(
    @Request() req: any,
    @Param('nodeId') nodeId: string,
    @Query('maxDepth') maxDepth?: string,
  ) {
    const provenance = await this.provenanceService.buildProvenanceChain(
      nodeId,
      boundedInteger(maxDepth, 10, 1, 20),
    );
    return { success: true, data: provenance };
  }

  @Get('graph/dependencies/:nodeId')
  @ApiOperation({ summary: 'Resolve dependency tree for a node' })
  async resolveDependencies(@Param('nodeId') nodeId: string, @Query('maxDepth') maxDepth?: string) {
    const deps = await this.dependencyService.resolveFullDependencyGraph(
      nodeId,
      boundedInteger(maxDepth, 5, 1, 20),
    );
    return { success: true, data: deps };
  }

  @Get('graph/conflicts/:nodeId')
  @ApiOperation({ summary: 'Detect conflicts for a node' })
  async conflicts(@Request() req: any, @Param('nodeId') nodeId: string) {
    const superseded = await this.conflictService.detectSupersededConflicts(nodeId);
    const equivalents = await this.conflictService.detectEquivalentConflicts(nodeId);
    return {
      success: true,
      data: { superseded, equivalents },
    };
  }

  @Get('graph/connected-components')
  @ApiOperation({ summary: 'Find connected components in workspace graph' })
  async connectedComponents(@Request() req: any) {
    const workspaceId = req.workspaceId;
    const components = await this.traversalService.getConnectedComponents(workspaceId);
    return { success: true, data: { components, count: components.length } };
  }
}
