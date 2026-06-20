import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { prisma } from '@xennic/database';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../infrastructure/guards/admin.guard.js';
import { CreateTaxonomyItemDto, UpdateTaxonomyItemDto } from '../dtos/taxonomy-admin.dto.js';

const TAXONOMY_MODELS: Record<string, string> = {
  category:   'categories',
  topic:      'topics',
  tag:        'tags',
  discipline: 'disciplines',
  audience:   'audiences',
} as const;

const VALID_TYPES = ['category', 'topic', 'tag', 'discipline', 'audience'];

@ApiTags('admin-taxonomy')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/taxonomy')
export class AdminTaxonomyController {
  private model(type: string) {
    const m = TAXONOMY_MODELS[type];
    if (!m) throw new NotFoundException(`Invalid taxonomy type: ${type}`);
    return m;
  }

  @Get(':type')
  @ApiOperation({ summary: 'لیست آیتم‌های تاکسونومی' })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@Param('type') type: string, @Query('search') search?: string) {
    const model = this.model(type);
    const where: any = {};
    if (search) {
      where.OR = [
        { name:     { contains: search, mode: 'insensitive' } },
        { name_en:  { contains: search, mode: 'insensitive' } },
        { slug:     { contains: search, mode: 'insensitive' } },
      ];
    }
    const data = await (prisma as any)[model].findMany({
      where,
      orderBy: model === 'categories'
        ? [{ sort_order: 'asc' as const }, { name: 'asc' as const }]
        : [{ name: 'asc' as const }],
    });
    return { success: true, data };
  }

  @Post(':type')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ایجاد آیتم تاکسونومی' })
  async create(@Param('type') type: string, @Body() dto: CreateTaxonomyItemDto) {
    const model = this.model(type);
    const data = await (prisma as any)[model].create({ data: dto });
    return { success: true, data };
  }

  @Patch(':type/:id')
  @ApiOperation({ summary: 'ویرایش آیتم تاکسونومی' })
  async update(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaxonomyItemDto,
  ) {
    const model = this.model(type);
    const existing = await (prisma as any)[model].findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Taxonomy item not found');
    const data = await (prisma as any)[model].update({ where: { id }, data: dto });
    return { success: true, data };
  }

  @Delete(':type/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف آیتم تاکسونومی' })
  async remove(@Param('type') type: string, @Param('id') id: string) {
    const model = this.model(type);
    const existing = await (prisma as any)[model].findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Taxonomy item not found');
    await (prisma as any)[model].delete({ where: { id } });
    return { success: true, data: { id } };
  }
}
