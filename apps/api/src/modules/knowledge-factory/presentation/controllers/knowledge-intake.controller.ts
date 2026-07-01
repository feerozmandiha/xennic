import {
  Controller,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { IntakeService } from '../../application/services/intake.service.js';

@ApiTags('knowledge-factory')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('knowledge-factory')
export class KnowledgeIntakeController {
  constructor(private readonly intakeService: IntakeService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload and ingest a document',
    description: 'Accepts a multipart file upload, processes and ingests it into the knowledge factory.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file (PDF, DOCX, MD, TXT)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document ingested successfully' })
  async ingest(@Req() req: any) {
    const file = await req.file();

    if (!file) {
      return { success: false, error: { message: 'No file provided' } };
    }

    const buffer = await file.toBuffer();
    const entity = await this.intakeService.ingestDocument(
      req.workspaceId,
      req.user.userId,
      buffer,
      file.filename,
      file.mimetype,
    );

    return {
      success: true,
      data: {
        id: entity.id,
        documentId: entity.documentId,
        status: entity.status,
        sourceType: entity.sourceType,
        checksum: entity.checksum,
        createdAt: entity.createdAt,
      },
    };
  }
}
