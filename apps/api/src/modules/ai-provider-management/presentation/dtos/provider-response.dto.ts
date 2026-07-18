import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AIProviderEntity } from '../../domain/entities/ai-provider.entity.js';

export class ProviderResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() displayName!: string;
  @ApiProperty() providerType!: string;
  @ApiPropertyOptional() baseUrl?: string;
  @ApiPropertyOptional() orgId?: string;
  @ApiProperty() status!: string;
  @ApiProperty() enabled!: boolean;
  @ApiProperty() priority!: number;
  @ApiProperty() defaultWeight!: number;
  @ApiProperty() visibility!: string;
  @ApiProperty() headers!: Record<string, string>;
  @ApiProperty() metadata!: Record<string, unknown>;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;

  static fromEntity(entity: AIProviderEntity): ProviderResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      displayName: entity.displayName,
      providerType: entity.providerType,
      baseUrl: entity.baseUrl ?? undefined,
      orgId: entity.orgId ?? undefined,
      status: entity.status,
      enabled: entity.enabled,
      priority: entity.priority,
      defaultWeight: entity.defaultWeight,
      visibility: entity.visibility,
      headers: entity.headers,
      metadata: entity.metadata,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static fromEntities(entities: AIProviderEntity[]): ProviderResponseDto[] {
    return entities.map((e) => ProviderResponseDto.fromEntity(e));
  }
}
