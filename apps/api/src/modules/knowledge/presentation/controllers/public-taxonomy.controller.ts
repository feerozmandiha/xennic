import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { prisma } from '@xennic/database';

const TAXONOMY_TABLES = ['categories', 'topics', 'tags', 'disciplines', 'audiences'] as const;
type TaxonomyTable = (typeof TAXONOMY_TABLES)[number];

const TYPE_TO_TABLE: Record<string, TaxonomyTable> = {
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

@ApiTags('taxonomy-public')
@Controller()
export class PublicTaxonomyController {
  private async fetchTable(table: TaxonomyTable, search?: string, limit = 200) {
    let whereClause = '';
    const params: unknown[] = [];
    if (search) {
      whereClause = `WHERE (\"name\" ILIKE $1 OR \"name_en\" ILIKE $1 OR \"slug\" ILIKE $1)`;
      params.push(`%${search}%`);
    }
    const orderBy = table === 'categories' ? `\"sort_order\" ASC, \"name\" ASC` : `\"name\" ASC`;
    const sql = `SELECT * FROM \"${table}\" ${whereClause} ORDER BY ${orderBy} LIMIT ${limit}`;
    if (params.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return (prisma as any).$queryRawUnsafe(sql, ...params);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return (prisma as any).$queryRawUnsafe(sql);
  }

  @Get('public/taxonomy')
  @ApiOperation({ summary: 'Public list all taxonomy types' })
  async getAllPublic() {
    const result: Record<string, unknown[]> = {};
    for (const table of TAXONOMY_TABLES) {
      result[table] = await this.fetchTable(table);
    }
    return { success: true, data: result };
  }

  @Get('public/taxonomy/:type')
  @ApiOperation({ summary: 'Public list taxonomy by type' })
  async getByTypePublic(
    @Param('type') type: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    const table = TYPE_TO_TABLE[type];
    if (!table) {
      return { success: false, error: `Invalid taxonomy type: ${type}` };
    }
    const lim = limit ? parseInt(limit, 10) : 200;
    const rows = await this.fetchTable(table, search, lim);
    return { success: true, data: rows };
  }

  // Aliases for frontend compatibility - no auth required
  @Get('categories')
  @ApiOperation({ summary: 'Public list categories (alias)' })
  async getCategories(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 200;
    const s = search ?? q;
    const rows = await this.fetchTable('categories', s, lim);
    return { success: true, data: rows };
  }

  @Get('topics')
  @ApiOperation({ summary: 'Public list topics (alias)' })
  async getTopics(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 200;
    const s = search ?? q;
    const rows = await this.fetchTable('topics', s, lim);
    return { success: true, data: rows };
  }

  @Get('tags')
  @ApiOperation({ summary: 'Public list tags (alias)' })
  async getTags(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 200;
    const s = search ?? q;
    const rows = await this.fetchTable('tags', s, lim);
    return { success: true, data: rows };
  }

  @Get('disciplines')
  @ApiOperation({ summary: 'Public list disciplines (alias)' })
  async getDisciplines(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 200;
    const s = search ?? q;
    const rows = await this.fetchTable('disciplines', s, lim);
    return { success: true, data: rows };
  }

  @Get('audiences')
  @ApiOperation({ summary: 'Public list audiences (alias)' })
  async getAudiences(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 200;
    const s = search ?? q;
    const rows = await this.fetchTable('audiences', s, lim);
    return { success: true, data: rows };
  }
}
