import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { KnowledgeService } from '../../application/services/knowledge.service.js';
import { KnowledgeResponseDto } from '../dtos/knowledge.dto.js';

@ApiTags('knowledge-public')
@Controller('public/knowledge')
export class PublicKnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  @ApiOperation({ summary: 'Public list published articles', description: 'Returns published knowledge articles with public visibility.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'locale', required: false, enum: ['fa', 'en'], description: 'Filter by language' })
  @ApiResponse({ status: 200, description: 'Articles retrieved' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ) {
    const result = await this.knowledgeService.findPublished(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      locale,
    );
    return {
      success: true,
      data: KnowledgeResponseDto.fromEntities(result.data),
      meta: result.meta,
    };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Public get article by slug', description: 'Returns a published article by slug.' })
  @ApiParam({ name: 'slug', description: 'Article slug' })
  @ApiResponse({ status: 200, description: 'Article found' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findBySlug(@Param('slug') slug: string) {
    const entity = await this.knowledgeService.findPublishedBySlug(slug);
    return { success: true, data: KnowledgeResponseDto.fromEntity(entity) };
  }
}
