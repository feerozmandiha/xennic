import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { prisma } from '@xennic/database';

@ApiTags('standards-public')
@Controller('public/standards')
export class PublicStandardController {
  @Get()
  @ApiOperation({ summary: 'Public list/search engineering standards' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'organization', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('q') q?: string,
    @Query('organization') organization?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const lim = limit ? parseInt(limit, 10) : 50;
    const offset = (pageNum - 1) * lim;

    const where: any = { status: 'active' };
    if (organization) where.organization = organization;
    if (q) {
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.engineering_standards.findMany({
        where,
        skip: offset,
        take: lim,
        orderBy: { code: 'asc' },
      }),
      prisma.engineering_standards.count({ where }),
    ]);

    return {
      success: true,
      data: data.map((s: any) => ({
        id: s.id,
        code: s.code,
        title: s.title,
        organization: s.organization,
        version: s.version,
        status: s.status,
      })),
      meta: { page: pageNum, limit: lim, total, totalPages: Math.ceil(total / lim) },
    };
  }
}
