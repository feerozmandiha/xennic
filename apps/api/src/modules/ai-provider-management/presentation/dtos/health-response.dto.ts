import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderHealthEntity } from '../../domain/entities/provider-health.entity.js';

export class HealthResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() providerId!: string;
  @ApiProperty() status!: string;
  @ApiPropertyOptional() latencyMs?: number;
  @ApiPropertyOptional() errorMsg?: string;
  @ApiProperty() checkedAt!: string;

  static fromEntity(entity: ProviderHealthEntity): HealthResponseDto {
    return {
      id: entity.id,
      providerId: entity.providerId,
      status: entity.status,
      latencyMs: entity.latencyMs ?? undefined,
      errorMsg: entity.errorMsg ?? undefined,
      checkedAt: entity.checkedAt.toISOString(),
    };
  }

  static fromEntities(entities: ProviderHealthEntity[]): HealthResponseDto[] {
    return entities.map(e => HealthResponseDto.fromEntity(e));
  }
}
