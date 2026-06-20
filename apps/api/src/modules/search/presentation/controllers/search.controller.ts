import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { SearchService } from '../../application/services/search.service.js';
import { SearchResultDto } from '../dtos/search.dto.js';
import type { SearchResultType } from '../../domain/entities/search-result.entity.js';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across all domains' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (min 2 characters)' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by type (can repeat)', isArray: true })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  async search(
    @Query('q') query: string,
    @Query('type') types?: string | string[],
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: any,
  ): Promise<{
    success: boolean;
    data: SearchResultDto[];
    meta?: { total: number; page: number; limit: number };
  }> {
    const workspaceId = req?.workspaceId ?? req?.user?.workspaceId;
    const typeArray = types
      ? (Array.isArray(types) ? types : [types]).filter((t): t is SearchResultType =>
          ['project', 'standard', 'conversation', 'article', 'file', 'notification'].includes(t))
      : undefined;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 25));

    const results = await this.searchService.searchPaginated({
      query,
      workspaceId,
      types: typeArray,
      page: pageNum,
      limit: limitNum,
    });

    return {
      success: true,
      data: results.items.map(SearchResultDto.fromEntity),
      meta: { total: results.total, page: pageNum, limit: limitNum },
    };
  }
}
