import {
  Controller, Get, Post, Body, Param, Query,
  Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard }       from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard }     from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { ArticlesService }    from '../../application/services/articles.service.js';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly svc: ArticlesService) {}

  // GET /articles — عمومی (نیاز به احراز هویت ندارد)
  @Get()
  @ApiOperation({ summary: 'لیست مقالات مهندسی برق' })
  @ApiQuery({ name: 'page',     required: false, type: Number })
  @ApiQuery({ name: 'limit',    required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search',   required: false, type: String })
  async findAll(
    @Query('page')     page?:     string,
    @Query('limit')    limit?:    string,
    @Query('category') category?: string,
    @Query('search')   search?:   string,
  ) {
    const result = await this.svc.findAll({
      page:     page  ? parseInt(page,  10) : 1,
      limit:    limit ? parseInt(limit, 10) : 12,
      category: category || undefined,
      search:   search   || undefined,
    });
    return { success: true, data: result.data, meta: { total: result.total } };
  }

  // GET /articles/:slug — عمومی
  @Get(':slug')
  @ApiOperation({ summary: 'دریافت مقاله با slug' })
  @ApiParam({ name: 'slug', type: String })
  async findOne(@Param('slug') slug: string) {
    const article = await this.svc.findBySlug(slug);
    return { success: true, data: article };
  }

  // POST /articles — نیاز به احراز هویت
  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ایجاد مقاله جدید' })
  async create(@Body() dto: any, @Req() req: any) {
    const article = await this.svc.create(dto, req.user.userId);
    return { success: true, data: article };
  }

  // POST /articles/:slug/like — نیاز به احراز هویت
  @Post(':slug/like')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'لایک مقاله' })
  async like(@Param('slug') slug: string) {
    return this.svc.like(slug);
  }
}
