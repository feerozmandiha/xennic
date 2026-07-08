import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GraphSearchService } from '../../application/services/graph-search.service.js';

@ApiTags('knowledge-intelligence')
@ApiBearerAuth('JWT-auth')
@Controller('knowledge-intelligence')
export class GraphSearchController {
  constructor(private readonly graphSearchService: GraphSearchService) {}

  @Get('search/graph')
  @ApiOperation({ summary: 'Semantic search over the knowledge graph' })
  async searchGraph(@Request() req: any, @Query('query') query: string) {
    const results = await this.graphSearchService.semanticSearch(req.user?.workspaceId, query);
    return { success: true, data: results };
  }

  @Get('search/related/:nodeId')
  @ApiOperation({ summary: 'Find related documents via graph traversal' })
  async relatedDocuments(@Param('nodeId') nodeId: string, @Query('limit') limit = 10) {
    const results = await this.graphSearchService.relatedDocuments(nodeId, limit);
    return { success: true, data: results };
  }
}
