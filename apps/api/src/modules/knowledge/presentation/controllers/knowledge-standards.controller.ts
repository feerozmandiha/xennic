import {
  Controller, Get, Post, Delete,
  Body, Param, Req, UseGuards, HttpCode, HttpStatus, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { prisma } from '@xennic/database';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { KnowledgeService } from '../../application/services/knowledge.service.js';
import { LinkStandardDto } from '../../../standards/presentation/dtos/standard.dto.js';

@ApiTags('knowledge')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
@Controller('knowledge')
export class KnowledgeStandardsController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get(':id/standards')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'List standards linked to an article' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 200, description: 'Standards retrieved' })
  async getStandards(@Param('id') id: string, @Req() req: any) {
    await this.knowledgeService.findOne(id, req.workspaceId);
    const rows = await prisma.knowledge_standards.findMany({
      where: { knowledge_id: id },
      include: { standard: true },
    });
    return {
      success: true,
      data: rows.map(r => ({
        id: r.standard_id,
        code: r.standard.code,
        title: r.standard.title,
        organization: r.standard.organization,
        version: r.standard.version,
        status: r.standard.status,
      })),
    };
  }

  @Post(':id/standards')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Link a standard to an article' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 201, description: 'Standard linked' })
  @ApiResponse({ status: 404, description: 'Article or standard not found' })
  async linkStandard(
    @Param('id') id: string,
    @Body() dto: LinkStandardDto,
    @Req() req: any,
  ) {
    await this.knowledgeService.findOne(id, req.workspaceId);
    const standard = await prisma.engineering_standards.findUnique({ where: { id: dto.standardId } });
    if (!standard) throw new NotFoundException('Standard not found');

    await prisma.knowledge_standards.upsert({
      where: { knowledge_id_standard_id: { knowledge_id: id, standard_id: dto.standardId } },
      create: { knowledge_id: id, standard_id: dto.standardId },
      update: {},
    });

    return { success: true, message: 'Standard linked' };
  }

  @Delete(':id/standards/:standardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Unlink a standard from an article' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiParam({ name: 'standardId', description: 'Standard UUID' })
  @ApiResponse({ status: 204, description: 'Standard unlinked' })
  async unlinkStandard(
    @Param('id') id: string,
    @Param('standardId') standardId: string,
    @Req() req: any,
  ) {
    await this.knowledgeService.findOne(id, req.workspaceId);
    await prisma.knowledge_standards.delete({
      where: { knowledge_id_standard_id: { knowledge_id: id, standard_id: standardId } },
    });
  }
}
