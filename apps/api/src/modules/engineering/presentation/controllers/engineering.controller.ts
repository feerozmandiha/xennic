import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { EngineeringService } from '../../application/services/engineering.service.js';
import {
  RunCalculationDto,
  CalculationResponseDto,
  CalculationResultDto,
  SUPPORTED_CALCULATION_TYPES,
} from '../dtos/engineering.dto.js';

@ApiTags('engineering')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
@Controller('engineering')
export class EngineeringController {
  constructor(private readonly engineeringService: EngineeringService) {}

  // ─── GET /engineering/calculations ───────────────────────────────────────────

  @Get('calculations')
  @RequirePermissions('engineering.read')
  @ApiOperation({
    summary: 'List calculations',
    description: 'Returns paginated list of calculations in the workspace.',
  })
  @ApiQuery({ name: 'page',      required: false, type: Number })
  @ApiQuery({ name: 'limit',     required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: String, description: 'Filter by project' })
  @ApiQuery({ name: 'type',      required: false, type: String, description: 'Filter by calculation type (e.g. BASIC-001)' })
  @ApiResponse({ status: 200, description: 'Calculations retrieved successfully' })
  async findAll(
    @Req() req: any,
    @Query('page')      page?: string,
    @Query('limit')     limit?: string,
    @Query('projectId') projectId?: string,
    @Query('type')      type?: string,
  ) {
    const result = await this.engineeringService.findAll(
      req.workspaceId,
      page  ? parseInt(page,  10) : 1,
      limit ? parseInt(limit, 10) : 20,
      projectId,
      type,
    );
    return {
      success: true,
      data: result.data.map((c) => CalculationResponseDto.fromEntity(c)),
      meta: result.meta,
    };
  }

  // ─── POST /engineering/calculations ──────────────────────────────────────────

  @Post('calculations')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('engineering.calculate')
  @ApiOperation({
    summary: 'Run a calculation',
    description:
      'Executes an engineering calculation via the Python engine, saves the result and returns it.\n\n' +
      '**Supported types:** ' + SUPPORTED_CALCULATION_TYPES.join(', '),
  })
  @ApiBody({ type: RunCalculationDto })
  @ApiResponse({ status: 201, description: 'Calculation executed and saved', type: CalculationResultDto })
  @ApiResponse({ status: 400, description: 'Validation failed — invalid inputs for the calculation type' })
  @ApiResponse({ status: 403, description: 'This calculation requires a Pro or Enterprise plan' })
  @ApiResponse({ status: 404, description: 'Calculation type not found' })
  @ApiResponse({ status: 503, description: 'Engineering service unavailable' })
  async run(@Body() dto: RunCalculationDto, @Req() req: any) {
    // planSlug از دیتابیس خوانده می‌شود — نه از JWT
    const { calculation, result } = await this.engineeringService.run({
      workspaceId: req.workspaceId,
      projectId:   dto.projectId,
      userId:      req.user.userId,
      type:        dto.type,
      inputs:      dto.inputs,
    });

    return {
      success: true,
      data: {
        calculation: CalculationResponseDto.fromEntity(calculation),
        result,
      },
    };
  }

  // ─── GET /engineering/calculations/:id ───────────────────────────────────────

