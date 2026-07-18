import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Request,
  Body,
  BadRequestException,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { DocumentIntakeService } from '../../application/services/document-intake.service.js';
import { PipelineOrchestratorService } from '../../application/services/pipeline-orchestrator.service.js';
import { PublishingService } from '../../application/services/publishing.service.js';
import { UploadDocumentDto } from '../../dto/upload-document.dto.js';

@ApiTags('Knowledge Factory - Documents')
@ApiBearerAuth()
@Controller('knowledge-factory/documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DocumentsController {
  constructor(
    private readonly intake: DocumentIntakeService,
    private readonly orchestrator: PipelineOrchestratorService,
    private readonly publishing: PublishingService,
  ) {}

  @Post('upload')
  @RequirePermissions('knowledge:create')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a knowledge document' })
  @ApiBody({ type: UploadDocumentDto })
  async uploadDocument(
    @Request() req: any,
    @UploadedFile() file: any,
    @Body() body: UploadDocumentDto,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) throw new BadRequestException('Workspace ID required');

    const document = await this.intake.registerDocument({
      workspaceId,
      filename: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      buffer: file.buffer,
      contentType: file.mimetype,
      createdBy: req.user?.sub,
      metadata: body.metadata ? JSON.parse(body.metadata) : undefined,
    });

    return {
      success: true,
      data: { id: document.id, workspaceId: document.workspaceId, status: document.status },
    };
  }

  @Get(':id')
  @RequirePermissions('knowledge:read')
  @ApiOperation({ summary: 'Get document by ID' })
  async getDocument(@Param('id') id: string, @Request() _req: any) {
    const _workspaceId = _req.user?.workspaceId;

    return { success: true, data: { id, workspaceId: _workspaceId } };
  }

  @Get()
  @RequirePermissions('knowledge:read')
  @ApiOperation({ summary: 'List documents' })
  async listDocuments(@Request() _req: any) {
    const _workspaceId = _req.user?.workspaceId;

    return { success: true, data: [], meta: { total: 0 } };
  }

  @Delete(':id')
  @RequirePermissions('knowledge:delete')
  @ApiOperation({ summary: 'Soft delete a document' })
  async deleteDocument(@Param('id') id: string) {
    await this.intake.deleteDocument(id);
    return { success: true, data: { id, deleted: true } };
  }

  @Post(':id/process')
  @RequirePermissions('knowledge:update')
  @ApiOperation({ summary: 'Run pipeline on a document' })
  async processDocument(@Param('id') id: string) {
    const result = await this.orchestrator.runPipeline(id);
    return { success: true, data: result };
  }

  @Post(':id/publish')
  @RequirePermissions('knowledge:publish')
  @ApiOperation({ summary: 'Publish a processed document' })
  async publishDocument(@Param('id') id: string, @Body() _body?: { knowledgeId?: string }) {
    const result = await this.publishing.publishDocument(id, {});
    return { success: true, data: result };
  }
}
