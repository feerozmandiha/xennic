import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { prisma } from '@xennic/database';

const TAXONOMY_TABLES = ['categories', 'topics', 'tags', 'disciplines', 'audiences'] as const;
type TaxonomyTable = (typeof TAXONOMY_TABLES)[number];

const TYPE_MAP: Record<string, TaxonomyTable> = {
  category: 'categories',
  categories: 'categories',
  topic: 'topics',
  topics: 'topics',
  tag: 'tags',
  tags: 'tags',
  discipline: 'disciplines',
  disciplines: 'disciplines',
  audience: 'audiences',
  audiences: 'audiences',
};

@ApiTags('Taxonomy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('taxonomy')
export class TaxonomyController {
  private async fetch(table: TaxonomyTable, search?: string, limit = 200) {
    const safeSearch = search ? search.replace(/'/g, "''") : undefined;
    const where = safeSearch
      ? `WHERE "name" ILIKE '%${safeSearch}%' OR "slug" ILIKE '%${safeSearch}%'`
      : '';
    const order = table === 'categories' ? `"sort_order" ASC, "name" ASC` : `"created_at" ASC`;
    return prisma.$queryRawUnsafe<unknown[]>(
      `SELECT * FROM "${table}" ${where} ORDER BY ${order} LIMIT ${limit}`,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all taxonomy types (workspace-scoped)' })
  async getAll(@Query('limit') limit?: string): Promise<Record<string, unknown[]>> {
    const lim = limit ? parseInt(limit, 10) : 200;
    const result: Record<string, unknown[]> = {};
    for (const table of TAXONOMY_TABLES) {
      const rows = await this.fetch(table, undefined, lim);
      result[table] = rows;
    }
    return { success: true, data: result } as any;
  }

  @Get(':type')
  @ApiOperation({ summary: 'List taxonomy items by type (supports singular/plural + search)' })
  async getByType(
    @Param('type') type: string,
    @Query('search') search?: string,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ): Promise<unknown> {
    const table = TYPE_MAP[type];
    if (!table) {
      return { success: false, error: `Invalid taxonomy type: ${type}` };
    }
    const s = search ?? q;
    const lim = limit ? parseInt(limit, 10) : 200;
    const rows = await this.fetch(table, s, lim);
    return { success: true, data: rows };
  }
}
