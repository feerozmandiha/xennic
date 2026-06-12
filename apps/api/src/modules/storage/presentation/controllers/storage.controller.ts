import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { StorageService } from '../../application/services/storage.service.js';
import { FileResponseDto, StorageStatsDto } from '../dtos/storage.dto.js';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

@ApiTags('storage')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  // ── POST /storage/upload ──────────────────────────────────────────────────

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('files.upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a file',
    description:
      'Upload a file using multipart/form-data.\n\n' +
      'Max size: 100MB.\n\n' +
      'Send as `Content-Type: multipart/form-data` with field name `file`.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'File to upload' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: FileResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  async upload(@Req() req: any) {
    // Fastify multipart handling
    if (!req.isMultipart || !req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data');
    }

    let fileBuffer: Buffer | null = null;
    let originalName = 'unknown';
    let mimeType = 'application/octet-stream';

    try {
      const data = await req.file({ limits: { fileSize: MAX_FILE_SIZE } });
      if (!data) {
        throw new BadRequestException('No file provided. Use field name "file"');
      }

      originalName = data.filename;
      mimeType     = data.mimetype;

      const chunks: Buffer[] = [];
      for await (const chunk of data.file) {
        chunks.push(chunk as Buffer);
      }
      fileBuffer = Buffer.concat(chunks);

      if ((data.file as any).truncated) {
        throw new BadRequestException(`File too large. Maximum size is 100MB`);
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      const error = err as Error;
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }

    const uploaded = await this.storageService.upload({
      workspaceId:  req.workspaceId,
      uploadedBy:   req.user.userId,
      buffer:       fileBuffer!,
      originalName,
      mimeType,
    });

    // presigned URL برای دانلود فوری
    try {
      const { url } = await this.storageService.getDownloadUrl(
        uploaded.id, req.workspaceId, 3600,
      );
      return { success: true, data: FileResponseDto.fromEntity(uploaded, url) };
    } catch {
      return { success: true, data: FileResponseDto.fromEntity(uploaded) };
    }
  }

  // ── GET /storage/files ────────────────────────────────────────────────────

  @Get('files')
  @RequirePermissions('files.read')
  @ApiOperation({ summary: 'List files', description: 'Returns paginated files in the workspace.' })
  @ApiQuery({ name: 'page',   required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit',  required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'bucket', required: false,
    enum: ['public','private','reports','documents','engineering','ai'],
  })
  @ApiResponse({ status: 200, description: 'Files retrieved' })
  async findAll(
    @Req() req: any,
    @Query('page')   page?: string,
    @Query('limit')  limit?: string,
    @Query('bucket') bucket?: string,
  ) {
    const result = await this.storageService.findAll(
      req.workspaceId,
      page  ? parseInt(page,  10) : 1,
      limit ? parseInt(limit, 10) : 20,
      bucket,
    );
    return {
      success: true,
      data: result.data.map(f => FileResponseDto.fromEntity(f)),
      meta: result.meta,
    };
  }

  // ── GET /storage/files/:id ────────────────────────────────────────────────

  @Get('files/:id')
  @RequirePermissions('files.read')
  @ApiOperation({ summary: 'Get file info + presigned download URL' })
  @ApiParam({ name: 'id', description: 'File UUID' })
  @ApiResponse({ status: 200, description: 'File found', type: FileResponseDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    try {
      const { url, file } = await this.storageService.getDownloadUrl(
        id, req.workspaceId,
      );
      return { success: true, data: FileResponseDto.fromEntity(file, url) };
    } catch {
      const file = await this.storageService.findOne(id, req.workspaceId);
      return { success: true, data: FileResponseDto.fromEntity(file) };
    }
  }

  // ── GET /storage/files/:id/download ──────────────────────────────────────

  @Get('files/:id/download')
  @RequirePermissions('files.read')
  @ApiOperation({
    summary: 'Download file directly',
    description: 'Streams the file content directly as binary.',
  })
  @ApiParam({ name: 'id', description: 'File UUID' })
  async download(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    const { buffer, file } = await this.storageService.download(id, req.workspaceId);
    res
      .header('Content-Type', file.mimeType)
      .header('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`)
      .header('Content-Length', buffer.length.toString())
      .send(buffer);
  }

  // ── DELETE /storage/files/:id ─────────────────────────────────────────────

  @Delete('files/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('files.delete')
  @ApiOperation({ summary: 'Soft delete file' })
  @ApiParam({ name: 'id', description: 'File UUID' })
  @ApiResponse({ status: 204, description: 'File deleted' })
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.storageService.delete(id, req.workspaceId);
  }

  // ── GET /storage/stats ────────────────────────────────────────────────────

  @Get('stats')
  @RequirePermissions('files.read')
  @ApiOperation({
    summary: 'Storage statistics',
    description: 'Returns total files count and storage space used.',
  })
  @ApiResponse({ status: 200, description: 'Stats retrieved', type: StorageStatsDto })
  async getStats(@Req() req: any) {
    const stats = await this.storageService.getStorageStats(req.workspaceId);
    return { success: true, data: stats };
  }

  // ── GET /storage/health ───────────────────────────────────────────────────

  @Get('health')
  @ApiOperation({ summary: 'Storage (MinIO) health check' })
  @ApiResponse({ status: 200, description: 'Health status' })
  async health() {
    const status = await this.storageService.health();
    return { success: true, data: status };
  }
}
