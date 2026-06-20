import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { prisma } from '@xennic/database';

const TAXONOMY_TABLES = ['categories', 'topics', 'tags', 'disciplines', 'audiences'] as const;

@ApiTags('Taxonomy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('taxonomy')
export class TaxonomyController {
  @Get()
  @ApiOperation({ summary: 'List all taxonomy types' })
  async getAll(): Promise<Record<string, unknown[]>> {
    const result: Record<string, unknown[]> = {};
    for (const table of TAXONOMY_TABLES) {
      const rows = await prisma.$queryRawUnsafe<unknown[]>(
        `SELECT * FROM "${table}" ORDER BY "created_at" ASC`,
      );
      result[table] = rows;
    }
    return { success: true, data: result } as any;
  }

  @Get(':type')
  @ApiOperation({ summary: 'List taxonomy items by type' })
  async getByType(@Param('type') type: string): Promise<unknown> {
    if (!TAXONOMY_TABLES.includes(type as any)) {
      return { success: false, error: `Invalid taxonomy type: ${type}` };
    }
    const rows = await prisma.$queryRawUnsafe<unknown[]>(
      `SELECT * FROM "${type}" ORDER BY "created_at" ASC`,
    );
    return { success: true, data: rows };
  }
}
