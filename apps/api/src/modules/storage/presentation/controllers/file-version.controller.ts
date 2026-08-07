import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Req,
  Res,
  Body,
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
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { FileVersionService } from '../../application/services/file-version.service.js';
import { FileVersionResponseDto } from '../dtos/file-version-response.dto.js';
import { CreateFileVersionDto } from '../dtos/create-file-version.dto.js';
import { RevertFileVersionDto } from '../dtos/revert-file-version.dto.js';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

@ApiTags('storage')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
@Controller('storage/files/:fileId/versions')
export class FileVersionController {
  constructor(private readonly fileVersionService: FileVersionService) {}

  // ── POST /storage/files/:fileId/versions ───────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('files.upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new file version',
    description:
      'Uploads a new version of an existing file using multipart/form-data.\n\n' +
      'Max size: 100MB. Send `Content-Type: multipart/form-data` with field name `file`. ' +
      'Optional text field `changeReason` describes why this version was created.',
  })
  @ApiParam({ name: 'fileId', description: 'File UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'New file content' },
        changeReason: {
          type: 'string',
          maxLength: 500,
          description: 'Optional reason for this version',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Version created', type: FileVersionResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file, file too large or bad changeReason' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async create(@Param('fileId') fileId: string, @Req() req: any) {
    if (!req.isMultipart || !req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data');
    }

    let fileBuffer: Buffer | null = null;
    let originalName = '';
    let mimeType = '';
    let changeReason: string | undefined;

    try {
      for await (const part of req.parts({ limits: { fileSize: MAX_FILE_SIZE, files: 1 } })) {
        if (part.type === 'file') {
          originalName = part.filename;
          mimeType = part.mimetype;

          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk as Buffer);
          }
          fileBuffer = Buffer.concat(chunks);

          if ((part.file as any).truncated) {
            throw new BadRequestException(`File too large. Maximum size is 100MB`);
          }
        } else if (part.type === 'field' && part.fieldname === 'changeReason') {
          changeReason = String(part.value);
        }
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      const error = err as Error;
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }

    if (!fileBuffer) {
      throw new BadRequestException('No file provided. Use field name "file"');
    }

    const dto = plainToInstance(CreateFileVersionDto, { changeReason });
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }

    const version = await this.fileVersionService.createVersion({
      fileId,
      workspaceId: req.workspaceId,
      buffer: fileBuffer,
      originalName,
      mimeType,
      changeReason,
      createdBy: req.user?.userId ?? null,
      ipAddress: req.ip ?? null,
      userAgent: req.headers?.['user-agent'] ?? null,
    });

    return { success: true, data: FileVersionResponseDto.fromEntity(version) };
  }

  // ── GET /storage/files/:fileId/versions ────────────────────────────────────

  @Get()
  @RequirePermissions('files.read')
  @ApiOperation({ summary: 'List file versions', description: 'Paginated versions, newest first.' })
  @ApiParam({ name: 'fileId', description: 'File UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Versions retrieved' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async findAll(
    @Param('fileId') fileId: string,
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.fileVersionService.listVersions(
      fileId,
      req.workspaceId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );

    const latestVersion = result.data[0]?.version ?? -1;

    return {
      success: true,
      data: result.data.map((v) =>
        FileVersionResponseDto.fromEntity(v, { isLatest: v.version === latestVersion }),
      ),
      meta: result.meta,
    };
  }

  // ── GET /storage/files/:fileId/versions/:version ───────────────────────────

  @Get(':version')
  @RequirePermissions('files.read')
  @ApiOperation({
    summary: 'Get version info + presigned download URL',
  })
  @ApiParam({ name: 'fileId', description: 'File UUID' })
  @ApiParam({ name: 'version', description: 'Version number (positive integer)' })
  @ApiResponse({ status: 200, description: 'Version found', type: FileVersionResponseDto })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async findOne(
    @Param('fileId') fileId: string,
    @Param('version') version: string,
    @Req() req: any,
  ) {
    const versionNumber = Number(version);
    const [latest, found] = await Promise.all([
      this.fileVersionService.getLatestVersion(fileId, req.workspaceId),
      this.fileVersionService.getVersion(fileId, versionNumber, req.workspaceId),
    ]);

    let downloadUrl: string | undefined;
    try {
      const { url } = await this.fileVersionService.getVersionDownloadUrl(
        fileId,
        versionNumber,
        req.workspaceId,
      );
      downloadUrl = url;
    } catch {
      downloadUrl = undefined;
    }

    return {
      success: true,
      data: FileVersionResponseDto.fromEntity(found, {
        isLatest: latest?.version === found.version,
        downloadUrl,
      }),
    };
  }

  // ── GET /storage/files/:fileId/versions/:version/download ──────────────────

  @Get(':version/download')
  @RequirePermissions('files.read')
  @ApiOperation({
    summary: 'Download a file version',
    description: 'Streams the version content directly as binary.',
  })
  @ApiParam({ name: 'fileId', description: 'File UUID' })
  @ApiParam({ name: 'version', description: 'Version number (positive integer)' })
  @ApiResponse({ status: 200, description: 'Binary file content' })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async download(
    @Param('fileId') fileId: string,
    @Param('version') version: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    const versionNumber = Number(version);
    const { buffer, version: found } = await this.fileVersionService.getVersionContent(
      fileId,
      versionNumber,
      req.workspaceId,
    );

    res
      .header('Content-Type', found.mimeType)
      .header(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(found.originalName)}"`,
      )
      .header('Content-Length', buffer.length.toString())
      .send(buffer);
  }

  // ── POST /storage/files/:fileId/versions/:version/revert ───────────────────

  @Post(':version/revert')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('files.upload')
  @ApiOperation({
    summary: 'Revert to a previous version',
    description:
      'Creates a NEW version whose content is copied from the given version. ' +
      'The new version gets its own object in MinIO; the source version is left untouched.',
  })
  @ApiParam({ name: 'fileId', description: 'File UUID' })
  @ApiParam({ name: 'version', description: 'Source version number (positive integer)' })
  @ApiResponse({ status: 201, description: 'New version created', type: FileVersionResponseDto })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async revert(
    @Param('fileId') fileId: string,
    @Param('version') version: string,
    @Req() req: any,
    @Body() dto: RevertFileVersionDto,
  ) {
    const versionNumber = Number(version);
    const reverted = await this.fileVersionService.revertVersion(
      fileId,
      versionNumber,
      req.workspaceId,
      req.user?.userId ?? null,
      dto?.changeReason ?? 'Reverted from previous version',
      req.ip ?? null,
      req.headers?.['user-agent'] ?? null,
    );

    return { success: true, data: FileVersionResponseDto.fromEntity(reverted, { isLatest: true }) };
  }

  // ── DELETE /storage/files/:fileId/versions/:version ────────────────────────

  @Delete(':version')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('files.delete')
  @ApiOperation({
    summary: 'Delete a file version',
    description:
      'Deletes a non-initial, non-latest version (DB row + its MinIO object). ' +
      'The initial version (v1) and the latest active version cannot be deleted.',
  })
  @ApiParam({ name: 'fileId', description: 'File UUID' })
  @ApiParam({ name: 'version', description: 'Version number (positive integer)' })
  @ApiResponse({ status: 204, description: 'Version deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete the initial version' })
  @ApiResponse({ status: 404, description: 'Version not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete the latest active version' })
  async remove(
    @Param('fileId') fileId: string,
    @Param('version') version: string,
    @Req() req: any,
  ) {
    const versionNumber = Number(version);
    await this.fileVersionService.deleteVersion(
      fileId,
      versionNumber,
      req.workspaceId,
      req.ip ?? null,
      req.headers?.['user-agent'] ?? null,
    );
  }
}
