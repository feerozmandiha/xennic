/*
  Warnings:

  - You are about to drop the `article_comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `article_translations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `articles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "article_comments" DROP CONSTRAINT "article_comments_article_id_fkey";

-- DropForeignKey
ALTER TABLE "article_comments" DROP CONSTRAINT "article_comments_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "article_comments" DROP CONSTRAINT "article_comments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "article_translations" DROP CONSTRAINT "article_translations_article_id_fkey";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "category" TEXT,
ADD COLUMN     "specifications" JSONB;

-- DropTable
DROP TABLE "article_comments";

-- DropTable
DROP TABLE "article_translations";

-- DropTable
DROP TABLE "articles";

-- CreateTable
CREATE TABLE "knowledge_documents" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage_path" TEXT,
    "document_type" TEXT NOT NULL DEFAULT 'pdf',
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "classification" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "published_knowledge_id" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_document_chunks" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "token_count" INTEGER NOT NULL,
    "page_number" INTEGER,
    "section" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "embedding_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_pipeline_runs" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "duration_ms" INTEGER,

    CONSTRAINT "knowledge_pipeline_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_extractions" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "language" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_extractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_graph_nodes" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "label" TEXT,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "embedding_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_graph_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_graph_edges" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_graph_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_graph_metrics" (
    "id" TEXT NOT NULL,
    "node_id" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "freshness" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "authority" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "completeness" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "access_count" INTEGER NOT NULL DEFAULT 0,
    "last_accessed_at" TIMESTAMP(3),
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_graph_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ontologies" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ontologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ontology_classes" (
    "id" TEXT NOT NULL,
    "ontology_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "uri" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_abstract" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ontology_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ontology_relations" (
    "id" TEXT NOT NULL,
    "ontology_id" TEXT NOT NULL,
    "source_uri" TEXT NOT NULL,
    "target_uri" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ontology_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_citations" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "context" TEXT,
    "location" TEXT,
    "method" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_citations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_similarities" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_similarities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_clusters" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "node_ids" JSONB NOT NULL DEFAULT '[]',
    "properties" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "provider_type" TEXT NOT NULL,
    "base_url" TEXT,
    "org_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "default_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "visibility" TEXT NOT NULL DEFAULT 'global',
    "headers" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "model_type" TEXT NOT NULL,
    "context_window" INTEGER,
    "max_output_tokens" INTEGER,
    "supports_tools" BOOLEAN NOT NULL DEFAULT false,
    "supports_json" BOOLEAN NOT NULL DEFAULT false,
    "supports_streaming" BOOLEAN NOT NULL DEFAULT true,
    "supports_reasoning" BOOLEAN NOT NULL DEFAULT false,
    "supports_temperature" BOOLEAN NOT NULL DEFAULT true,
    "supports_top_p" BOOLEAN NOT NULL DEFAULT true,
    "supports_seed" BOOLEAN NOT NULL DEFAULT false,
    "supports_structured_outputs" BOOLEAN NOT NULL DEFAULT false,
    "supports_vision" BOOLEAN NOT NULL DEFAULT false,
    "supports_embedding" BOOLEAN NOT NULL DEFAULT false,
    "supports_function_calling" BOOLEAN NOT NULL DEFAULT false,
    "supports_image_input" BOOLEAN NOT NULL DEFAULT false,
    "supports_audio_input" BOOLEAN NOT NULL DEFAULT false,
    "supports_transcription" BOOLEAN NOT NULL DEFAULT false,
    "supports_translation" BOOLEAN NOT NULL DEFAULT false,
    "supports_reranking" BOOLEAN NOT NULL DEFAULT false,
    "pricing_input" DOUBLE PRECISION,
    "pricing_output" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'active',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_provider_credentials" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "credential_type" TEXT NOT NULL,
    "encrypted_value" TEXT NOT NULL,
    "masked_value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_provider_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_provider_health" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latency_ms" INTEGER,
    "error_msg" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_provider_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_provider_usage" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "model_id" TEXT,
    "request_count" INTEGER NOT NULL DEFAULT 0,
    "prompt_tokens" BIGINT NOT NULL DEFAULT 0,
    "completion_tokens" BIGINT NOT NULL DEFAULT 0,
    "total_tokens" BIGINT NOT NULL DEFAULT 0,
    "estimated_cost" DOUBLE PRECISION,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "workspace_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_provider_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_provider_statistics" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "total_requests" INTEGER NOT NULL DEFAULT 0,
    "avg_latency_ms" DOUBLE PRECISION,
    "p50_latency_ms" DOUBLE PRECISION,
    "p95_latency_ms" DOUBLE PRECISION,
    "p99_latency_ms" DOUBLE PRECISION,
    "success_rate" DOUBLE PRECISION,
    "time_period" TEXT NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_provider_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_provider_quotas" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "requests_per_min" INTEGER NOT NULL DEFAULT 60,
    "tokens_per_min" INTEGER NOT NULL DEFAULT 100000,
    "concurrent_max" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_provider_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_provider_model_capabilities" (
    "id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "capability" TEXT NOT NULL,
    "supported" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_provider_model_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_routing_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "policy_type" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "workspace_id" TEXT,
    "feature_flag" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_routing_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_routing_rules" (
    "id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "model_id" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "conditions" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_routing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_feature_flags" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "provider_id" TEXT,
    "model_id" TEXT,
    "feature" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_audit_log" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "performed_by" TEXT NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspace_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "ai_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "context_cache" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "scope" TEXT NOT NULL,
    "scope_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "context_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memories" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "type" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "scope_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "tags" TEXT[],
    "embedding" DOUBLE PRECISION[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_indexes" (
    "id" TEXT NOT NULL,
    "memory_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_indexes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_registry" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "tags" TEXT[],
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_policies" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "effect" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_registry" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "schema" JSONB NOT NULL,
    "permissions" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "health" TEXT NOT NULL DEFAULT 'unknown',
    "endpoint" TEXT,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_registry" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "dependencies" JSONB NOT NULL,
    "inputs" JSONB NOT NULL,
    "outputs" JSONB NOT NULL,
    "policies" TEXT[],
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policies" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "scope_id" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "effect" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conditions" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reasoning_plans" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "goal" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reasoning_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reasoning_graphs" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reasoning_graphs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_benchmarks" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,
    "metrics" TEXT[],
    "tags" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_datasets" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "items" JSONB NOT NULL,
    "tags" TEXT[],
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_datasets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_runs" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "benchmark_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "results" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "triggers" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_templates" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[],
    "definition" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_executions" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "workflow_id" TEXT NOT NULL,
    "workflow_name" TEXT NOT NULL,
    "workflow_version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compensation_entries" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "execution_id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payload" JSONB,
    "error" TEXT,
    "executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compensation_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_contexts" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "execution_id" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "execution_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_artifacts" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "execution_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "execution_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_memories" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "execution_id" TEXT NOT NULL,
    "entries" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "execution_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_plans" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "goal" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "execution_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_steps" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "order" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input" JSONB,
    "output" JSONB,
    "depends_on" TEXT[],
    "assigned_to" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_stores" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "conversation_id" TEXT NOT NULL,
    "execution_id" TEXT,
    "session_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_entries" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "execution_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "execution_id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requested_by" TEXT NOT NULL,
    "assigned_to" TEXT,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_tasks" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "execution_id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewer_id" TEXT NOT NULL,
    "feedback" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coordination_plans" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "execution_id" TEXT NOT NULL,
    "plan" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coordination_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coordination_tasks" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "agent_role" TEXT,
    "task_type" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assigned_to" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coordination_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_logs" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "execution_id" TEXT NOT NULL,
    "step_id" TEXT,
    "decision_type" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confidence_scores" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "execution_id" TEXT NOT NULL,
    "step_id" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "confidence_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_sessions" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "metadata" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_runtime_memories" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_runtime_memories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "knowledge_documents_workspace_id_idx" ON "knowledge_documents"("workspace_id");

-- CreateIndex
CREATE INDEX "knowledge_documents_status_idx" ON "knowledge_documents"("status");

-- CreateIndex
CREATE INDEX "knowledge_documents_document_type_idx" ON "knowledge_documents"("document_type");

-- CreateIndex
CREATE INDEX "knowledge_documents_created_at_idx" ON "knowledge_documents"("created_at");

-- CreateIndex
CREATE INDEX "knowledge_document_chunks_document_id_idx" ON "knowledge_document_chunks"("document_id");

-- CreateIndex
CREATE INDEX "knowledge_document_chunks_embedding_id_idx" ON "knowledge_document_chunks"("embedding_id");

-- CreateIndex
CREATE INDEX "knowledge_pipeline_runs_document_id_idx" ON "knowledge_pipeline_runs"("document_id");

-- CreateIndex
CREATE INDEX "knowledge_pipeline_runs_stage_idx" ON "knowledge_pipeline_runs"("stage");

-- CreateIndex
CREATE INDEX "knowledge_pipeline_runs_status_idx" ON "knowledge_pipeline_runs"("status");

-- CreateIndex
CREATE INDEX "knowledge_pipeline_runs_started_at_idx" ON "knowledge_pipeline_runs"("started_at");

-- CreateIndex
CREATE INDEX "knowledge_extractions_document_id_idx" ON "knowledge_extractions"("document_id");

-- CreateIndex
CREATE INDEX "knowledge_extractions_method_idx" ON "knowledge_extractions"("method");

-- CreateIndex
CREATE INDEX "knowledge_extractions_confidence_idx" ON "knowledge_extractions"("confidence");

-- CreateIndex
CREATE INDEX "knowledge_graph_nodes_workspace_id_idx" ON "knowledge_graph_nodes"("workspace_id");

-- CreateIndex
CREATE INDEX "knowledge_graph_nodes_entity_type_entity_id_idx" ON "knowledge_graph_nodes"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "knowledge_graph_nodes_type_idx" ON "knowledge_graph_nodes"("type");

-- CreateIndex
CREATE INDEX "knowledge_graph_nodes_workspace_id_type_idx" ON "knowledge_graph_nodes"("workspace_id", "type");

-- CreateIndex
CREATE INDEX "knowledge_graph_edges_workspace_id_idx" ON "knowledge_graph_edges"("workspace_id");

-- CreateIndex
CREATE INDEX "knowledge_graph_edges_source_id_idx" ON "knowledge_graph_edges"("source_id");

-- CreateIndex
CREATE INDEX "knowledge_graph_edges_target_id_idx" ON "knowledge_graph_edges"("target_id");

-- CreateIndex
CREATE INDEX "knowledge_graph_edges_type_idx" ON "knowledge_graph_edges"("type");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_graph_edges_source_id_target_id_type_key" ON "knowledge_graph_edges"("source_id", "target_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_graph_metrics_node_id_key" ON "knowledge_graph_metrics"("node_id");

-- CreateIndex
CREATE INDEX "knowledge_graph_metrics_node_id_idx" ON "knowledge_graph_metrics"("node_id");

-- CreateIndex
CREATE INDEX "knowledge_graph_metrics_confidence_idx" ON "knowledge_graph_metrics"("confidence");

-- CreateIndex
CREATE INDEX "knowledge_graph_metrics_freshness_idx" ON "knowledge_graph_metrics"("freshness");

-- CreateIndex
CREATE INDEX "knowledge_graph_metrics_authority_idx" ON "knowledge_graph_metrics"("authority");

-- CreateIndex
CREATE INDEX "knowledge_graph_metrics_completeness_idx" ON "knowledge_graph_metrics"("completeness");

-- CreateIndex
CREATE INDEX "ontologies_workspace_id_idx" ON "ontologies"("workspace_id");

-- CreateIndex
CREATE INDEX "ontologies_slug_idx" ON "ontologies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ontologies_workspace_id_slug_version_key" ON "ontologies"("workspace_id", "slug", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ontology_classes_uri_key" ON "ontology_classes"("uri");

-- CreateIndex
CREATE INDEX "ontology_classes_ontology_id_idx" ON "ontology_classes"("ontology_id");

-- CreateIndex
CREATE INDEX "ontology_classes_parent_id_idx" ON "ontology_classes"("parent_id");

-- CreateIndex
CREATE INDEX "ontology_classes_uri_idx" ON "ontology_classes"("uri");

-- CreateIndex
CREATE INDEX "ontology_relations_ontology_id_idx" ON "ontology_relations"("ontology_id");

-- CreateIndex
CREATE INDEX "ontology_relations_source_uri_idx" ON "ontology_relations"("source_uri");

-- CreateIndex
CREATE INDEX "ontology_relations_target_uri_idx" ON "ontology_relations"("target_uri");

-- CreateIndex
CREATE UNIQUE INDEX "ontology_relations_ontology_id_source_uri_target_uri_relati_key" ON "ontology_relations"("ontology_id", "source_uri", "target_uri", "relation");

-- CreateIndex
CREATE INDEX "knowledge_citations_workspace_id_idx" ON "knowledge_citations"("workspace_id");

-- CreateIndex
CREATE INDEX "knowledge_citations_source_id_idx" ON "knowledge_citations"("source_id");

-- CreateIndex
CREATE INDEX "knowledge_citations_target_id_idx" ON "knowledge_citations"("target_id");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_citations_source_id_target_id_location_key" ON "knowledge_citations"("source_id", "target_id", "location");

-- CreateIndex
CREATE INDEX "document_similarities_workspace_id_idx" ON "document_similarities"("workspace_id");

-- CreateIndex
CREATE INDEX "document_similarities_similarity_idx" ON "document_similarities"("similarity");

-- CreateIndex
CREATE UNIQUE INDEX "document_similarities_source_id_target_id_method_key" ON "document_similarities"("source_id", "target_id", "method");

-- CreateIndex
CREATE INDEX "knowledge_clusters_workspace_id_idx" ON "knowledge_clusters"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_providers_name_key" ON "ai_providers"("name");

-- CreateIndex
CREATE INDEX "ai_providers_status_idx" ON "ai_providers"("status");

-- CreateIndex
CREATE INDEX "ai_providers_enabled_idx" ON "ai_providers"("enabled");

-- CreateIndex
CREATE INDEX "ai_providers_provider_type_idx" ON "ai_providers"("provider_type");

-- CreateIndex
CREATE INDEX "ai_providers_priority_idx" ON "ai_providers"("priority");

-- CreateIndex
CREATE INDEX "ai_providers_deleted_at_idx" ON "ai_providers"("deleted_at");

-- CreateIndex
CREATE INDEX "ai_models_provider_id_idx" ON "ai_models"("provider_id");

-- CreateIndex
CREATE INDEX "ai_models_model_type_idx" ON "ai_models"("model_type");

-- CreateIndex
CREATE INDEX "ai_models_status_idx" ON "ai_models"("status");

-- CreateIndex
CREATE INDEX "ai_models_enabled_idx" ON "ai_models"("enabled");

-- CreateIndex
CREATE INDEX "ai_models_deleted_at_idx" ON "ai_models"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_models_provider_id_model_id_key" ON "ai_models"("provider_id", "model_id");

-- CreateIndex
CREATE INDEX "ai_provider_credentials_provider_id_idx" ON "ai_provider_credentials"("provider_id");

-- CreateIndex
CREATE INDEX "ai_provider_credentials_deleted_at_idx" ON "ai_provider_credentials"("deleted_at");

-- CreateIndex
CREATE INDEX "ai_provider_health_provider_id_idx" ON "ai_provider_health"("provider_id");

-- CreateIndex
CREATE INDEX "ai_provider_health_status_idx" ON "ai_provider_health"("status");

-- CreateIndex
CREATE INDEX "ai_provider_health_checked_at_idx" ON "ai_provider_health"("checked_at");

-- CreateIndex
CREATE INDEX "ai_provider_usage_provider_id_idx" ON "ai_provider_usage"("provider_id");

-- CreateIndex
CREATE INDEX "ai_provider_usage_workspace_id_idx" ON "ai_provider_usage"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_provider_usage_period_start_period_end_idx" ON "ai_provider_usage"("period_start", "period_end");

-- CreateIndex
CREATE INDEX "ai_provider_statistics_provider_id_idx" ON "ai_provider_statistics"("provider_id");

-- CreateIndex
CREATE INDEX "ai_provider_statistics_time_period_idx" ON "ai_provider_statistics"("time_period");

-- CreateIndex
CREATE INDEX "ai_provider_statistics_recorded_at_idx" ON "ai_provider_statistics"("recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_provider_quotas_provider_id_key" ON "ai_provider_quotas"("provider_id");

-- CreateIndex
CREATE INDEX "ai_provider_model_capabilities_model_id_idx" ON "ai_provider_model_capabilities"("model_id");

-- CreateIndex
CREATE INDEX "ai_provider_model_capabilities_capability_idx" ON "ai_provider_model_capabilities"("capability");

-- CreateIndex
CREATE UNIQUE INDEX "ai_provider_model_capabilities_model_id_capability_key" ON "ai_provider_model_capabilities"("model_id", "capability");

-- CreateIndex
CREATE UNIQUE INDEX "ai_routing_policies_name_key" ON "ai_routing_policies"("name");

-- CreateIndex
CREATE INDEX "ai_routing_policies_policy_type_idx" ON "ai_routing_policies"("policy_type");

-- CreateIndex
CREATE INDEX "ai_routing_policies_enabled_idx" ON "ai_routing_policies"("enabled");

-- CreateIndex
CREATE INDEX "ai_routing_policies_workspace_id_idx" ON "ai_routing_policies"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_routing_policies_deleted_at_idx" ON "ai_routing_policies"("deleted_at");

-- CreateIndex
CREATE INDEX "ai_routing_rules_policy_id_idx" ON "ai_routing_rules"("policy_id");

-- CreateIndex
CREATE INDEX "ai_routing_rules_provider_id_idx" ON "ai_routing_rules"("provider_id");

-- CreateIndex
CREATE INDEX "ai_routing_rules_priority_idx" ON "ai_routing_rules"("priority");

-- CreateIndex
CREATE INDEX "ai_feature_flags_workspace_id_idx" ON "ai_feature_flags"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_feature_flags_feature_idx" ON "ai_feature_flags"("feature");

-- CreateIndex
CREATE INDEX "ai_feature_flags_enabled_idx" ON "ai_feature_flags"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "ai_feature_flags_workspace_id_provider_id_model_id_feature_key" ON "ai_feature_flags"("workspace_id", "provider_id", "model_id", "feature");

-- CreateIndex
CREATE INDEX "ai_audit_log_entity_type_entity_id_idx" ON "ai_audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "ai_audit_log_action_idx" ON "ai_audit_log"("action");

-- CreateIndex
CREATE INDEX "ai_audit_log_performed_by_idx" ON "ai_audit_log"("performed_by");

-- CreateIndex
CREATE INDEX "ai_audit_log_performed_at_idx" ON "ai_audit_log"("performed_at");

-- CreateIndex
CREATE INDEX "ai_audit_log_workspace_id_idx" ON "ai_audit_log"("workspace_id");

-- CreateIndex
CREATE INDEX "context_cache_scope_scope_id_idx" ON "context_cache"("scope", "scope_id");

-- CreateIndex
CREATE INDEX "context_cache_scope_scope_id_source_idx" ON "context_cache"("scope", "scope_id", "source");

-- CreateIndex
CREATE INDEX "context_cache_scope_scope_id_key_idx" ON "context_cache"("scope", "scope_id", "key");

-- CreateIndex
CREATE INDEX "memories_type_scope_scope_id_idx" ON "memories"("type", "scope", "scope_id");

-- CreateIndex
CREATE INDEX "memories_scope_scope_id_idx" ON "memories"("scope", "scope_id");

-- CreateIndex
CREATE INDEX "memories_key_idx" ON "memories"("key");

-- CreateIndex
CREATE INDEX "memories_expires_at_idx" ON "memories"("expires_at");

-- CreateIndex
CREATE INDEX "memory_indexes_memory_id_idx" ON "memory_indexes"("memory_id");

-- CreateIndex
CREATE INDEX "memory_indexes_entity_id_idx" ON "memory_indexes"("entity_id");

-- CreateIndex
CREATE INDEX "prompt_registry_status_idx" ON "prompt_registry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_registry_name_version_key" ON "prompt_registry"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_templates_name_version_key" ON "prompt_templates"("name", "version");

-- CreateIndex
CREATE INDEX "prompt_policies_effect_idx" ON "prompt_policies"("effect");

-- CreateIndex
CREATE INDEX "prompt_policies_priority_idx" ON "prompt_policies"("priority");

-- CreateIndex
CREATE INDEX "tool_registry_status_idx" ON "tool_registry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tool_registry_name_version_key" ON "tool_registry"("name", "version");

-- CreateIndex
CREATE INDEX "skill_registry_status_idx" ON "skill_registry"("status");

-- CreateIndex
CREATE INDEX "skill_registry_tags_idx" ON "skill_registry"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "skill_registry_name_version_key" ON "skill_registry"("name", "version");

-- CreateIndex
CREATE INDEX "policies_resource_scope_idx" ON "policies"("resource", "scope");

-- CreateIndex
CREATE INDEX "policies_action_idx" ON "policies"("action");

-- CreateIndex
CREATE INDEX "policies_effect_idx" ON "policies"("effect");

-- CreateIndex
CREATE INDEX "policies_enabled_idx" ON "policies"("enabled");

-- CreateIndex
CREATE INDEX "reasoning_plans_status_idx" ON "reasoning_plans"("status");

-- CreateIndex
CREATE INDEX "reasoning_graphs_plan_id_idx" ON "reasoning_graphs"("plan_id");

-- CreateIndex
CREATE INDEX "evaluation_benchmarks_status_idx" ON "evaluation_benchmarks"("status");

-- CreateIndex
CREATE INDEX "evaluation_runs_benchmark_id_idx" ON "evaluation_runs"("benchmark_id");

-- CreateIndex
CREATE INDEX "evaluation_runs_status_idx" ON "evaluation_runs"("status");

-- CreateIndex
CREATE INDEX "evaluation_runs_target_type_target_id_idx" ON "evaluation_runs"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "workflow_definitions_status_idx" ON "workflow_definitions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_definitions_name_version_key" ON "workflow_definitions"("name", "version");

-- CreateIndex
CREATE INDEX "workflow_templates_category_idx" ON "workflow_templates"("category");

-- CreateIndex
CREATE INDEX "workflow_templates_tags_idx" ON "workflow_templates"("tags");

-- CreateIndex
CREATE INDEX "workflow_executions_workflow_id_idx" ON "workflow_executions"("workflow_id");

-- CreateIndex
CREATE INDEX "workflow_executions_status_idx" ON "workflow_executions"("status");

-- CreateIndex
CREATE INDEX "compensation_entries_execution_id_idx" ON "compensation_entries"("execution_id");

-- CreateIndex
CREATE UNIQUE INDEX "execution_contexts_execution_id_key" ON "execution_contexts"("execution_id");

-- CreateIndex
CREATE INDEX "execution_contexts_execution_id_idx" ON "execution_contexts"("execution_id");

-- CreateIndex
CREATE INDEX "execution_artifacts_execution_id_idx" ON "execution_artifacts"("execution_id");

-- CreateIndex
CREATE UNIQUE INDEX "execution_memories_unique_execution_id" ON "execution_memories"("execution_id");

-- CreateIndex
CREATE INDEX "execution_plans_status_idx" ON "execution_plans"("status");

-- CreateIndex
CREATE INDEX "plan_steps_plan_id_idx" ON "plan_steps"("plan_id");

-- CreateIndex
CREATE INDEX "plan_steps_status_idx" ON "plan_steps"("status");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_stores_conversation_id_key" ON "conversation_stores"("conversation_id");

-- CreateIndex
CREATE INDEX "conversation_stores_execution_id_idx" ON "conversation_stores"("execution_id");

-- CreateIndex
CREATE INDEX "conversation_stores_session_id_idx" ON "conversation_stores"("session_id");

-- CreateIndex
CREATE INDEX "cost_entries_execution_id_idx" ON "cost_entries"("execution_id");

-- CreateIndex
CREATE INDEX "cost_entries_source_type_source_id_idx" ON "cost_entries"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "approval_requests_execution_id_idx" ON "approval_requests"("execution_id");

-- CreateIndex
CREATE INDEX "approval_requests_assigned_to_status_idx" ON "approval_requests"("assigned_to", "status");

-- CreateIndex
CREATE INDEX "review_tasks_execution_id_idx" ON "review_tasks"("execution_id");

-- CreateIndex
CREATE INDEX "review_tasks_reviewer_id_status_idx" ON "review_tasks"("reviewer_id", "status");

-- CreateIndex
CREATE INDEX "coordination_plans_execution_id_idx" ON "coordination_plans"("execution_id");

-- CreateIndex
CREATE INDEX "coordination_tasks_plan_id_idx" ON "coordination_tasks"("plan_id");

-- CreateIndex
CREATE INDEX "coordination_tasks_status_idx" ON "coordination_tasks"("status");

-- CreateIndex
CREATE INDEX "coordination_tasks_agent_role_status_idx" ON "coordination_tasks"("agent_role", "status");

-- CreateIndex
CREATE INDEX "decision_logs_execution_id_idx" ON "decision_logs"("execution_id");

-- CreateIndex
CREATE INDEX "decision_logs_decision_type_idx" ON "decision_logs"("decision_type");

-- CreateIndex
CREATE INDEX "confidence_scores_execution_id_idx" ON "confidence_scores"("execution_id");

-- CreateIndex
CREATE INDEX "agent_sessions_workspace_id_user_id_idx" ON "agent_sessions"("workspace_id", "user_id");

-- CreateIndex
CREATE INDEX "agent_sessions_expires_at_idx" ON "agent_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "agent_runtime_memories_session_id_idx" ON "agent_runtime_memories"("session_id");

-- CreateIndex
CREATE INDEX "agent_runtime_memories_key_idx" ON "agent_runtime_memories"("key");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_published_knowledge_id_fkey" FOREIGN KEY ("published_knowledge_id") REFERENCES "knowledge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_document_chunks" ADD CONSTRAINT "knowledge_document_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "knowledge_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_pipeline_runs" ADD CONSTRAINT "knowledge_pipeline_runs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "knowledge_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_extractions" ADD CONSTRAINT "knowledge_extractions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "knowledge_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_graph_edges" ADD CONSTRAINT "knowledge_graph_edges_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "knowledge_graph_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_graph_edges" ADD CONSTRAINT "knowledge_graph_edges_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "knowledge_graph_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_graph_metrics" ADD CONSTRAINT "knowledge_graph_metrics_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "knowledge_graph_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ontology_classes" ADD CONSTRAINT "ontology_classes_ontology_id_fkey" FOREIGN KEY ("ontology_id") REFERENCES "ontologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ontology_classes" ADD CONSTRAINT "ontology_classes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "ontology_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ontology_relations" ADD CONSTRAINT "ontology_relations_ontology_id_fkey" FOREIGN KEY ("ontology_id") REFERENCES "ontologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_models" ADD CONSTRAINT "ai_models_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_provider_credentials" ADD CONSTRAINT "ai_provider_credentials_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_provider_health" ADD CONSTRAINT "ai_provider_health_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_provider_usage" ADD CONSTRAINT "ai_provider_usage_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_provider_usage" ADD CONSTRAINT "ai_provider_usage_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "ai_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_provider_statistics" ADD CONSTRAINT "ai_provider_statistics_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_provider_quotas" ADD CONSTRAINT "ai_provider_quotas_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_provider_model_capabilities" ADD CONSTRAINT "ai_provider_model_capabilities_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "ai_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_routing_rules" ADD CONSTRAINT "ai_routing_rules_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "ai_routing_policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_routing_rules" ADD CONSTRAINT "ai_routing_rules_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_routing_rules" ADD CONSTRAINT "ai_routing_rules_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "ai_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;
