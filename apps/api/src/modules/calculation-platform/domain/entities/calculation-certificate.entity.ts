import { randomUUID } from 'crypto';

export type CertificateStatus = 'valid' | 'revoked';

export class CalculationCertificateEntity {
  private constructor(
    public readonly id: string,
    public readonly resultId: string,
    public readonly certificateId: string,
    public readonly calculationHash: string,
    public readonly inputHash: string,
    public readonly formulaVersion: string,
    public readonly standardVersion: string,
    public readonly aiProvider: string | null,
    public readonly confidence: number | null,
    public readonly operator: string,
    public readonly workspaceId: string,
    public status: CertificateStatus,
    public readonly generatedAt: Date,
  ) {}

  static create(data: {
    resultId: string;
    certificateId: string;
    calculationHash: string;
    inputHash: string;
    formulaVersion: string;
    standardVersion: string;
    aiProvider?: string | null;
    confidence?: number | null;
    operator: string;
    workspaceId: string;
  }): CalculationCertificateEntity {
    return new CalculationCertificateEntity(
      randomUUID(),
      data.resultId,
      data.certificateId,
      data.calculationHash,
      data.inputHash,
      data.formulaVersion,
      data.standardVersion,
      data.aiProvider ?? null,
      data.confidence ?? null,
      data.operator,
      data.workspaceId,
      'valid',
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    result_id: string;
    certificate_id: string;
    calculation_hash: string;
    input_hash: string;
    formula_version: string;
    standard_version: string;
    ai_provider: string | null;
    confidence: number | null;
    operator: string;
    workspace_id: string;
    status: string;
    generated_at: Date;
  }): CalculationCertificateEntity {
    return new CalculationCertificateEntity(
      data.id,
      data.result_id,
      data.certificate_id,
      data.calculation_hash,
      data.input_hash,
      data.formula_version,
      data.standard_version,
      data.ai_provider,
      data.confidence,
      data.operator,
      data.workspace_id,
      data.status as CertificateStatus,
      data.generated_at,
    );
  }

  revoke(): void {
    this.status = 'revoked';
  }
}
