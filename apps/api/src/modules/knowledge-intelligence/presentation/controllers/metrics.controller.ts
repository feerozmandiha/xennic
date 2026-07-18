import { Controller, Get, Post, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KnowledgeMetricsService } from '../../application/services/knowledge-metrics.service.js';
import { KnowledgeAuthorityService } from '../../application/services/knowledge-authority.service.js';
import { KnowledgeCompletenessService } from '../../application/services/knowledge-completeness.service.js';
import { KnowledgeFreshnessService } from '../../application/services/knowledge-freshness.service.js';
import { KnowledgeConfidenceService } from '../../application/services/knowledge-confidence.service.js';

@ApiTags('knowledge-intelligence')
@ApiBearerAuth('JWT-auth')
@Controller('knowledge-intelligence')
export class MetricsController {
  constructor(
    private readonly metricsService: KnowledgeMetricsService,
    private readonly authorityService: KnowledgeAuthorityService,
    private readonly completenessService: KnowledgeCompletenessService,
    private readonly freshnessService: KnowledgeFreshnessService,
    private readonly confidenceService: KnowledgeConfidenceService,
  ) {}

  @Get('metrics/:nodeId')
  @ApiOperation({ summary: 'Get metrics for a graph node' })
  async getMetrics(@Param('nodeId') nodeId: string) {
    const metrics = await this.metricsService.getMetrics(nodeId);
    return { success: true, data: metrics };
  }

  @Post('metrics/:nodeId/access')
  @ApiOperation({ summary: 'Record access for a node' })
  async recordAccess(@Param('nodeId') nodeId: string) {
    await this.metricsService.recordAccess(nodeId);
    return { success: true };
  }

  @Get('metrics/workspace/top/:metric')
  @ApiOperation({ summary: 'Get top nodes by metric for workspace' })
  async topNodes(@Request() req: any, @Param('metric') metric: string, @Query('limit') limit = 10) {
    const top = await this.metricsService.getTopNodes(req.user?.workspaceId, metric, limit);
    return { success: true, data: top };
  }

  @Get('metrics/workspace/authority')
  @ApiOperation({ summary: 'Rank nodes by authority' })
  async rankAuthority(@Request() req: any, @Query('limit') limit = 20) {
    const ranked = await this.authorityService.rankNodes(req.user?.workspaceId, limit);
    return { success: true, data: ranked };
  }

  @Get('metrics/workspace/completeness')
  @ApiOperation({ summary: 'Analyze workspace knowledge completeness' })
  async analyzeCompleteness(@Request() req: any) {
    const analysis = await this.completenessService.analyzeWorkspaceCompleteness(
      req.user?.workspaceId,
    );
    return { success: true, data: analysis };
  }

  @Get('metrics/workspace/freshness')
  @ApiOperation({ summary: 'Refresh freshness scores for stale nodes' })
  async refreshFreshness(@Request() req: any, @Query('thresholdDays') thresholdDays = 30) {
    const stale = await this.freshnessService.refreshStaleNodes(
      req.user?.workspaceId,
      thresholdDays,
    );
    return { success: true, data: stale };
  }

  @Post('metrics/workspace/confidence/recompute')
  @ApiOperation({ summary: 'Batch recompute confidence scores' })
  async recomputeConfidence(@Request() req: any) {
    const results = await this.confidenceService.batchComputeConfidence(req.user?.workspaceId);
    return { success: true, data: { computed: results.length, results: results.slice(0, 100) } };
  }
}
