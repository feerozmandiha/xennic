import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { ICertificateRepository } from '../../application/ports/certificate-repository.interface.js';
import { CalculationCertificateEntity } from '../../domain/entities/calculation-certificate.entity.js';

@Injectable()
export class PrismaCertificateRepository implements ICertificateRepository {
  private readonly logger = new Logger(PrismaCertificateRepository.name);

  async findById(id: string): Promise<CalculationCertificateEntity | null> {
    const row = await prisma.calculation_certificates.findUnique({ where: { id } });
    return row ? CalculationCertificateEntity.reconstitute(row) : null;
  }

  async findByCertificateId(certificateId: string): Promise<CalculationCertificateEntity | null> {
    const row = await prisma.calculation_certificates.findUnique({
      where: { certificate_id: certificateId },
    });
    return row ? CalculationCertificateEntity.reconstitute(row) : null;
  }

  async findByResultId(resultId: string): Promise<CalculationCertificateEntity | null> {
    const row = await prisma.calculation_certificates.findUnique({
      where: { result_id: resultId },
    });
    return row ? CalculationCertificateEntity.reconstitute(row) : null;
  }

  async findByWorkspaceId(
    workspaceId: string,
    options?: { page?: number; limit?: number },
  ): Promise<{ data: CalculationCertificateEntity[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const where = { workspace_id: workspaceId };
    const [rows, total] = await Promise.all([
      prisma.calculation_certificates.findMany({
        where,
        orderBy: { generated_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.calculation_certificates.count({ where }),
    ]);
    return { data: rows.map(CalculationCertificateEntity.reconstitute), total };
  }

  async save(certificate: CalculationCertificateEntity): Promise<void> {
    await prisma.calculation_certificates.upsert({
      where: { id: certificate.id },
      update: { status: certificate.status },
      create: {
        id: certificate.id,
        result_id: certificate.resultId,
        certificate_id: certificate.certificateId,
        calculation_hash: certificate.calculationHash,
        input_hash: certificate.inputHash,
        formula_version: certificate.formulaVersion,
        standard_version: certificate.standardVersion,
        ai_provider: certificate.aiProvider,
        confidence: certificate.confidence,
        operator: certificate.operator,
        workspace_id: certificate.workspaceId,
        status: certificate.status,
        generated_at: certificate.generatedAt,
      },
    });
  }
}
