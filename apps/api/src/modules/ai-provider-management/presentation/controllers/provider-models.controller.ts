import {
  Controller, Get, Patch,
  Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../../admin/infrastructure/guards/admin.guard.js';
import { ModelRegistryService } from '../../application/services/model-registry.service.js';
import { ModelResponseDto } from '../dtos/model-response.dto.js';

@ApiTags('AI Provider Management - Models')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/ai/models')
export class ProviderModelsController {
  constructor(private readonly models: ModelRegistryService) {}

  @Get()
  @ApiOperation({ summary: 'List all AI models' })
  async findAll() {
    const entities = await this.models.findAll();
    return { success: true, data: ModelResponseDto.fromEntities(entities) };
  }

  @Get('chat')
  @ApiOperation({ summary: 'List chat models' })
  async chatModels() {
    const entities = await this.models.getChatModels();
    return { success: true, data: ModelResponseDto.fromEntities(entities) };
  }

  @Get('embedding')
  @ApiOperation({ summary: 'List embedding models' })
  async embeddingModels() {
    const entities = await this.models.getEmbeddingModels();
    return { success: true, data: ModelResponseDto.fromEntities(entities) };
  }

  @Get('vision')
  @ApiOperation({ summary: 'List vision models' })
  async visionModels() {
    const entities = await this.models.getVisionModels();
    return { success: true, data: ModelResponseDto.fromEntities(entities) };
  }

  @Get('reasoning')
  @ApiOperation({ summary: 'List reasoning models' })
  async reasoningModels() {
    const entities = await this.models.getReasoningModels();
    return { success: true, data: ModelResponseDto.fromEntities(entities) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get model by ID' })
  async findOne(@Param('id') id: string) {
    const entities = await this.models.findAll();
    const model = entities.find(m => m.id === id);
    if (!model) {
      return { success: false, error: { message: `Model ${id} not found`, statusCode: HttpStatus.NOT_FOUND } };
    }
    return { success: true, data: ModelResponseDto.fromEntity(model) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update model properties' })
  async update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const entity = await this.models.updateModel(id, body as any);
    return { success: true, data: ModelResponseDto.fromEntity(entity) };
  }
}
