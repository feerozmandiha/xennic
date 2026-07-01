import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { SearchService } from '../../application/services/search.service.js';
import { SearchQueryDto, SearchResponseDto } from '../dtos/search.dto.js';

@ApiTags('knowledge-factory')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('knowledge-factory')
export class KnowledgeSearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Hybrid search across ingested knowledge documents',
    description: 'Performs hybrid (vector + keyword) search with RRF ranking and citation generation.',
  })
  @ApiResponse({ status: 200, description: 'Search results returned', type: SearchResponseDto })
  async search(@Req() req: any, @Query() dto: SearchQueryDto) {
    const result = await this.searchService.search(req.workspaceId, dto.query, {
      types: dto.types,
      limit: dto.limit,
      offset: dto.offset,
      minScore: dto.minScore,
    });

    return {
      success: true,
      data: SearchResponseDto.fromDomain(result),
    };
  }
}
