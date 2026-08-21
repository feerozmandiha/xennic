import { Controller, Get, Post, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { GraphWorkspaceGuard } from '../guards/graph-workspace.guard.js';
import { boundedNumber } from '../query-parameters.js';
import { KnowledgeClusteringService } from '../../application/services/knowledge-clustering.service.js';
import { DuplicateDetectionService } from '../../application/services/duplicate-detection.service.js';

@ApiTags('knowledge-intelligence')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard, GraphWorkspaceGuard)
@RequirePermissions('knowledge.read')
@Controller('knowledge-intelligence')
export class ClustersController {
  constructor(
    private readonly clusteringService: KnowledgeClusteringService,
    private readonly duplicateService: DuplicateDetectionService,
  ) {}

  @Post('clusters/compute')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Auto-compute knowledge clusters' })
  async computeClusters(@Request() req: any, @Query('threshold') threshold?: string) {
    const clusters = await this.clusteringService.computeClusters(
      req.workspaceId,
      boundedNumber(threshold, 0.6, 0, 1),
    );
    return { success: true, data: clusters };
  }

  @Get('clusters')
  @ApiOperation({ summary: 'List clusters for workspace' })
  async listClusters(@Request() req: any) {
    const clusters = await this.clusteringService.listClusters(req.workspaceId);
    return { success: true, data: clusters };
  }

  @Get('duplicates/:nodeId')
  @ApiOperation({ summary: 'Find duplicates and near-duplicates for a node' })
  async findDuplicates(@Request() req: any, @Param('nodeId') nodeId: string) {
    const analysis = await this.duplicateService.analyzeDuplicateCandidates(
      nodeId,
      req.workspaceId,
    );
    return { success: true, data: analysis };
  }
}
