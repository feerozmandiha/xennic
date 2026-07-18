import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { ICERTIFICATE_REPOSITORY } from '../ports/certificate-repository.interface.js';
import type { ICertificateRepository } from '../ports/certificate-repository.interface.js';
import { CalculationCertificateEntity } from '../../domain/entities/calculation-certificate.entity.js';
import type { CalculationDefinitionEntity } from '../../domain/entities/calculation-definition.entity.js';
import type { CalculationVersionEntity } from '../../domain/entities/calculation-version.entity.js';
import { createHash } from 'crypto';

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);

  constructor(
    @Inject(ICERTIFICATE_REPOSITORY)
    private readonly repo: ICertificateRepository,
  ) {}

  async generateCertificate(data: {
    resultId: string;
    definition: CalculationDefinitionEntity;
    version: CalculationVersionEntity;
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
    userId: string;
    workspaceId: string;
    aiProvider?: string | null;
    confidence?: number | null;
  }): Promise<CalculationCertificateEntity> {
    const calculationHash = createHash('sha256')
      .update(
        JSON.stringify({
          definition: data.definition.slug,
          version: data.version.version,
          outputs: data.outputs,
        }),
      )
      .digest('hex');

    const inputHash = createHash('sha256').update(JSON.stringify(data.inputs)).digest('hex');

    const certId = `CERT-${data.definition.slug.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const entity = CalculationCertificateEntity.create({
      resultId: data.resultId,
      certificateId: certId,
      calculationHash,
      inputHash,
      formulaVersion: data.version.version,
      standardVersion: data.definition.standard ?? 'N/A',
      aiProvider: data.aiProvider,
      confidence: data.confidence,
      operator: data.userId,
      workspaceId: data.workspaceId,
    });

    await this.repo.save(entity);
    this.logger.log(`Certificate generated: ${certId} for result ${data.resultId}`);
    return entity;
  }

  async getCertificate(id: string): Promise<CalculationCertificateEntity> {
    const entity = await this.repo.findById(id);
    if (!entity) throw new NotFoundException(`Certificate ${id} not found`);
    return entity;
  }

  async getCertificateByResultId(resultId: string): Promise<CalculationCertificateEntity | null> {
    return this.repo.findByResultId(resultId);
  }

  async getCertificateByCertificateId(
    certificateId: string,
  ): Promise<CalculationCertificateEntity> {
    const entity = await this.repo.findByCertificateId(certificateId);
    if (!entity) throw new NotFoundException(`Certificate '${certificateId}' not found`);
    return entity;
  }

  async getCertificatesByWorkspace(
    workspaceId: string,
    options?: { page?: number; limit?: number },
  ) {
    return this.repo.findByWorkspaceId(workspaceId, options);
  }

  async revokeCertificate(id: string): Promise<CalculationCertificateEntity> {
    const entity = await this.getCertificate(id);
    entity.revoke();
    await this.repo.save(entity);
    return entity;
  }
}
