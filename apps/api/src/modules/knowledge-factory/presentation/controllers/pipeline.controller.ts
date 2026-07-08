import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';

@ApiTags('knowledge-factory')
@Controller('knowledge-factory')
export class PipelineController {
  constructor(private readonly pipelineRunRepository: IPipelineRunRepository) {}

  @Get('pipeline/runs/:documentId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('knowledge-factory:documents:read')
  @ApiOperation({ summary: 'Get all pipeline runs for a document' })
  @ApiParam({ name: 'documentId', description: 'Document UUID' })
  async getPipelineRuns(@Param('documentId', ParseUUIDPipe) documentId: string) {
    const runs = await this.pipelineRunRepository.findByDocument(documentId);
    return { data: runs };
  }
}
