import { Controller, Get, Post, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KnowledgeClusteringService } from '../../application/services/knowledge-clustering.service.js';
import { DuplicateDetectionService } from '../../application/services/duplicate-detection.service.js';

@ApiTags('knowledge-intelligence')
@ApiBearerAuth('JWT-auth')
@Controller('knowledge-intelligence')
export class ClustersController {
  constructor(
    private readonly clusteringService: KnowledgeClusteringService,
    private readonly duplicateService: DuplicateDetectionService,
  ) {}

  @Post('clusters/compute')
  @ApiOperation({ summary: 'Auto-compute knowledge clusters' })
  async computeClusters(@Request() req: any, @Query('threshold') threshold = 0.6) {
    const clusters = await this.clusteringService.computeClusters(req.user?.workspaceId, threshold);
    return { success: true, data: clusters };
  }

  @Get('clusters')
  @ApiOperation({ summary: 'List clusters for workspace' })
  async listClusters(@Request() req: any, @Query('workspaceId') workspaceId?: string) {
    const id = workspaceId || req.user?.workspaceId;
    const clusters = await this.clusteringService['clusterRepo'].findByWorkspace(id);
    return { success: true, data: clusters };
  }

  @Get('duplicates/:nodeId')
  @ApiOperation({ summary: 'Find duplicates and near-duplicates for a node' })
  async findDuplicates(@Request() req: any, @Param('nodeId') nodeId: string) {
    const analysis = await this.duplicateService.analyzeDuplicateCandidates(
      nodeId,
      req.user?.workspaceId,
    );
    return { success: true, data: analysis };
  }
}
