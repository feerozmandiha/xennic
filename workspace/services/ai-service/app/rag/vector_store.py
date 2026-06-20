"""
Vector Store — auto-detect: Qdrant first, file-based fallback.

Usage:
    store = VectorStore()
    # Tries Qdrant at QDRANT_URL (env/config) or http://localhost:6333
    # Falls back to FileVectorStore if Qdrant unreachable
"""

import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

try:
    from app.config.settings import settings as _app_settings
    _QDRANT_URL = _app_settings.QDRANT_URL or os.getenv("QDRANT_URL", "http://localhost:6333")
    _QDRANT_KEY = _app_settings.QDRANT_API_KEY or os.getenv("QDRANT_API_KEY")
    _FORCE_FILE = _app_settings.QDRANT_FORCE_FALLBACK or os.getenv("QDRANT_FORCE_FALLBACK", "").lower() == "true"
except Exception:
    _QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
    _QDRANT_KEY = os.getenv("QDRANT_API_KEY")
    _FORCE_FILE = os.getenv("QDRANT_FORCE_FALLBACK", "").lower() == "true"


class VectorStore:
    """
    Vector store with automatic backend selection.

    Priority:
    1. Qdrant (if reachable and not forced fallback)
    2. File-based fallback (/tmp/vector_store/)
    """

    COLLECTIONS = ['documents', 'articles', 'engineering_standards', 'calculations', 'ai_knowledge']
    QDRANT_ENABLED = False

    def __init__(self, force_fallback: bool = False):
        self._qdrant = None
        self._file_store = None

        should_use_qdrant = not _FORCE_FILE and not force_fallback

        if should_use_qdrant:
            try:
                from app.rag.qdrant_store import QdrantStore
                self._qdrant = QdrantStore(url=_QDRANT_URL, api_key=_QDRANT_KEY)
                VectorStore.QDRANT_ENABLED = True
                logger.info("✅ Using Qdrant vector store at %s", _QDRANT_URL)
                return
            except Exception as e:
                logger.warning("⚠️ Qdrant unavailable (%s), using file-based fallback", e)

        self._init_file_fallback()

    def _init_file_fallback(self):
        from app.rag.file_store import FileVectorStore
        self._file_store = FileVectorStore()
        VectorStore.QDRANT_ENABLED = False
        logger.info("⚠️ Using fallback file-based vector store")

    async def add_documents(
        self,
        collection: str,
        documents: List[Dict[str, Any]],
        embeddings: List[List[float]],
        workspace_id: str,
    ) -> List[str]:
        if self._qdrant is not None:
            return await self._qdrant.add_documents(collection, documents, embeddings, workspace_id)
        return await self._file_store.add_documents(collection, documents, embeddings, workspace_id)

    async def search(
        self,
        collection: str,
        query_embedding: List[float],
        workspace_id: str,
        limit: int = 5,
        score_threshold: float = 0.7,
    ) -> List[Dict[str, Any]]:
        if self._qdrant is not None:
            return await self._qdrant.search(collection, query_embedding, workspace_id, limit, score_threshold)
        return await self._file_store.search(collection, query_embedding, workspace_id, limit, score_threshold)

    async def delete_workspace(self, workspace_id: str) -> int:
        if self._qdrant is not None:
            return await self._qdrant.delete_workspace(workspace_id)
        return await self._file_store.delete_workspace(workspace_id)

    async def delete_documents(
        self,
        collection: str,
        point_ids: List[str],
        workspace_id: str,
    ) -> int:
        if self._qdrant is not None:
            return await self._qdrant.delete_documents(collection, point_ids, workspace_id)
        return 0

    async def get_collection_info(self, collection: str, workspace_id: Optional[str] = None) -> Dict[str, Any]:
        if self._qdrant is not None:
            return await self._qdrant.get_collection_info(collection, workspace_id)
        return await self._file_store.get_collection_info(collection)

    async def health_check(self) -> bool:
        if self._qdrant is not None:
            return await self._qdrant.health_check()
        return self._file_store.health_check()

    async def close(self):
        if self._qdrant is not None:
            await self._qdrant.close()

    @classmethod
    def is_qdrant_enabled(cls) -> bool:
        return cls.QDRANT_ENABLED
