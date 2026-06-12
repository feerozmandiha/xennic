import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
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
import { PermissionsGuard } from '../../infrastructure/guards/permissions.guard.js';
import { RequirePermissions } from '../../infrastructure/decorators/permissions.decorator.js';
import { PermissionService } from '../../application/services/permission.service.js';
import { CreatePermissionDto, PermissionResponseDto } from '../dtos/permission.dto.js';

@ApiTags('permissions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // ─── GET /permissions ────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Get all permissions',
    description: 'Returns list of all available permissions, optionally filtered by domain.',
  })
  @ApiQuery({ name: 'domain', required: false, description: 'Filter by domain (e.g. identity, workspace, engineering)' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully', type: [PermissionResponseDto] })
  async findAll(@Query('domain') domain?: string) {
    const permissions = domain
      ? await this.permissionService.findByDomain(domain)
      : await this.permissionService.findAll();

    return {
      success: true,
      data: permissions.map((p) => PermissionResponseDto.fromEntity(p)),
    };
  }

  // ─── GET /permissions/:id ────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({
    summary: 'Get permission by ID',
    description: 'Returns detailed information about a specific permission.',
  })
  @ApiParam({ name: 'id', description: 'Permission UUID' })
  @ApiResponse({ status: 200, description: 'Permission found', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findOne(@Param('id') id: string) {
    const permission = await this.permissionService.findOne(id);
    return { success: true, data: PermissionResponseDto.fromEntity(permission) };
  }

  // ─── POST /permissions ───────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('permissions.create')
  @ApiOperation({
    summary: 'Create a new permission',
    description: 'Creates a new permission with domain.action slug format.',
  })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({ status: 201, description: 'Permission created successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 409, description: 'Permission with this slug already exists' })
  async create(@Body() dto: CreatePermissionDto) {
    const permission = await this.permissionService.create({
      name:        dto.name,
      slug:        dto.slug,
      domain:      dto.domain,
      description: dto.description,
    });
    return { success: true, data: PermissionResponseDto.fromEntity(permission) };
  }

  // ─── DELETE /permissions/:id ─────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('permissions.delete')
  @ApiOperation({
    summary: 'Delete permission',
    description: 'Permanently deletes a permission and removes it from all roles.',
  })
  @ApiParam({ name: 'id', description: 'Permission UUID' })
  @ApiResponse({ status: 204, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async remove(@Param('id') id: string) {
    await this.permissionService.remove(id);
  }
}
