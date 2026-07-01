import { Controller, Post, Get, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EncryptionService } from '../../application/services/encryption.service.js';
import { AuditLogService } from '../../application/services/audit-log.service.js';
import { SignedUrlService } from '../../application/services/signed-url.service.js';
import { AuditLogQueryDto, EncryptDto, DecryptDto, SignedUrlRequestDto } from '../dtos/security.dto.js';

@ApiTags('security')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('security')
export class SecurityController {
  constructor(
    private readonly encryption: EncryptionService,
    private readonly auditLog: AuditLogService,
    private readonly signedUrl: SignedUrlService,
  ) {}

  @Post('encrypt')
  @ApiOperation({ summary: 'Encrypt data' })
  async encrypt(@Body() dto: EncryptDto) {
    const data = await this.encryption.encrypt(dto.plaintext, dto.context);
    return { success: true, data };
  }

  @Post('decrypt')
  @ApiOperation({ summary: 'Decrypt data' })
  async decrypt(@Body() dto: DecryptDto) {
    const plaintext = await this.encryption.decrypt({
      iv: dto.iv, ciphertext: dto.ciphertext, tag: dto.tag,
      algorithm: dto.algorithm as any, keyId: dto.keyId,
    }, dto.context);
    return { success: true, data: { plaintext } };
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Query audit logs' })
  async queryAuditLogs(@Query() query: AuditLogQueryDto) {
    const result = await this.auditLog.query({
      ...query,
      severity: query.severity as any,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      page: query.page,
      limit: query.limit,
    });
    return { success: true, data: result };
  }

  @Post('signed-url')
  @ApiOperation({ summary: 'Generate signed URL' })
  async generateSignedUrl(@Body() dto: SignedUrlRequestDto) {
    const result = await this.signedUrl.generate(dto);
    return { success: true, data: result };
  }
}
