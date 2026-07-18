import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CitationExpansionService } from '../../application/services/citation-expansion.service.js';

@ApiTags('knowledge-intelligence')
@ApiBearerAuth('JWT-auth')
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
      req.user?.workspaceId,
      sourceId,
      targetId,
    );
    return { success: true, data: graph };
  }

  @Get('citations/expand/:nodeId')
  @ApiOperation({ summary: 'Expand citations from a node' })
  async expandCitations(@Param('nodeId') nodeId: string, @Query('maxDepth') maxDepth = 3) {
    const expanded = await this.citationExpansionService.expand(nodeId, maxDepth);
    return { success: true, data: expanded };
  }
}
