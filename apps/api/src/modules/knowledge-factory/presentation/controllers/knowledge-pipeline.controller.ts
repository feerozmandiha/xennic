import {
  Controller, Post, Get, Param, Req, UseGuards, HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { PipelineOrchestratorService } from '../../application/services/pipeline-orchestrator.service.js';
import { AuditService } from '../../application/services/audit.service.js';

@ApiTags('knowledge-factory')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('knowledge-factory')
export class KnowledgePipelineController {
  constructor(
    private readonly orchestrator: PipelineOrchestratorService,
    private readonly auditService: AuditService,
  ) {}

  @Post('pipeline')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Execute full knowledge pipeline on a document' })
  @ApiResponse({ status: 202, description: 'Pipeline accepted' })
  async executePipeline(@Req() req: any) {
    const file = await req.file();
    if (!file) {
      return { success: false, error: { message: 'No file provided' } };
    }
    const buffer = await file.toBuffer();
    const result = await this.orchestrator.execute(
      req.workspaceId, req.user.userId, buffer, file.filename, file.mimetype,
    );
    return { success: true, data: result };
  }

  @Get('pipeline/:documentId')
  @ApiOperation({ summary: 'Get pipeline audit history for a document' })
  @ApiResponse({ status: 200, description: 'Audit history returned' })
  async getPipelineHistory(@Param('documentId') documentId: string) {
    const history = await this.auditService.getHistory(documentId);
    const chainValid = this.auditService.verifyChain(documentId, history);
    return { success: true, data: { history, chainValid } };
  }
}
