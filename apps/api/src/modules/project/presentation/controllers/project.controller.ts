import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
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
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { ProjectService } from '../../application/services/project.service.js';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  AddProjectNoteDto,
  ProjectResponseDto,
  ProjectMemberResponseDto,
  ProjectNoteResponseDto,
} from '../dtos/project.dto.js';

@ApiTags('projects')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // ─── GET /projects ────────────────────────────────────────────────────────

  @Get()
  @RequirePermissions('projects.read')
  @ApiOperation({ summary: 'List projects', description: 'Returns paginated list of projects in the workspace.' })
  @ApiQuery({ name: 'page',  required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  async findAll(
    @Req() req: any,
    @Query('page')  page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.projectService.findAll(
      req.workspaceId,
      page  ? parseInt(page,  10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return {
      success: true,
      data: result.data.map((p) => ProjectResponseDto.fromEntity(p)),
      meta: result.meta,
    };
  }

  // ─── POST /projects ───────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('projects.create')
  @ApiOperation({ summary: 'Create project', description: 'Creates a new project in the workspace.' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'Project created', type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() dto: CreateProjectDto, @Req() req: any) {
    const project = await this.projectService.create(
      {
        workspaceId: req.workspaceId,
        name:        dto.name,
        description: dto.description,
        startDate:   dto.startDate ? new Date(dto.startDate) : undefined,
        endDate:     dto.endDate   ? new Date(dto.endDate)   : undefined,
      },
      req.user.userId,
    );
    return { success: true, data: ProjectResponseDto.fromEntity(project) };
  }

  // ─── GET /projects/:id ────────────────────────────────────────────────────

  @Get(':id')
  @RequirePermissions('projects.read')
  @ApiOperation({ summary: 'Get project', description: 'Returns a specific project by ID.' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project found', type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const project = await this.projectService.findOne(id, req.workspaceId);
    return { success: true, data: ProjectResponseDto.fromEntity(project) };
  }

  // ─── PATCH /projects/:id ──────────────────────────────────────────────────

  @Patch(':id')
  @RequirePermissions('projects.update')
  @ApiOperation({ summary: 'Update project', description: 'Updates project details.' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({ status: 200, description: 'Project updated', type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: any,
  ) {
    // ERROR FIX TS2322:
    // dto.startDate / dto.endDate are `string | null | undefined` (from IsDateString).
    // UpdateProjectInput expects `Date | null | undefined`.
    // When the value is a non-empty string → convert to Date.
    // When the value is null (explicit clear) → pass null as Date | null.
    // When the value is undefined (field not sent) → pass undefined.
    const toDate = (v: string | null | undefined): Date | null | undefined => {
      if (v === undefined) return undefined;
      if (v === null)      return null;
      return new Date(v);
    };

    const project = await this.projectService.update(
      id,
      req.workspaceId,
      {
        name:        dto.name,
        description: dto.description,
        status:      dto.status,
        startDate:   toDate(dto.startDate),
        endDate:     toDate(dto.endDate),
      },
      req.user.userId,
    );
    return { success: true, data: ProjectResponseDto.fromEntity(project) };
  }

  // ─── DELETE /projects/:id ─────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('projects.delete')
  @ApiOperation({ summary: 'Soft delete project', description: 'Marks project as deleted (recoverable).' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 204, description: 'Project deleted' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.projectService.remove(id, req.workspaceId, req.user.userId);
  }

  // ─── PATCH /projects/:id/restore ─────────────────────────────────────────

  @Patch(':id/restore')
  @RequirePermissions('projects.update')
  @ApiOperation({ summary: 'Restore project', description: 'Restores a soft-deleted project.' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project restored', type: ProjectResponseDto })
  async restore(@Param('id') id: string, @Req() req: any) {
    const project = await this.projectService.restore(id, req.workspaceId, req.user.userId);
    return { success: true, data: ProjectResponseDto.fromEntity(project) };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MEMBERS
  // ══════════════════════════════════════════════════════════════════════════

  // ─── GET /projects/:id/members ────────────────────────────────────────────

  @Get(':id/members')
  @RequirePermissions('projects.read')
  @ApiOperation({ summary: 'List members', description: 'Returns all members of a project.' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Members retrieved' })
  async getMembers(@Param('id') id: string, @Req() req: any) {
    const members = await this.projectService.getMembers(id, req.workspaceId);
    return {
      success: true,
      data: members.map((m) => ProjectMemberResponseDto.fromEntity(m)),
    };
  }

  // ─── POST /projects/:id/members ───────────────────────────────────────────

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('projects.update')
  @ApiOperation({ summary: 'Add member', description: 'Adds a user to the project.' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiBody({ type: AddProjectMemberDto })
  @ApiResponse({ status: 201, description: 'Member added' })
  @ApiResponse({ status: 409, description: 'User already a member' })
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddProjectMemberDto,
    @Req() req: any,
  ) {
    const member = await this.projectService.addMember(
      id,
      req.workspaceId,
      dto.userId,
      dto.role,
      req.user.userId,
    );
    return { success: true, data: ProjectMemberResponseDto.fromEntity(member) };
  }

  // ─── DELETE /projects/:id/members/:userId ─────────────────────────────────

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('projects.update')
  @ApiOperation({ summary: 'Remove member', description: 'Removes a user from the project.' })
  @ApiParam({ name: 'id',     description: 'Project UUID' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 204, description: 'Member removed' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    await this.projectService.removeMember(id, req.workspaceId, userId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // NOTES
  // ══════════════════════════════════════════════════════════════════════════

  // ─── GET /projects/:id/notes ──────────────────────────────────────────────

  @Get(':id/notes')
  @RequirePermissions('projects.read')
  @ApiOperation({ summary: 'List notes', description: 'Returns all notes of a project.' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Notes retrieved' })
  async getNotes(@Param('id') id: string, @Req() req: any) {
    const notes = await this.projectService.getNotes(id, req.workspaceId);
    return {
      success: true,
      data: notes.map((n) => ProjectNoteResponseDto.fromEntity(n)),
    };
  }

  // ─── POST /projects/:id/notes ─────────────────────────────────────────────

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('projects.update')
  @ApiOperation({ summary: 'Add note', description: 'Adds a note to the project.' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiBody({ type: AddProjectNoteDto })
  @ApiResponse({ status: 201, description: 'Note added' })
  async addNote(
    @Param('id') id: string,
    @Body() dto: AddProjectNoteDto,
    @Req() req: any,
  ) {
    const note = await this.projectService.addNote(
      id,
      req.workspaceId,
      dto.content,
      req.user.userId,
    );
    return { success: true, data: ProjectNoteResponseDto.fromEntity(note) };
  }

  // ─── DELETE /projects/:id/notes/:noteId ───────────────────────────────────

  @Delete(':id/notes/:noteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('projects.update')
  @ApiOperation({ summary: 'Delete note', description: 'Permanently deletes a project note.' })
  @ApiParam({ name: 'id',     description: 'Project UUID' })
  @ApiParam({ name: 'noteId', description: 'Note UUID' })
  @ApiResponse({ status: 204, description: 'Note deleted' })
  async deleteNote(
    @Param('id') id: string,
    @Param('noteId') noteId: string,
    @Req() req: any,
  ) {
    await this.projectService.deleteNote(id, req.workspaceId, noteId);
  }
}
