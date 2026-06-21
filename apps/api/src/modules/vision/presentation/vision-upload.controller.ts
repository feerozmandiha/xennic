import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../rbac/infrastructure/guards/workspace.guard.js';
import type { ICalculationRepository } from '../../engineering/domain/interfaces/calculation.repository.interface.js';
import { CalculationEntity } from '../../engineering/domain/entities/calculation.entity.js';

@ApiTags('vision')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('vision')
export class VisionUploadController {
  constructor(
    @Inject('ICalculationRepository')
    private readonly calculationRepo: ICalculationRepository,
  ) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload & auto-detect document (bill / nameplate / generic)',
    description:
      'Upload a file — system auto-detects if it is an electricity bill or equipment nameplate. ' +
      'Runs OCR + extraction and saves to workspace history.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF or image (jpg, png, bmp, tiff)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Analysis complete' })
  @ApiResponse({ status: 503, description: 'Vision service unavailable' })
  async upload(@Req() req: any, @Res() reply: any) {
    const VISION_URL =
      process.env['VISION_SERVICE_URL'] ?? 'http://localhost:8003';

    try {
      if (!req.isMultipart || !req.isMultipart()) {
        return reply
          .status(400)
          .send({ success: false, error: 'multipart/form-data required' });
      }

      const chunks: Buffer[] = [];
      const t0 = Date.now();
      for await (const chunk of req.raw) {
        chunks.push(Buffer.from(chunk));
      }
      const rawBody = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] ?? '';

      const visionRes = await fetch(`${VISION_URL}/api/v1/vision/upload`, {
        method: 'POST',
        body: rawBody,
        headers: { 'Content-Type': contentType },
        signal: AbortSignal.timeout(120_000),
      });

      if (!visionRes.ok) {
        const errBody = await visionRes.json().catch(() => ({}));
        return reply.status(visionRes.status).send({
          success: false,
          error: 'Vision service processing failed',
          detail: errBody,
        });
      }

      const visionData = await visionRes.json();
      const detectedType = visionData.data?.detected_type ?? 'generic';
      const durationMs = Date.now() - t0;

      // Save to workspace history (calculations table)
      try {
        const allowedTypes = ['vision_bill', 'vision_nameplate', 'vision_generic'] as const;
        const typeMap: Record<string, string> = {
          bill: 'vision_bill',
          nameplate: 'vision_nameplate',
        };
        const calcType = typeMap[detectedType] ?? 'vision_generic';

        const entity = CalculationEntity.create({
          workspaceId: req.workspaceId ?? '',
          userId: req.user?.userId ?? '',
          type: calcType,
          version: visionData.engine_version ?? '1.0.0',
          inputs: { filename: req.headers['x-filename'] ?? 'upload' },
          results: visionData.data ?? {},
          engineVersion: visionData.engine_version ?? '1.0.0',
          standardVersion: '',
          durationMs,
        });
        await this.calculationRepo.save(entity);
      } catch (dbErr) {
        console.error('Failed to save vision analysis:', dbErr);
      }

      return reply
        .status(200)
        .header('Content-Type', 'application/json')
        .send(visionData);
    } catch (err) {
      const msg = (err as Error).message;
      return reply.status(503).send({
        success: false,
        error: 'Vision service unavailable',
        detail: msg,
      });
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Vision upload health check' })
  async health() {
    const VISION_URL =
      process.env['VISION_SERVICE_URL'] ?? 'http://localhost:8003';
    try {
      const res = await fetch(`${VISION_URL}/health`, {
        signal: AbortSignal.timeout(5_000),
      });
      return res.ok
        ? { success: true, data: await res.json() }
        : { success: false, status: 'unhealthy' };
    } catch {
      return { success: false, status: 'unreachable' };
    }
  }
}
