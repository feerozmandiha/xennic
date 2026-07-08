import type { KnowledgePipelineRun } from '../entities/knowledge-pipeline-run.entity.js';

export interface IPipelineRunRepository {
  create(entity: KnowledgePipelineRun): Promise<KnowledgePipelineRun>;
  findById(id: string): Promise<KnowledgePipelineRun | null>;
  findByDocument(documentId: string): Promise<KnowledgePipelineRun[]>;
  findRunningByStage(stage: string): Promise<KnowledgePipelineRun[]>;
  update(entity: KnowledgePipelineRun): Promise<KnowledgePipelineRun>;
}
