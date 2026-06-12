import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Ip,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../infrastructure/guards/permissions.guard.js';
import { RequirePermissions } from '../../infrastructure/decorators/permissions.decorator.js';
import { RoleService } from '../../application/services/role.service.js';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
  RoleResponseDto,
} from '../dtos/role.dto.js';

@ApiTags('roles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // ─── GET /roles ──────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Get all roles',
    description: 'Returns list of all roles.',
  })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully', type: [RoleResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    const roles = await this.roleService.findAll();
    return {
      success: true,
      data: roles.map((r) => RoleResponseDto.fromEntity(r)),
    };
  }

  // ─── POST /roles ─────────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('roles.create')
  @ApiOperation({
    summary: 'Create a new role',
    description: 'Creates a new role with specified permissions.',
  })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Role with this slug already exists' })
  async create(
    @Body() dto: CreateRoleDto,
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const role = await this.roleService.create(
      { name: dto.name, slug: dto.slug, description: dto.description },
      req.user.userId,
      { ipAddress: ip, workspaceId: req.workspaceId },
    );
    return { success: true, data: RoleResponseDto.fromEntity(role) };
  }

  // ─── GET /roles/:id ──────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({
    summary: 'Get role by ID',
    description: 'Returns detailed information about a specific role.',
  })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiResponse({ status: 200, description: 'Role found', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id') id: string) {
    const role = await this.roleService.findOne(id);
    return { success: true, data: RoleResponseDto.fromEntity(role) };
  }

  // ─── PUT /roles/:id ──────────────────────────────────────────────────────────

  @Put(':id')
  @RequirePermissions('roles.update')
  @ApiOperation({
    summary: 'Update role',
    description: 'Updates role name and description.',
  })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const role = await this.roleService.update(
      id,
      { name: dto.name, description: dto.description },
      req.user.userId,
      { ipAddress: ip, workspaceId: req.workspaceId },
    );
    return { success: true, data: RoleResponseDto.fromEntity(role) };
  }

  // ─── DELETE /roles/:id ───────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('roles.delete')
  @ApiOperation({
    summary: 'Delete role',
    description: 'Permanently deletes a role.',
  })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async remove(@Param('id') id: string, @Req() req: any, @Ip() ip: string) {
    await this.roleService.remove(id, req.user.userId, {
      ipAddress: ip,
      workspaceId: req.workspaceId,
    });
  }

  // ─── POST /roles/:id/permissions ─────────────────────────────────────────────

  @Post(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('roles.permissions.assign')
  @ApiOperation({
    summary: 'Assign permissions to role',
    description: 'Adds one or more permissions to a specific role.',
  })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiBody({ type: AssignPermissionsDto })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully' })
  @ApiResponse({ status: 404, description: 'Role or Permission not found' })
  async assignPermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
    @Req() req: any,
    @Ip() ip: string,
  ) {
    await this.roleService.assignPermissions(
      id,
      dto.permissionIds,
      req.user.userId,
      { ipAddress: ip, workspaceId: req.workspaceId },
    );
    return {
      success: true,
      message: `${dto.permissionIds.length} permission(s) assigned to role`,
    };
  }
}
