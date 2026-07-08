import { Controller, Get, Post, Put, Param, Body, HttpStatus, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PluginRegistry, RegisteredPlugin } from '../../infrastructure/plugin-registry.js';

@ApiTags('Plugin Admin')
@Controller('admin/plugins')
export class PluginAdminController {
  private readonly logger = new Logger(PluginAdminController.name);

  constructor(private readonly registry: PluginRegistry) {}

  @Get()
  @ApiOperation({ summary: 'List all registered plugins' })
  listAll() {
    return { success: true, data: this.registry.getAllPlugins() };
  }

  @Get('enabled')
  @ApiOperation({ summary: 'List enabled plugins' })
  listEnabled() {
    return { success: true, data: this.registry.getEnabledPlugins() };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get plugin details' })
  getPlugin(@Param('slug') slug: string) {
    const plugin = this.registry.getPlugin(slug);
    if (!plugin) return { success: false, error: `Plugin '${slug}' not found` };
    return { success: true, data: plugin };
  }

  @Post(':slug/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable a plugin' })
  enablePlugin(@Param('slug') slug: string) {
    this.logger.log(`Enabling plugin: ${slug}`);
    return { success: true, data: { slug, enabled: true } };
  }

  @Post(':slug/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable a plugin' })
  disablePlugin(@Param('slug') slug: string) {
    this.logger.log(`Disabling plugin: ${slug}`);
    return { success: true, data: { slug, enabled: false } };
  }

  @Put(':slug/version')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update plugin version' })
  updateVersion(@Param('slug') slug: string, @Body() body: { version: string }) {
    this.logger.log(`Updating plugin ${slug} to version ${body.version}`);
    return { success: true, data: { slug, version: body.version } };
  }

  @Post(':slug/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a plugin' })
  publishPlugin(@Param('slug') slug: string) {
    this.logger.log(`Publishing plugin: ${slug}`);
    return { success: true, data: { slug, published: true } };
  }

  @Post(':slug/rollback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rollback a plugin version' })
  rollbackPlugin(@Param('slug') slug: string, @Body() body: { version: string }) {
    this.logger.log(`Rolling back plugin ${slug} to version ${body.version}`);
    return { success: true, data: { slug, version: body.version } };
  }

  @Post(':slug/clone')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Clone a plugin' })
  clonePlugin(@Param('slug') slug: string, @Body() body: { newSlug: string; newName: string }) {
    this.logger.log(`Cloning plugin ${slug} to ${body.newSlug}`);
    return { success: true, data: { slug: body.newSlug, name: body.newName, clonedFrom: slug } };
  }

  @Get('export/:slug')
  @ApiOperation({ summary: 'Export plugin definition' })
  exportPlugin(@Param('slug') slug: string) {
    const plugin = this.registry.getPlugin(slug);
    if (!plugin) return { success: false, error: `Plugin '${slug}' not found` };
    return { success: true, data: { ...plugin, exportedAt: new Date().toISOString() } };
  }

  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Import a plugin definition' })
  importPlugin(@Body() plugin: Partial<RegisteredPlugin>) {
    this.logger.log(`Importing plugin: ${plugin.slug}`);
    return { success: true, data: { slug: plugin.slug, imported: true } };
  }

  @Get('capabilities')
  @ApiOperation({ summary: 'List all plugin capabilities' })
  getCapabilities() {
    return { success: true, data: this.registry.getCapabilities() };
  }
}
