import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { StandardService } from '../../application/services/standard.service.js';
import {
  CreateStandardDto, UpdateStandardDto, StandardSearchQueryDto, StandardResponseDto,
} from '../dtos/standard.dto.js';

@ApiTags('standards')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
@Controller('standards')
export class StandardController {
  constructor(private readonly standardService: StandardService) {}

  @Get()
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'List/search engineering standards' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'q', required: false, description: 'Search by code or title' })
  @ApiQuery({ name: 'organization', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'draft', 'superseded'] })
  @ApiResponse({ status: 200, description: 'Standards retrieved' })
  async findAll(@Query() query: StandardSearchQueryDto) {
    const result = await this.standardService.findAll(
      query.page ? parseInt(query.page, 10) : 1,
      query.limit ? parseInt(query.limit, 10) : 20,
      query.q,
      query.organization,
      query.status,
    );
    return {
      success: true,
      data: StandardResponseDto.fromEntities(result.data),
      meta: result.meta,
    };
  }

  @Get(':id')
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'Get standard by ID' })
  @ApiParam({ name: 'id', description: 'Standard UUID' })
  @ApiResponse({ status: 200, description: 'Standard found' })
  @ApiResponse({ status: 404, description: 'Standard not found' })
  async findOne(@Param('id') id: string) {
    const entity = await this.standardService.findById(id);
    return { success: true, data: StandardResponseDto.fromEntity(entity) };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('knowledge.create')
  @ApiOperation({ summary: 'Create a new engineering standard' })
  @ApiBody({ type: CreateStandardDto })
  @ApiResponse({ status: 201, description: 'Standard created' })
  @ApiResponse({ status: 409, description: 'Code already exists' })
  async create(@Body() dto: CreateStandardDto) {
    const entity = await this.standardService.create(dto);
    return { success: true, data: StandardResponseDto.fromEntity(entity) };
  }

  @Patch(':id')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Update a standard' })
  @ApiParam({ name: 'id', description: 'Standard UUID' })
  @ApiBody({ type: UpdateStandardDto })
  @ApiResponse({ status: 200, description: 'Standard updated' })
  @ApiResponse({ status: 404, description: 'Standard not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateStandardDto) {
    const entity = await this.standardService.update(id, dto);
    return { success: true, data: StandardResponseDto.fromEntity(entity) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('knowledge.delete')
  @ApiOperation({ summary: 'Delete a standard' })
  @ApiParam({ name: 'id', description: 'Standard UUID' })
  @ApiResponse({ status: 204, description: 'Standard deleted' })
  async remove(@Param('id') id: string) {
    await this.standardService.remove(id);
  }
}
