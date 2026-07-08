import type { CalculationCertificateEntity } from '../../domain/entities/calculation-certificate.entity.js';

export interface ICertificateRepository {
  findById(id: string): Promise<CalculationCertificateEntity | null>;
  findByCertificateId(certificateId: string): Promise<CalculationCertificateEntity | null>;
  findByResultId(resultId: string): Promise<CalculationCertificateEntity | null>;
  findByWorkspaceId(workspaceId: string, options?: { page?: number; limit?: number }): Promise<{ data: CalculationCertificateEntity[]; total: number }>;
  save(certificate: CalculationCertificateEntity): Promise<void>;
}

export const ICERTIFICATE_REPOSITORY = 'ICertificateRepository';
