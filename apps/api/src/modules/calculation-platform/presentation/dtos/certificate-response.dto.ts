import type { CalculationCertificateEntity } from '../../domain/entities/calculation-certificate.entity.js';

export class CertificateResponseDto {
  id!: string;
  certificateId!: string;
  resultId!: string;
  calculationHash!: string;
  inputHash!: string;
  formulaVersion!: string;
  standardVersion!: string;
  aiProvider!: string | null;
  confidence!: number | null;
  operator!: string;
  status!: string;
  generatedAt!: string;

  static fromEntity(entity: CalculationCertificateEntity): CertificateResponseDto {
    return {
      id: entity.id,
      certificateId: entity.certificateId,
      resultId: entity.resultId,
      calculationHash: entity.calculationHash,
      inputHash: entity.inputHash,
      formulaVersion: entity.formulaVersion,
      standardVersion: entity.standardVersion,
      aiProvider: entity.aiProvider,
      confidence: entity.confidence,
      operator: entity.operator,
      status: entity.status,
      generatedAt: entity.generatedAt.toISOString(),
    };
  }
  static fromEntities(entities: CalculationCertificateEntity[]): CertificateResponseDto[] {
    return entities.map(CertificateResponseDto.fromEntity);
  }
}
