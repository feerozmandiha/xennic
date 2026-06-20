import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, Req,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AdminGuard } from '../../../admin/infrastructure/guards/admin.guard.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { FeatureFlagService } from '../../application/services/feature-flag.service.js';
import {
  CreateFeatureFlagDto, UpdateFeatureFlagDto, ToggleFeatureFlagDto, FeatureFlagResponseDto,
} from '../dtos/feature-flag.dto.js';

@ApiTags('admin / feature-flags')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/feature-flags')
export class FeatureFlagAdminController {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new feature flag' })
  @ApiResponse({ status: 201, description: 'Feature flag created' })
  @ApiResponse({ status: 409, description: 'Feature flag already exists' })
  async create(@Body() dto: CreateFeatureFlagDto) {
    const flag = await this.featureFlagService.create(dto);
    return { success: true, data: FeatureFlagResponseDto.fromEntity(flag) };
  }

  @Get()
  @ApiOperation({ summary: 'List all feature flags' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const result = await this.featureFlagService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
    return {
      success: true,
      data: result.data.map(f => FeatureFlagResponseDto.fromEntity(f)),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feature flag details' })
  @ApiParam({ name: 'id', description: 'Feature flag UUID' })
  async findOne(@Param('id') id: string) {
    const flag = await this.featureFlagService.findOne(id);
    return { success: true, data: FeatureFlagResponseDto.fromEntity(flag) };
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Enable or disable a feature flag' })
  @ApiParam({ name: 'id', description: 'Feature flag UUID' })
  async toggle(@Param('id') id: string, @Body() dto: ToggleFeatureFlagDto) {
    const flag = await this.featureFlagService.toggle(id, dto.enabled);
    return { success: true, data: FeatureFlagResponseDto.fromEntity(flag) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update feature flag metadata' })
  @ApiParam({ name: 'id', description: 'Feature flag UUID' })
  async update(@Param('id') id: string, @Body() dto: UpdateFeatureFlagDto) {
    const flag = await this.featureFlagService.update(id, dto);
    return { success: true, data: FeatureFlagResponseDto.fromEntity(flag) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a feature flag' })
  @ApiParam({ name: 'id', description: 'Feature flag UUID' })
  async delete(@Param('id') id: string) {
    await this.featureFlagService.delete(id);
  }
}