  @Get('calculations/:id')
  @RequirePermissions('engineering.read')
  @ApiOperation({ summary: 'Get calculation by ID', description: 'Returns a specific calculation.' })
  @ApiParam({ name: 'id', description: 'Calculation UUID' })
  @ApiResponse({ status: 200, description: 'Calculation found', type: CalculationResponseDto })
  @ApiResponse({ status: 404, description: 'Calculation not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const calc = await this.engineeringService.findOne(id, req.workspaceId);
    return { success: true, data: CalculationResponseDto.fromEntity(calc) };
  }

  // ─── DELETE /engineering/calculations/:id ────────────────────────────────────

  @Delete('calculations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('engineering.calculate')
  @ApiOperation({ summary: 'Delete calculation', description: 'Permanently deletes a calculation record.' })
  @ApiParam({ name: 'id', description: 'Calculation UUID' })
  @ApiResponse({ status: 204, description: 'Calculation deleted' })
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.engineeringService.delete(id, req.workspaceId);
  }

  // ─── GET /engineering/catalog ─────────────────────────────────────────────────

  @Get('catalog')
  @RequirePermissions('engineering.read')
  @ApiOperation({
    summary: 'Get calculation catalog',
    description: 'Returns list of available calculation types based on user\'s plan.',
  })
  @ApiResponse({ status: 200, description: 'Catalog retrieved' })
  async getCatalog(@Req() req: any) {
    const available = this.engineeringService.availableCalculations(
      req.user.planSlug ?? 'free',
    );
    return {
      success: true,
      data: available,
      meta: { total: available.length },
    };
  }

  // ─── GET /engineering/health ──────────────────────────────────────────────────

  @Get('health')
  @ApiOperation({
    summary: 'Engineering service health',
    description: 'Checks if the Python engineering engine is running.',
  })
  @ApiResponse({ status: 200, description: 'Health status' })
  async health() {
    const status = await this.engineeringService.engineeringHealth();
    return { success: true, data: status };
  }

  // ─── POST /engineering/energy/ocr-bill ────────────────────────────────────
  // OCR via vision-service (PaddleOCR + Vision LLM), سپس تحلیل

  @Post('energy/ocr-bill')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OCR + تحلیل قبض برق',
    description: 'آپلود قبض PDF/تصویر → OCR (vision-service) → تحلیل pandapower',
  })
  async ocrBill(@Req() req: any, @Res() reply: any) {
    try {
      if (!req.isMultipart || !req.isMultipart()) {
        return reply.status(400).send({ success: false, error: 'multipart/form-data required' });
      }

      // خواندن raw body (multipart: file + run_analysis)
      const chunks: Buffer[] = [];
      for await (const chunk of req.raw) {
        chunks.push(Buffer.from(chunk));
      }
      const rawBody = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] ?? '';

      // 1. OCR via vision-service
      const VISION_URL = process.env['VISION_SERVICE_URL'] ?? 'http://localhost:8003';
      const visionRes = await fetch(`${VISION_URL}/api/v1/vision/bill/read`, {
        method: 'POST',
        body: rawBody,
        headers: { 'Content-Type': contentType },
        signal: AbortSignal.timeout(120_000),
      });

      if (!visionRes.ok) {
        const errBody = await visionRes.json().catch(() => ({}));
        return reply.status(visionRes.status).send({
          success: false,
          error: 'Vision service OCR failed',
          detail: errBody,
        });
      }

      const visionData = await visionRes.json();
      const bill = visionData.data?.bill ?? {};
      const confidence = visionData.confidence ?? 0;

      // 2. Transform vision-service response → old format
      const normalized: Record<string, any> = {
        kwh_consumed: bill.consumption_kwh ?? null,
        amount_rials: bill.total_amount ?? null,
        billing_days: null,
        subscriber_type: null,
        current_peak_kw: null,
        kvarh_consumed: null,
        contract_kw: null,
        power_factor: null,
      };

      if (bill.extra_fields) {
        for (const [k, v] of Object.entries(bill.extra_fields)) {
          normalized[k] = v;
        }
      }

      const response: Record<string, any> = {
        success: true,
        ocr: {
          raw_text: visionData.data?.combined_text ?? '',
          kwh_found: bill.consumption_kwh != null,
          confidence,
          normalized,
          extracted: bill,
        },
        engine: 'vision-service',
        engine_version: visionData.engine_version ?? '1.0.0',
      };

      return reply
        .status(200)
        .header('Content-Type', 'application/json')
        .send(response);

    } catch (err) {
      const msg = (err as Error).message;
      reply.status(503).send({
        success: false,
        error:   'Bill OCR service unavailable',
        detail:  msg,
      });
    }
  }

  // ─── POST /engineering/energy/analyze ─────────────────────────────────────

  @Post('energy/analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تحلیل دستی مصرف انرژی (Proxy)' })
  async analyzeEnergy(@Req() req: any, @Res() reply: any) {
    return this._proxyJson(
      req, reply,
      `${process.env['ENGINEERING_SERVICE_URL'] ?? 'http://localhost:8001'}/api/v1/engineering/energy/analyze`,
    );
  }

  // ─── POST /engineering/energy/manual-analyze ──────────────────────────────
  // ورود دستی داده قبض → تحلیل مستقیم (بدون OCR)

  @Post('energy/manual-analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'تحلیل قبض با ورود دستی (Proxy)',
    description: 'وقتی OCR موفق نشد — داده مستقیم از فرم به Python ارسال می‌شود',
  })
  async manualAnalyze(@Req() req: any, @Res() reply: any) {
    return this._proxyJson(
      req, reply,
      `${process.env['ENGINEERING_SERVICE_URL'] ?? 'http://localhost:8001'}/api/v1/engineering/energy/manual-analyze`,
    );
  }

  // ─── POST /engineering/energy/ocr-preview ─────────────────────────────────

  @Post('energy/ocr-preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'پیش‌نمایش OCR قبض (Proxy)' })
  async ocrPreview(@Req() req: any, @Res() reply: any) {
    const PYTHON_URL = process.env['ENGINEERING_SERVICE_URL'] ?? 'http://localhost:8001';
    const targetUrl  = `${PYTHON_URL}/api/v1/engineering/energy/ocr-preview`;
    try {
      if (!req.isMultipart?.()) {
        return reply.status(400).send({ success: false, error: 'multipart required' });
      }
      const chunks: Buffer[] = [];
      for await (const chunk of req.raw) chunks.push(Buffer.from(chunk));
      const rawBody = Buffer.concat(chunks);
      const pythonRes = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type':   req.headers['content-type'] ?? '',
          'Content-Length': String(rawBody.length),
        },
        body: rawBody,
        signal: AbortSignal.timeout(60_000),
      });
      const data = await pythonRes.json();
      reply.status(pythonRes.ok ? 200 : pythonRes.status).send(data);
    } catch (err) {
      reply.status(503).send({ success: false, error: 'Engineering service unavailable' });
    }
  }

  // ─── helper: proxy JSON body ──────────────────────────────────────────────

  private async _proxyJson(req: any, reply: any, targetUrl: string) {
    try {
      const body       = req.body ?? {};
      const pythonRes  = await fetch(targetUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
        signal:  AbortSignal.timeout(30_000),
      });
      const data = await pythonRes.json().catch(() => ({}));
      reply
        .status(pythonRes.ok ? 200 : pythonRes.status)
        .header('Content-Type', 'application/json')
        .send(data);
    } catch (err) {
      reply.status(503).send({
        success: false,
        error:   { code: 'SERVICE_UNAVAILABLE', message: 'Engineering service unavailable' },
      });
    }
  }
}
