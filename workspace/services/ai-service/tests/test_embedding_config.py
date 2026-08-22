"""Embedding configuration tests."""
from __future__ import annotations

from app.config.settings import Settings
from app.rag.embedding_pipeline import EmbeddingPipeline
from app.rag.qdrant_store import QdrantStore


def test_embedding_pipeline_uses_configured_dimension() -> None:
    pipeline = EmbeddingPipeline()

    assert pipeline.get_embedding_dimension() == 1536
    assert len(pipeline._generate_dummy_embedding()) == 1536


def test_embedding_settings_are_environment_configurable() -> None:
    settings = Settings(
        _env_file=None,
        EMBEDDING_MODEL="text-embedding-3-large",
        EMBEDDING_DIMENSION=3072,
    )

    assert settings.EMBEDDING_MODEL == "text-embedding-3-large"
    assert settings.EMBEDDING_DIMENSION == 3072


def test_qdrant_vector_size_uses_embedding_settings() -> None:
    assert QdrantStore.VECTOR_SIZE == 1536
