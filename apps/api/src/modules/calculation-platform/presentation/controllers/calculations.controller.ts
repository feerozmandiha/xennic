import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { CalculationRegistryService } from '../../application/services/calculation-registry.service.js';
import { CalculationExecutionService } from '../../application/services/calculation-execution.service.js';
import { CalculationValidationService } from '../../application/services/calculation-validation.service.js';
import { CertificateService } from '../../application/services/certificate.service.js';
import { AuditService } from '../../application/services/audit.service.js';
import { RunCalculationDto } from '../dtos/run-calculation.dto.js';
import { ValidateInputDto } from '../dtos/validate-input.dto.js';
import { DefinitionResponseDto } from '../dtos/calculation-response.dto.js';
import { ResultResponseDto } from '../dtos/calculation-response.dto.js';
import { CertificateResponseDto } from '../dtos/certificate-response.dto.js';

@ApiTags('Calculations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('calculations')
export class CalculationsController {
  constructor(
    private readonly registry: CalculationRegistryService,
    private readonly execution: CalculationExecutionService,
    private readonly validation: CalculationValidationService,
    private readonly certificateService: CertificateService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all calculation definitions' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'enabled', required: false })
  async findAll(@Query('categoryId') categoryId?: string, @Query('enabled') enabled?: string) {
    const entities = await this.registry.getAllDefinitions({
      categoryId,
      enabled: enabled !== undefined ? enabled === 'true' : undefined,
    });
    return { success: true, data: DefinitionResponseDto.fromEntities(entities) };
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all calculation categories' })
  async getCategories() {
    const entities = await this.registry.getAllCategories();
    return { success: true, data: entities };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get calculation definition by ID or slug' })
  async findOne(@Param('id') id: string) {
    const entity =
      id.includes('-') && !id.includes('000')
        ? await this.registry.getDefinitionBySlug(id)
        : await this.registry.getDefinitionById(id);
    return { success: true, data: DefinitionResponseDto.fromEntity(entity) };
  }

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute a calculation' })
  async run(@Body() dto: RunCalculationDto, @Req() req: any) {
    const result = await this.execution.execute({
      definitionId: dto.definitionId,
      inputs: dto.inputs,
      workspaceId: req.user.workspaceId ?? 'default',
      userId: req.user.userId,
      correlationId: req.headers['x-correlation-id'] as string | undefined,
      validateOnly: dto.validateOnly,
      skipAiReview: dto.skipAiReview,
      skipCertificate: dto.skipCertificate,
    });
    return { success: true, data: result };
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate calculation inputs' })
  async validate(@Body() dto: ValidateInputDto) {
    const result = await this.validation.validateAll(dto.definitionId, dto.inputs);
    return { success: true, data: result };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get calculation execution history' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'definitionId', required: false })
  async getHistory(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('definitionId') definitionId?: string,
  ) {
    const result = await this.execution.getResultsByWorkspace(req.user.workspaceId ?? 'default', {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      definitionId,
    });
    return {
      success: true,
      data: ResultResponseDto.fromEntities(result.data),
      meta: {
        total: result.total,
        page: parseInt(page ?? '1'),
        limit: parseInt(limit ?? '20'),
        totalPages: Math.ceil(result.total / parseInt(limit ?? '20')),
      },
    };
  }

  @Get('result/:id')
  @ApiOperation({ summary: 'Get calculation result by ID' })
  async getResult(@Param('id') id: string) {
    const entity = await this.execution.getResult(id);
    return { success: true, data: ResultResponseDto.fromEntity(entity) };
  }

  @Get('certificate/:id')
  @ApiOperation({ summary: 'Get certificate by ID or certificate ID' })
  async getCertificate(@Param('id') id: string) {
    const entity = id.startsWith('CERT-')
      ? await this.certificateService.getCertificateByCertificateId(id)
      : await this.certificateService.getCertificate(id);
    return { success: true, data: CertificateResponseDto.fromEntity(entity) };
  }

  @Get('formulas')
  @ApiOperation({ summary: 'Get all formula definitions' })
  async getFormulas() {
    return { success: true, data: [] };
  }
}
