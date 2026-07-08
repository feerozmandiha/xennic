import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { CertificateService } from '../../application/services/certificate.service.js';
import { CertificateResponseDto } from '../dtos/certificate-response.dto.js';

@ApiTags('Calculations - Certificates')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('calculations/certificates')
export class CalculationCertificatesController {
  constructor(
    private readonly certificateService: CertificateService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate by ID' })
  async getById(@Param('id') id: string) {
    const entity = await this.certificateService.getCertificate(id);
    return { success: true, data: CertificateResponseDto.fromEntity(entity) };
  }

  @Get('by-certificate/:certificateId')
  @ApiOperation({ summary: 'Get certificate by certificate ID' })
  async getByCertificateId(@Param('certificateId') certificateId: string) {
    const entity = await this.certificateService.getCertificateByCertificateId(certificateId);
    return { success: true, data: CertificateResponseDto.fromEntity(entity) };
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: 'Revoke a certificate' })
  async revoke(@Param('id') id: string) {
    const entity = await this.certificateService.revokeCertificate(id);
    return { success: true, data: CertificateResponseDto.fromEntity(entity) };
  }
}
