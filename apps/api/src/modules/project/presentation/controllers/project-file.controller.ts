import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { ProjectMemberGuard } from '../../infrastructure/guards/project-member.guard.js';
import { ProjectFileService } from '../../application/services/project-file.service.js';
import { ProjectFileResponseDto } from '../dtos/project-file.dto.js';

@ApiTags('projects')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard, ProjectMemberGuard)
@Controller('projects/:projectId/files')
export class ProjectFileController {
  constructor(private readonly projectFileService: ProjectFileService) {}

  // ─── POST /projects/:projectId/files/:fileId ────────────────────────────────

  @Post(':fileId')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('projects.update')
  @ApiOperation({ summary: 'Attach file to project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'fileId', description: 'File UUID' })
  @ApiResponse({ status: 201, description: 'File attached to project' })
  @ApiResponse({ status: 404, description: 'Project or file not found' })
  @ApiResponse({ status: 409, description: 'File already attached' })
  async attach(
    @Param('projectId') projectId: string,
    @Param('fileId') fileId: string,
    @Req() req: any,
  ) {
    const projectFile = await this.projectFileService.attachFile(
      projectId,
      fileId,
      req.user.userId,
      req.workspaceId,
    );
    return { success: true, data: ProjectFileResponseDto.fromEntity(projectFile) };
  }

  // ─── DELETE /projects/:projectId/files/:fileId ──────────────────────────────

  @Delete(':fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('projects.update')
  @ApiOperation({ summary: 'Detach file from project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'fileId', description: 'File UUID' })
  @ApiResponse({ status: 204, description: 'File detached from project' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async detach(
    @Param('projectId') projectId: string,
    @Param('fileId') fileId: string,
    @Req() req: any,
  ) {
    await this.projectFileService.detachFile(projectId, fileId, req.user.userId, req.workspaceId);
  }

  // ─── GET /projects/:projectId/files ─────────────────────────────────────────

  @Get()
  @RequirePermissions('projects.read')
  @ApiOperation({ summary: 'List project files' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Project files retrieved' })
  async list(
    @Param('projectId') projectId: string,
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.projectFileService.listProjectFiles(
      projectId,
      req.workspaceId,
      req.user.userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return {
      success: true,
      data: result.data.map((pf) => ProjectFileResponseDto.fromEntity(pf)),
      meta: result.meta,
    };
  }
}
