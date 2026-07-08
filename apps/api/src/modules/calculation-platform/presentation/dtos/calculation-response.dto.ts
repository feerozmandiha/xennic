import type { CalculationCategoryEntity } from '../../domain/entities/calculation-category.entity.js';
import type { CalculationDefinitionEntity } from '../../domain/entities/calculation-definition.entity.js';
import type { CalculationVersionEntity } from '../../domain/entities/calculation-version.entity.js';
import type { CalculationResultEntity } from '../../domain/entities/calculation-result.entity.js';

export class CategoryResponseDto {
  id!: string; name!: string; slug!: string; description!: string | null;
  parentId!: string | null; icon!: string | null; sortOrder!: number;
  createdAt!: string; updatedAt!: string;

  static fromEntity(entity: CalculationCategoryEntity): CategoryResponseDto {
    return { id: entity.id, name: entity.name, slug: entity.slug, description: entity.description, parentId: entity.parentId, icon: entity.icon, sortOrder: entity.sortOrder, createdAt: entity.createdAt.toISOString(), updatedAt: entity.updatedAt.toISOString() };
  }
  static fromEntities(entities: CalculationCategoryEntity[]): CategoryResponseDto[] {
    return entities.map(CategoryResponseDto.fromEntity);
  }
}

export class DefinitionResponseDto {
  id!: string; categoryId!: string; slug!: string; name!: string;
  description!: string | null; standard!: string | null; standardRef!: string | null;
  enabled!: boolean; aiReview!: boolean; certificate!: boolean;
  createdAt!: string; updatedAt!: string;

  static fromEntity(entity: CalculationDefinitionEntity): DefinitionResponseDto {
    return { id: entity.id, categoryId: entity.categoryId, slug: entity.slug, name: entity.name, description: entity.description, standard: entity.standard, standardRef: entity.standardRef, enabled: entity.enabled, aiReview: entity.aiReview, certificate: entity.certificate, createdAt: entity.createdAt.toISOString(), updatedAt: entity.updatedAt.toISOString() };
  }
  static fromEntities(entities: CalculationDefinitionEntity[]): DefinitionResponseDto[] {
    return entities.map(DefinitionResponseDto.fromEntity);
  }
}

export class VersionResponseDto {
  id!: string; definitionId!: string; version!: string; status!: string;
  changeLog!: string | null; publishedAt!: string | null; createdBy!: string;
  createdAt!: string;

  static fromEntity(entity: CalculationVersionEntity): VersionResponseDto {
    return { id: entity.id, definitionId: entity.definitionId, version: entity.version, status: entity.status, changeLog: entity.changeLog, publishedAt: entity.publishedAt?.toISOString() ?? null, createdBy: entity.createdBy, createdAt: entity.createdAt.toISOString() };
  }
  static fromEntities(entities: CalculationVersionEntity[]): VersionResponseDto[] {
    return entities.map(VersionResponseDto.fromEntity);
  }
}

export class ResultResponseDto {
  id!: string; workspaceId!: string; definitionId!: string | null;
  userId!: string; status!: string; errorMessage!: string | null;
  engineVersion!: string; durationMs!: number | null;
  confidence!: number | null; executedAt!: string; createdAt!: string;

  static fromEntity(entity: CalculationResultEntity): ResultResponseDto {
    return { id: entity.id, workspaceId: entity.workspaceId, definitionId: entity.definitionId, userId: entity.userId, status: entity.status, errorMessage: entity.errorMessage, engineVersion: entity.engineVersion, durationMs: entity.durationMs, confidence: entity.confidence, executedAt: entity.executedAt.toISOString(), createdAt: entity.createdAt.toISOString() };
  }
  static fromEntities(entities: CalculationResultEntity[]): ResultResponseDto[] {
    return entities.map(ResultResponseDto.fromEntity);
  }
}
