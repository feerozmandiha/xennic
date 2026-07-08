import { Controller, Get, Param, UseGuards, Request, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PipelineOrchestratorService } from '../../application/services/pipeline-orchestrator.service.js';
import { PublishingService } from '../../application/services/publishing.service.js';

@ApiTags('Knowledge Factory - Pipeline')
@ApiBearerAuth()
@Controller('knowledge-factory/pipeline')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PipelineStatusController {
  constructor(
    private readonly orchestrator: PipelineOrchestratorService,
    private readonly publishing: PublishingService,
  ) {}

  @Get('status/:documentId')
  @RequirePermissions('knowledge:read')
  @ApiOperation({ summary: 'Get pipeline status for a document' })
  async getPipelineStatus(@Param('documentId') documentId: string, @Request() _req: any) {
    const status = await this.publishing.getPublishingStatus(documentId);
    return { success: true, data: status };
  }

  @Post(':documentId/retry')
  @RequirePermissions('knowledge:update')
  @ApiOperation({ summary: 'Retry failed pipeline' })
  async retryPipeline(@Param('documentId') documentId: string) {
    const result = await this.orchestrator.retryPipeline(documentId);
    return { success: true, data: result };
  }
}
