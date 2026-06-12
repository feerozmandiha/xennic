import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceService } from '../../application/services/workspace.service.js';
import { CreateWorkspaceDto } from '../dtos/create-workspace.dto.js';
import { UpdateWorkspaceDto } from '../dtos/update-workspace.dto.js';
import { WorkspaceResponseDto } from '../dtos/workspace-response.dto.js';

@ApiTags('workspaces')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // ─── POST /workspaces ─────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new workspace',
    description: 'Creates a new workspace. Owner is automatically set from JWT token.',
  })
  @ApiBody({ type: CreateWorkspaceDto })
  @ApiResponse({ status: 201, description: 'Workspace created', type: WorkspaceResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Workspace with this name already exists' })
  async create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const workspace = await this.workspaceService.create(createWorkspaceDto, userId);
    // ✅ فرمت یکسان { success, data } برای همه endpoint ها
    return {
      success: true,
      data: WorkspaceResponseDto.fromEntity(workspace),
    };
  }

  // ─── GET /workspaces ──────────────────────────────────────────────────────
  // ✅ فقط workspace های خود کاربر (owned + member)

  @Get()
  @ApiOperation({
    summary: 'Get my workspaces',
    description: 'Returns workspaces where the current user is owner or member.',
  })
  @ApiQuery({ name: 'page',  required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Workspaces retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Req() req: any,
    @Query('page')  page?: string,
    @Query('limit') limit?: string,
  ) {
    // ✅ فیلتر بر اساس userId — نه همه workspace ها
    const { data, meta } = await this.workspaceService.findByUser(
      req.user.userId,
      page  ? parseInt(page,  10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return {
      success: true,
      data: WorkspaceResponseDto.fromEntities(data),
      meta,
    };
  }

  // ─── GET /workspaces/:id ──────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace by ID' })
  @ApiParam({ name: 'id', description: 'Workspace UUID' })
  @ApiResponse({ status: 200, description: 'Workspace found', type: WorkspaceResponseDto })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async findOne(@Param('id') id: string) {
    const workspace = await this.workspaceService.findOne(id);
    return { success: true, data: WorkspaceResponseDto.fromEntity(workspace) };
  }

  // ─── PUT /workspaces/:id ──────────────────────────────────────────────────

  @Put(':id')
  @ApiOperation({ summary: 'Update workspace', description: 'Updates workspace name.' })
  @ApiParam({ name: 'id', description: 'Workspace UUID' })
  @ApiBody({ type: UpdateWorkspaceDto })
  @ApiResponse({ status: 200, description: 'Workspace updated', type: WorkspaceResponseDto })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const workspace = await this.workspaceService.update(id, dto.name, userId);
    return { success: true, data: WorkspaceResponseDto.fromEntity(workspace) };
  }

  // ─── DELETE /workspaces/:id ───────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete workspace' })
  @ApiParam({ name: 'id', description: 'Workspace UUID' })
  @ApiResponse({ status: 204, description: 'Workspace soft deleted' })
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    await this.workspaceService.remove(id, req.user.userId);
  }

  // ─── PATCH /workspaces/:id/restore ───────────────────────────────────────

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted workspace' })
  @ApiParam({ name: 'id', description: 'Workspace UUID' })
  @ApiResponse({ status: 200, description: 'Workspace restored', type: WorkspaceResponseDto })
  async restore(@Param('id') id: string, @Req() req: any) {
    const workspace = await this.workspaceService.restore(id, req.user.userId);
    return { success: true, data: WorkspaceResponseDto.fromEntity(workspace) };
  }

  // ─── DELETE /workspaces/:id/hard ─────────────────────────────────────────

  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete workspace', description: '⚠️ IRREVERSIBLE' })
  @ApiParam({ name: 'id', description: 'Workspace UUID' })
  @ApiResponse({ status: 204, description: 'Workspace permanently deleted' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    await this.workspaceService.hardDelete(id);
  }
}
