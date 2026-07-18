import { Controller, Get, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { HybridSearchService } from '../../application/services/hybrid-search.service.js';
import { SearchQueryDto } from '../../dto/search-query.dto.js';

@ApiTags('Knowledge Factory - Search')
@ApiBearerAuth()
@Controller('knowledge-factory/search')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SearchController {
  constructor(private readonly search: HybridSearchService) {}

  @Get('documents')
  @RequirePermissions('knowledge:read')
  @ApiOperation({ summary: 'Hybrid search (BM25 + vector) across processed documents' })
  async searchDocuments(@Request() req: any, @Query() query: SearchQueryDto) {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) throw new BadRequestException('Workspace ID required');

    const results = await this.search.search(query.q, workspaceId, {
      standard: query.standard,
      equipmentType: query.equipmentType,
      domain: query.domain,
      page: query.page,
      limit: query.limit,
    });

    return { success: true, data: results.results, meta: { total: results.total, query: query.q } };
  }

  @Get('suggestions')
  @RequirePermissions('knowledge:read')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiQuery({ name: 'q', required: true })
  async getSuggestions(@Request() req: any, @Query('q') query: string) {
    const workspaceId = req.user?.workspaceId;
    const results = await this.search.search(query, workspaceId, { limit: 5 });
    const suggestions = results.results.map((r) => r.text.slice(0, 80)).filter(Boolean);

    return { success: true, data: { suggestions, query } };
  }

  @Get('analytics')
  @RequirePermissions('knowledge:read')
  @ApiOperation({ summary: 'Get knowledge analytics' })
  async getAnalytics(@Request() req: any) {
    const workspaceId = req.user?.workspaceId;
    const searchResults = await this.search.search('', workspaceId, { limit: 1 });
    const documentsByStandard = new Map<string, number>();
    const documentsByDomain = new Map<string, number>();
    const documentsByStatus = new Map<string, number>();

    for (const result of searchResults.results) {
      const standard = result.metadata.standard || 'unknown';
      const equipmentType = result.metadata.equipmentType || 'general';
      const status = result.metadata.documentType || 'unknown';
      documentsByStandard.set(standard, (documentsByStandard.get(standard) || 0) + 1);
      documentsByDomain.set(equipmentType, (documentsByDomain.get(equipmentType) || 0) + 1);
      documentsByStatus.set(status, (documentsByStatus.get(status) || 0) + 1);
    }

    return {
      success: true,
      data: {
        totalDocuments: searchResults.total,
        publishedDocuments: searchResults.total,
        documentsByDomain: Object.fromEntries(documentsByDomain),
        documentsByStandard: Object.fromEntries(documentsByStandard),
        documentsByStatus: Object.fromEntries(documentsByStatus),
      },
    };
  }
}
