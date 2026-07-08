import { Controller, Get, Post, Param, Body, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import type { ElectricalPluginExecutionRequest } from '../../infrastructure/plugins/electrical/electrical-plugin.service.js';
import { ElectricalPluginService } from '../../infrastructure/plugins/electrical/electrical-plugin.service.js';

@ApiTags('Electrical Plugins')
@Controller('electrical')
export class ElectricalPluginsController {
  constructor(private readonly service: ElectricalPluginService) {}

  @Get()
  @ApiOperation({ summary: 'List all electrical calculation plugins' })
  listAll(@Query('category') category?: string, @Query('search') search?: string) {
    if (search) return this.service.searchPlugins(search);
    if (category) return this.service.getPluginsByCategory(category);
    return this.service.getAllPluginInfos();
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all plugin categories' })
  getCategories() {
    return this.service.getCategories();
  }

  @Get('standards')
  @ApiOperation({ summary: 'List all engineering standards covered' })
  getStandards() {
    return this.service.getStandardsCovered();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get plugin statistics summary' })
  getStats() {
    return this.service.getStatsSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plugin details' })
  @ApiParam({ name: 'id', description: 'Plugin identifier' })
  getPlugin(@Param('id') id: string) {
    const plugin = this.service.getPluginInfo(id);
    if (!plugin) return { success: false, error: `Plugin '${id}' not found` };
    const dsl = this.service.getPlugin(id);
    return { success: true, data: { ...plugin, dsl: dsl?.toJson() } };
  }

  @Get(':id/formulas')
  @ApiOperation({ summary: 'Get plugin formulas' })
  @ApiParam({ name: 'id', description: 'Plugin identifier' })
  getFormulas(@Param('id') id: string) {
    const formulas = this.service.getFormulasByPlugin(id);
    if (!formulas) return { success: false, error: `Plugin '${id}' not found` };
    return { success: true, data: formulas };
  }

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute a calculation plugin' })
  @ApiBody({ description: 'Plugin ID and input values' })
  async execute(@Body() request: ElectricalPluginExecutionRequest) {
    const result = await this.service.execute(request);
    return {
      success: result.errors.length === 0,
      data: result,
    };
  }

  @Post('execute-batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute multiple calculation plugins' })
  @ApiBody({ description: 'Array of plugin execution requests' })
  async executeBatch(@Body() requests: ElectricalPluginExecutionRequest[]) {
    const results = await this.service.executeBatch(requests);
    return {
      success: true,
      data: results,
    };
  }
}
