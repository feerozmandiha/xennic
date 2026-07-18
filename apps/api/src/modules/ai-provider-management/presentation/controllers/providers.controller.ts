import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../../admin/infrastructure/guards/admin.guard.js';
import { ProviderRegistryService } from '../../application/services/provider-registry.service.js';
import { CreateProviderDto } from '../dtos/create-provider.dto.js';
import { UpdateProviderDto } from '../dtos/update-provider.dto.js';
import { ProviderResponseDto } from '../dtos/provider-response.dto.js';

@ApiTags('AI Provider Management - Providers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/ai/providers')
export class ProvidersController {
  constructor(private readonly registry: ProviderRegistryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new AI provider' })
  async create(@Body() dto: CreateProviderDto, @Req() req: any) {
    const entity = await this.registry.register({
      ...dto,
      createdBy: req.user.userId,
    });
    return { success: true, data: ProviderResponseDto.fromEntity(entity) };
  }

  @Get()
  @ApiOperation({ summary: 'List all AI providers' })
  @ApiQuery({ name: 'enabled', required: false, type: Boolean })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  async findAll(
    @Query('enabled') enabled?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    const entities = await this.registry.findAll({
      enabled: enabled !== undefined ? enabled === 'true' : undefined,
      includeDeleted: includeDeleted === 'true',
    });
    return { success: true, data: ProviderResponseDto.fromEntities(entities) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider by ID' })
  async findOne(@Param('id') id: string) {
    const entity = await this.registry.findById(id);
    return { success: true, data: ProviderResponseDto.fromEntity(entity) };
  }

  @Get('by-name/:name')
  @ApiOperation({ summary: 'Get provider by name' })
  async findByName(@Param('name') name: string) {
    const entity = await this.registry.findByName(name);
    return { success: true, data: ProviderResponseDto.fromEntity(entity) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update provider' })
  async update(@Param('id') id: string, @Body() dto: UpdateProviderDto, @Req() req: any) {
    const entity = await this.registry.update(id, {
      ...dto,
      updatedBy: req.user.userId,
    });
    return { success: true, data: ProviderResponseDto.fromEntity(entity) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete provider' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.registry.delete(id, req.user.userId);
    return { success: true, data: null };
  }

  @Put(':id/enable')
  @ApiOperation({ summary: 'Enable provider' })
  async enable(@Param('id') id: string, @Req() req: any) {
    const entity = await this.registry.update(id, { enabled: true, updatedBy: req.user.userId });
    return { success: true, data: ProviderResponseDto.fromEntity(entity) };
  }

  @Put(':id/disable')
  @ApiOperation({ summary: 'Disable provider' })
  async disable(@Param('id') id: string, @Req() req: any) {
    const entity = await this.registry.update(id, { enabled: false, updatedBy: req.user.userId });
    return { success: true, data: ProviderResponseDto.fromEntity(entity) };
  }
}
