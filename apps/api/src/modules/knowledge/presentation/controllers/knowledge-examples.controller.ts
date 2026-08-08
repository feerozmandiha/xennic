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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { KnowledgeService } from '../../application/services/knowledge.service.js';
import { prisma } from '@xennic/database';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateExampleDto {
  @ApiProperty({ description: 'عنوان فارسی', example: 'مثال محاسبه افت ولتاژ' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  titleFa!: string;

  @ApiPropertyOptional({ description: 'English title' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  titleEn?: string;

  @ApiPropertyOptional({ enum: ['basic', 'intermediate', 'advanced'], default: 'basic' })
  @IsOptional()
  @IsIn(['basic', 'intermediate', 'advanced'])
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Steps JSON array' })
  @IsOptional()
  @IsArray()
  steps?: any[];

  @ApiPropertyOptional({ description: 'Answer JSON' })
  @IsOptional()
  answer?: any;

  @ApiPropertyOptional({ description: 'Calculator type' })
  @IsOptional()
  @IsString()
  calculatorType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

class UpdateExampleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  titleFa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  titleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['basic', 'intermediate', 'advanced'])
  difficulty?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  steps?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  answer?: any;

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

@ApiTags('knowledge-examples')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
@Controller('knowledge/:id/examples')
export class KnowledgeExamplesController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  @RequirePermissions('knowledge.read')
  @ApiOperation({ summary: 'List examples for an article' })
  @ApiParam({ name: 'id' })
  async list(@Param('id') id: string, @Req() req: any) {
    await this.knowledgeService.findOne(id, req.workspaceId);
    const rows = await prisma.knowledge_examples.findMany({
      where: { knowledge_id: id },
      orderBy: { sort_order: 'asc' },
    });
    return { success: true, data: rows };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Add example to article' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: CreateExampleDto })
  async create(@Param('id') id: string, @Body() dto: CreateExampleDto, @Req() req: any) {
    await this.knowledgeService.findOne(id, req.workspaceId);
    const row = await prisma.knowledge_examples.create({
      data: {
        id: crypto.randomUUID(),
        knowledge_id: id,
        title_fa: dto.titleFa,
        title_en: dto.titleEn ?? null,
        difficulty: dto.difficulty ?? 'basic',
        steps: (dto.steps ?? []) as any,
        answer: (dto.answer ?? null) as any,
        calculator_type: dto.calculatorType ?? null,
        sort_order: dto.sortOrder ?? 0,
      },
    });
    return { success: true, data: row };
  }

  @Patch(':exampleId')
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Update example' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'exampleId' })
  async update(
    @Param('id') id: string,
    @Param('exampleId') exampleId: string,
    @Body() dto: UpdateExampleDto,
    @Req() req: any,
  ) {
    await this.knowledgeService.findOne(id, req.workspaceId);
    const existing = await prisma.knowledge_examples.findUnique({
      where: { id: exampleId, knowledge_id: id },
    });
    if (!existing) throw new NotFoundException('Example not found');

    const row = await prisma.knowledge_examples.update({
      where: { id: exampleId },
      data: {
        title_fa: dto.titleFa ?? existing.title_fa,
        title_en: dto.titleEn !== undefined ? dto.titleEn : existing.title_en,
        difficulty: dto.difficulty ?? existing.difficulty,
        steps: dto.steps !== undefined ? (dto.steps as any) : existing.steps,
        answer: dto.answer !== undefined ? (dto.answer as any) : existing.answer,
        calculator_type:
          dto.calculatorType !== undefined ? dto.calculatorType : existing.calculator_type,
        sort_order: dto.sortOrder ?? existing.sort_order,
      },
    });
    return { success: true, data: row };
  }

  @Delete(':exampleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('knowledge.update')
  @ApiOperation({ summary: 'Delete example' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'exampleId' })
  async remove(@Param('id') id: string, @Param('exampleId') exampleId: string, @Req() req: any) {
    await this.knowledgeService.findOne(id, req.workspaceId);
    const existing = await prisma.knowledge_examples.findUnique({
      where: { id: exampleId, knowledge_id: id },
    });
    if (!existing) throw new NotFoundException('Example not found');
    await prisma.knowledge_examples.delete({ where: { id: exampleId } });
  }
}
