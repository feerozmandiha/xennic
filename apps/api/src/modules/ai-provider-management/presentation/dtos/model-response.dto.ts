import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AIModelEntity } from '../../domain/entities/ai-model.entity.js';

export class ModelResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() providerId!: string;
  @ApiProperty() modelId!: string;
  @ApiProperty() displayName!: string;
  @ApiProperty() modelType!: string;
  @ApiPropertyOptional() contextWindow?: number;
  @ApiPropertyOptional() maxOutputTokens?: number;
  @ApiProperty() supportsTools!: boolean;
  @ApiProperty() supportsJson!: boolean;
  @ApiProperty() supportsStreaming!: boolean;
  @ApiProperty() supportsReasoning!: boolean;
  @ApiProperty() supportsVision!: boolean;
  @ApiProperty() supportsEmbedding!: boolean;
  @ApiProperty() supportsFunctionCalling!: boolean;
  @ApiPropertyOptional() pricingInput?: number;
  @ApiPropertyOptional() pricingOutput?: number;
  @ApiProperty() status!: string;
  @ApiProperty() enabled!: boolean;
  @ApiProperty() createdAt!: string;

  static fromEntity(entity: AIModelEntity): ModelResponseDto {
    return {
      id: entity.id,
      providerId: entity.providerId,
      modelId: entity.modelId,
      displayName: entity.displayName,
      modelType: entity.modelType,
      contextWindow: entity.contextWindow ?? undefined,
      maxOutputTokens: entity.maxOutputTokens ?? undefined,
      supportsTools: entity.supportsTools,
      supportsJson: entity.supportsJson,
      supportsStreaming: entity.supportsStreaming,
      supportsReasoning: entity.supportsReasoning,
      supportsVision: entity.supportsVision,
      supportsEmbedding: entity.supportsEmbedding,
      supportsFunctionCalling: entity.supportsFunctionCalling,
      pricingInput: entity.pricingInput ?? undefined,
      pricingOutput: entity.pricingOutput ?? undefined,
      status: entity.status,
      enabled: entity.enabled,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  static fromEntities(entities: AIModelEntity[]): ModelResponseDto[] {
    return entities.map(e => ModelResponseDto.fromEntity(e));
  }
}
