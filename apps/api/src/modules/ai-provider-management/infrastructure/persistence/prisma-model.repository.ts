import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IModelRepository } from '../../application/ports/model-repository.interface.js';
import { AIModelEntity, ModelType } from '../../domain/entities/ai-model.entity.js';

const prisma = new PrismaClient();

@Injectable()
export class PrismaModelRepository implements IModelRepository {
  async findById(id: string): Promise<AIModelEntity | null> {
    const row = await prisma.ai_models.findUnique({ where: { id } });
    if (!row) return null;
    return AIModelEntity.reconstitute(row);
  }

  async findByProviderId(providerId: string): Promise<AIModelEntity[]> {
    const rows = await prisma.ai_models.findMany({
      where: { provider_id: providerId, deleted_at: null },
      orderBy: { model_id: 'asc' },
    });
    return rows.map(r => AIModelEntity.reconstitute(r));
  }

  async findByModelId(providerId: string, modelId: string): Promise<AIModelEntity | null> {
    const row = await prisma.ai_models.findUnique({
      where: { provider_id_model_id: { provider_id: providerId, model_id: modelId } },
    });
    if (!row) return null;
    return AIModelEntity.reconstitute(row);
  }

  async findByType(type: ModelType, options?: { enabledOnly?: boolean }): Promise<AIModelEntity[]> {
    const where: any = { model_type: type, deleted_at: null };
    if (options?.enabledOnly) where.enabled = true;
    const rows = await prisma.ai_models.findMany({ where });
    return rows.map(r => AIModelEntity.reconstitute(r));
  }

  async findAll(options?: { enabledOnly?: boolean; includeDeleted?: boolean }): Promise<AIModelEntity[]> {
    const where: any = {};
    if (!options?.includeDeleted) where.deleted_at = null;
    if (options?.enabledOnly) where.enabled = true;
    const rows = await prisma.ai_models.findMany({ where, orderBy: { model_id: 'asc' } });
    return rows.map(r => AIModelEntity.reconstitute(r));
  }

  async save(model: AIModelEntity): Promise<void> {
    await prisma.ai_models.upsert({
      where: { id: model.id },
      update: {
        display_name: model.displayName,
        context_window: model.contextWindow,
        max_output_tokens: model.maxOutputTokens,
        supports_tools: model.supportsTools,
        supports_json: model.supportsJson,
        supports_streaming: model.supportsStreaming,
        supports_reasoning: model.supportsReasoning,
        supports_temperature: model.supportsTemperature,
        supports_top_p: model.supportsTopP,
        supports_seed: model.supportsSeed,
        supports_structured_outputs: model.supportsStructuredOutputs,
        supports_vision: model.supportsVision,
        supports_embedding: model.supportsEmbedding,
        supports_function_calling: model.supportsFunctionCalling,
        supports_image_input: model.supportsImageInput,
        supports_audio_input: model.supportsAudioInput,
        supports_transcription: model.supportsTranscription,
        supports_translation: model.supportsTranslation,
        supports_reranking: model.supportsReranking,
        pricing_input: model.pricingInput,
        pricing_output: model.pricingOutput,
        status: model.status,
        enabled: model.enabled,
        updated_at: model.updatedAt,
        deleted_at: model.deletedAt,
      },
      create: {
        id: model.id,
        provider_id: model.providerId,
        model_id: model.modelId,
        display_name: model.displayName,
        model_type: model.modelType,
        context_window: model.contextWindow,
        max_output_tokens: model.maxOutputTokens,
        supports_tools: model.supportsTools,
        supports_json: model.supportsJson,
        supports_streaming: model.supportsStreaming,
        supports_reasoning: model.supportsReasoning,
        supports_temperature: model.supportsTemperature,
        supports_top_p: model.supportsTopP,
        supports_seed: model.supportsSeed,
        supports_structured_outputs: model.supportsStructuredOutputs,
        supports_vision: model.supportsVision,
        supports_embedding: model.supportsEmbedding,
        supports_function_calling: model.supportsFunctionCalling,
        supports_image_input: model.supportsImageInput,
        supports_audio_input: model.supportsAudioInput,
        supports_transcription: model.supportsTranscription,
        supports_translation: model.supportsTranslation,
        supports_reranking: model.supportsReranking,
        pricing_input: model.pricingInput,
        pricing_output: model.pricingOutput,
        status: model.status,
        enabled: model.enabled,
        created_at: model.createdAt,
        updated_at: model.updatedAt,
        deleted_at: model.deletedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.ai_models.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async existsByModelId(providerId: string, modelId: string): Promise<boolean> {
    const count = await prisma.ai_models.count({
      where: { provider_id: providerId, model_id: modelId },
    });
    return count > 0;
  }
}
