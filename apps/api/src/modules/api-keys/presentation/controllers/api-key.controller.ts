import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { ApiKeyService } from '../../application/services/api-key.service.js';
import { CreateApiKeyDto, ApiKeyResponseDto, ValidateApiKeyResponseDto } from '../dtos/api-key.dto.js';

@ApiTags('api-keys')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('api_keys.create')
  @ApiOperation({ summary: 'Create a new API key', description: 'Returns the full key only once.' })
  @ApiResponse({ status: 201, description: 'API key created' })
  @ApiResponse({ status: 400, description: 'Invalid input or limit reached' })
  async create(@Body() dto: CreateApiKeyDto, @Req() req: any) {
    const { apiKey, rawKey } = await this.apiKeyService.create({
      workspaceId: req.workspaceId,
      name: dto.name,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
    return {
      success: true,
      data: ApiKeyResponseDto.fromEntity(apiKey, rawKey),
    };
  }

  @Get()
  @RequirePermissions('api_keys.read')
  @ApiOperation({ summary: 'List API keys', description: 'Returns paginated API keys for the workspace.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'API keys retrieved' })
  async findAll(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    const result = await this.apiKeyService.findAll(
      req.workspaceId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return {
      success: true,
      data: result.data.map(k => ApiKeyResponseDto.fromEntity(k)),
      meta: result.meta,
    };
  }

  @Get(':id')
  @RequirePermissions('api_keys.read')
  @ApiOperation({ summary: 'Get API key details' })
  @ApiParam({ name: 'id', description: 'API key UUID' })
  @ApiResponse({ status: 200, description: 'API key found' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const key = await this.apiKeyService.findOne(id, req.workspaceId);
    return { success: true, data: ApiKeyResponseDto.fromEntity(key) };
  }

  @Post(':id/revoke')
  @RequirePermissions('api_keys.revoke')
  @ApiOperation({ summary: 'Revoke an API key', description: 'Once revoked, the key cannot be used again.' })
  @ApiParam({ name: 'id', description: 'API key UUID' })
  @ApiResponse({ status: 200, description: 'API key revoked' })
  async revoke(@Param('id') id: string, @Req() req: any) {
    const key = await this.apiKeyService.revoke(id, req.workspaceId);
    return { success: true, data: ApiKeyResponseDto.fromEntity(key) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('api_keys.delete')
  @ApiOperation({ summary: 'Delete an API key' })
  @ApiParam({ name: 'id', description: 'API key UUID' })
  @ApiResponse({ status: 204, description: 'API key deleted' })
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.apiKeyService.delete(id, req.workspaceId);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate an API key',
    description: 'Public endpoint to validate an API key. Used by external services.',
  })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validate(@Body('key') key: string) {
    if (!key) {
      return { success: true, data: { valid: false } };
    }
    const result = await this.apiKeyService.validate(key);
    if (!result) {
      return { success: true, data: { valid: false } };
    }
    return {
      success: true,
      data: {
        valid: true,
        workspaceId: result.workspaceId,
        keyName: result.name,
      } as ValidateApiKeyResponseDto,
    };
  }
}
