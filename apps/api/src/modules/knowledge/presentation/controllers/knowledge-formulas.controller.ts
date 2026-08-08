import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { KnowledgeService } from '../../application/services/knowledge.service.js';
import { prisma } from '@xennic/database';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateFormulaDto {
  @ApiProperty({ description: 'LaTeX formula', example: 'V = I \\times R' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  latex!: string;

  @ApiPropertyOptional({ description: 'MathML representation' })
  @IsOptional()
  @IsString()
  mathml?: string;

  @ApiPropertyOptional({ description: 'توضیح فارسی' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descriptionFa?: string;

  @ApiPropertyOptional({ description: 'English description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Variables array JSON' })
  @IsOptional()
  @IsArray()
  variables?: any[];

  @ApiPropertyOptional({ description: 'Calculator type code e.g. CABLE-003' })
  @IsOptional()
  @IsString()
  calculatorType?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

class UpdateFormulaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  latex?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mathml?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descriptionFa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  variables?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  calculatorType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

@ApiTags('knowledge-formulas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
@Controller('knowledge/:id/formulas')
export class KnowledgeFormulasController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'List formulas for an article' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  async list(@Param('id') id: string, @Req() req: any) {
    await this.knowledgeService.findOne(id, req.workspaceId);
    const rows = await prisma.knowledge_formulas.findMany({
      where: { knowledge_id: id },
      orderBy: { sort_order: 'asc' },
    });
    return { success: true, data: rows };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Add formula to article' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiBody({ type: CreateFormulaDto })
  async create(@Param('id') id: string, @Body() dto: CreateFormulaDto, @Req() req: any) {
    await this.knowledgeService.findOne(id, req.workspaceId);
    const row = await prisma.knowledge_formulas.create({
      data: {
        id: crypto.randomUUID(),
        knowledge_id: id,
        latex: dto.latex,
        mathml: dto.mathml ?? null,
        description_fa: dto.descriptionFa ?? null,
        description_en: dto.descriptionEn ?? null,
        variables: (dto.variables ?? []) as any,
        calculator_type: dto.calculatorType ?? null,
        sort_order: dto.sortOrder ?? 0,
      },
    });
    return { success: true, data: row };
  }

  @Patch(':formulaId')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Update formula' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'formulaId' })
  async update(
    @Param('id') id: string,
    @Param('formulaId') formulaId: string,
    @Body() dto: UpdateFormulaDto,
    @Req() req: any,
  ) {
    await this.knowledgeService.findOne(id, req.workspaceId);
    const existing = await prisma.knowledge_formulas.findUnique({
      where: { id: formulaId, knowledge_id: id },
    });
    if (!existing) throw new NotFoundException('Formula not found');

    const row = await prisma.knowledge_formulas.update({
      where: { id: formulaId },
      data: {
        latex: dto.latex ?? existing.latex,
        mathml: dto.mathml !== undefined ? dto.mathml : existing.mathml,
        description_fa:
          dto.descriptionFa !== undefined ? dto.descriptionFa : existing.description_fa,
        description_en:
          dto.descriptionEn !== undefined ? dto.descriptionEn : existing.description_en,
        variables: dto.variables !== undefined ? (dto.variables as any) : existing.variables,
        calculator_type:
          dto.calculatorType !== undefined ? dto.calculatorType : existing.calculator_type,
        sort_order: dto.sortOrder ?? existing.sort_order,
      },
    });
    return { success: true, data: row };
  }

  @Delete(':formulaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Delete formula' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'formulaId' })
  async remove(@Param('id') id: string, @Param('formulaId') formulaId: string, @Req() req: any) {
    await this.knowledgeService.findOne(id, req.workspaceId);
    const existing = await prisma.knowledge_formulas.findUnique({
      where: { id: formulaId, knowledge_id: id },
    });
    if (!existing) throw new NotFoundException('Formula not found');
    await prisma.knowledge_formulas.delete({ where: { id: formulaId } });
  }
}
