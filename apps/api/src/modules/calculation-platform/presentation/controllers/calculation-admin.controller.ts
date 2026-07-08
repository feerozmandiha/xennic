import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../../admin/infrastructure/guards/admin.guard.js';
import { CalculationRegistryService } from '../../application/services/calculation-registry.service.js';
import { CalculationVersioningService } from '../../application/services/calculation-versioning.service.js';
import { PluginService } from '../../application/services/plugin.service.js';
import { CertificateService } from '../../application/services/certificate.service.js';
import { CreateDefinitionDto } from '../dtos/create-definition.dto.js';
import { CreateCategoryDto } from '../dtos/create-category.dto.js';
import { CreateVersionDto } from '../dtos/create-version.dto.js';
import { RegisterPluginDto } from '../dtos/register-plugin.dto.js';
import { DefinitionResponseDto } from '../dtos/calculation-response.dto.js';
import { CategoryResponseDto } from '../dtos/calculation-response.dto.js';
import { VersionResponseDto } from '../dtos/calculation-response.dto.js';

@ApiTags('Calculations - Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/calculations')
export class CalculationAdminController {
  constructor(
    private readonly registry: CalculationRegistryService,
    private readonly versioning: CalculationVersioningService,
    private readonly pluginService: PluginService,
    private readonly certificateService: CertificateService,
  ) {}

  // ── Categories ──

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create calculation category' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    const entity = await this.registry.createCategory(dto);
    return { success: true, data: CategoryResponseDto.fromEntity(entity) };
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update calculation category' })
  async updateCategory(@Param('id') id: string, @Body() dto: Partial<CreateCategoryDto>) {
    const entity = await this.registry.updateCategory(id, dto);
    return { success: true, data: CategoryResponseDto.fromEntity(entity) };
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete calculation category' })
  async deleteCategory(@Param('id') id: string) {
    await this.registry.deleteCategory(id);
    return { success: true, data: null };
  }

  // ── Definitions ──

  @Post('definitions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create calculation definition' })
  async createDefinition(@Body() dto: CreateDefinitionDto, @Req() req: any) {
    const entity = await this.registry.createDefinition(dto);
    return { success: true, data: DefinitionResponseDto.fromEntity(entity) };
  }

  @Put('definitions/:id')
  @ApiOperation({ summary: 'Update calculation definition' })
  async updateDefinition(@Param('id') id: string, @Body() dto: Partial<CreateDefinitionDto>) {
    const entity = await this.registry.updateDefinition(id, dto);
    return { success: true, data: DefinitionResponseDto.fromEntity(entity) };
  }

  @Patch('definitions/:id/enable')
  @ApiOperation({ summary: 'Enable calculation definition' })
  async enableDefinition(@Param('id') id: string) {
    const entity = await this.registry.enableDefinition(id);
    return { success: true, data: DefinitionResponseDto.fromEntity(entity) };
  }

  @Patch('definitions/:id/disable')
  @ApiOperation({ summary: 'Disable calculation definition' })
  async disableDefinition(@Param('id') id: string) {
    const entity = await this.registry.disableDefinition(id);
    return { success: true, data: DefinitionResponseDto.fromEntity(entity) };
  }

  @Delete('definitions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete calculation definition' })
  async deleteDefinition(@Param('id') id: string) {
    await this.registry.deleteCategory(id);
    return { success: true, data: null };
  }

  // ── Versions ──

  @Post('definitions/:id/versions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new version for a definition' })
  async createVersion(@Param('id') id: string, @Body() dto: CreateVersionDto, @Req() req: any) {
    const entity = await this.versioning.createVersion({
      definitionId: id,
      version: dto.version,
      dslJson: dto.dslDefinition,
      changeLog: dto.changeLog,
      createdBy: req.user.userId,
    });
    return { success: true, data: VersionResponseDto.fromEntity(entity) };
  }

  @Post('definitions/:id/versions/:versionId/publish')
  @ApiOperation({ summary: 'Publish a version' })
  async publishVersion(@Param('versionId') versionId: string, @Req() req: any) {
    const entity = await this.versioning.publishVersion(versionId, req.user.userId);
    return { success: true, data: VersionResponseDto.fromEntity(entity) };
  }

  @Post('definitions/:id/versions/:versionId/deprecate')
  @ApiOperation({ summary: 'Deprecate a version' })
  async deprecateVersion(@Param('versionId') versionId: string) {
    const entity = await this.versioning.deprecateVersion(versionId);
    return { success: true, data: VersionResponseDto.fromEntity(entity) };
  }

  @Post('definitions/:id/rollback/:version')
  @ApiOperation({ summary: 'Rollback to a specific version' })
  async rollback(@Param('id') id: string, @Param('version') version: string, @Req() req: any) {
    const entity = await this.versioning.rollback(id, version, req.user.userId);
    return { success: true, data: VersionResponseDto.fromEntity(entity) };
  }

  @Get('definitions/:id/versions')
  @ApiOperation({ summary: 'Get version history for a definition' })
  async getVersions(@Param('id') id: string) {
    const entities = await this.versioning.getVersionHistory(id);
    return { success: true, data: VersionResponseDto.fromEntities(entities) };
  }

  // ── Plugins ──

  @Get('plugins')
  @ApiOperation({ summary: 'List all plugins' })
  async getPlugins() {
    const plugins = await this.pluginService.getAll();
    return { success: true, data: plugins };
  }

  @Get('plugins/built-in')
  @ApiOperation({ summary: 'List built-in plugins' })
  async getBuiltInPlugins() {
    const plugins = this.pluginService.getBuiltInPlugins();
    return { success: true, data: plugins };
  }

  @Post('plugins')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new plugin' })
  async registerPlugin(@Body() dto: RegisterPluginDto) {
    const entity = await this.pluginService.register(dto);
    return { success: true, data: entity };
  }

  @Patch('plugins/:id/enable')
  @ApiOperation({ summary: 'Enable a plugin' })
  async enablePlugin(@Param('id') id: string) {
    const entity = await this.pluginService.enable(id);
    return { success: true, data: entity };
  }

  @Patch('plugins/:id/disable')
  @ApiOperation({ summary: 'Disable a plugin' })
  async disablePlugin(@Param('id') id: string) {
    const entity = await this.pluginService.disable(id);
    return { success: true, data: entity };
  }

  @Delete('plugins/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a plugin' })
  async deletePlugin(@Param('id') id: string) {
    await this.pluginService.delete(id);
    return { success: true, data: null };
  }

  // ── Certificates ──

  @Get('certificates')
  @ApiOperation({ summary: 'List certificates' })
  async getCertificates(@Param('id') id: string) {
    const result = await this.certificateService.getCertificatesByWorkspace(id);
    return { success: true, data: result.data };
  }
}
