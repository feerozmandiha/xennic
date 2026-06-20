"""
Tests for vector store implementations:
- FileVectorStore (file-based fallback)
- QdrantStore (Qdrant-backed, when available)
- VectorStore (auto-detect dispatcher)
"""

import os
import json
import pytest
from pathlib import Path
from typing import List, Dict, Any


STORE_DIR = Path("/tmp/vector_store")


def _clear_store():
    """Remove all files in the vector store directory."""
    if STORE_DIR.exists():
        for f in STORE_DIR.iterdir():
            if f.is_file() and f.suffix == '.json':
                f.unlink()


# ==============================================================================
# FileVectorStore Tests
# ==============================================================================

class TestFileVectorStore:
    """Tests for file-based fallback vector store."""

    COLLECTION = "documents"

    async def _make_sample_docs(self) -> tuple:
        documents = [
            {'title': 'Transformer Sizing', 'content': 'IEC 60076 specifies transformer sizing...'},
            {'title': 'Cable Selection', 'content': 'Cable sizing per IEC 60364...'},
            {'title': 'Short Circuit', 'content': 'Short circuit calculation per IEC 60909...'},
        ]
        embeddings = [[0.1] * 10, [0.2] * 10, [0.3] * 10]
        return documents, embeddings

    async def test_file_store_add_and_search(self):
        _clear_store()
        from app.rag.file_store import FileVectorStore
        store = FileVectorStore()
        docs, embs = await self._make_sample_docs()

        ids = await store.add_documents(self.COLLECTION, docs, embs, 'ws_test')
        assert len(ids) == 3
        assert all(isinstance(i, str) for i in ids)

    async def test_file_store_search_returns_results(self):
        _clear_store()
        from app.rag.file_store import FileVectorStore
        store = FileVectorStore()
        docs, embs = await self._make_sample_docs()
        await store.add_documents(self.COLLECTION, docs, embs, 'ws_test')

        results = await store.search(self.COLLECTION, [0.3] * 10, 'ws_test', limit=2)
        assert len(results) > 0
        assert 'score' in results[0]
        assert 'title' in results[0]

    async def test_file_store_workspace_isolation(self):
        _clear_store()
        from app.rag.file_store import FileVectorStore
        store = FileVectorStore()
        docs, embs = await self._make_sample_docs()
        await store.add_documents(self.COLLECTION, docs, embs, 'ws_a')

        results_ws_a = await store.search(self.COLLECTION, [0.3] * 10, 'ws_a')
        results_ws_b = await store.search(self.COLLECTION, [0.3] * 10, 'ws_b')
        assert len(results_ws_a) > 0
        assert len(results_ws_b) == 0

    async def test_file_store_delete_workspace(self):
        _clear_store()
        from app.rag.file_store import FileVectorStore
        store = FileVectorStore()
        docs, embs = await self._make_sample_docs()
        await store.add_documents(self.COLLECTION, docs, embs, 'ws_del')

        info_before = await store.get_collection_info(self.COLLECTION)
        assert info_before['points_count'] == 3

        deleted = await store.delete_workspace('ws_del')
        assert deleted == 3

        info_after = await store.get_collection_info(self.COLLECTION)
        assert info_after['points_count'] == 0

    async def test_file_store_delete_documents(self):
        _clear_store()
        from app.rag.file_store import FileVectorStore
        store = FileVectorStore()
        docs, embs = await self._make_sample_docs()
        ids = await store.add_documents(self.COLLECTION, docs, embs, 'ws_deldoc')

        deleted = await store.delete_documents(self.COLLECTION, ids[:2], 'ws_deldoc')
        assert deleted == 2

    async def test_file_store_health_check(self):
        from app.rag.file_store import FileVectorStore
        store = FileVectorStore()
        assert store.health_check() is True

    async def test_file_store_empty_search(self):
        from app.rag.file_store import FileVectorStore
        store = FileVectorStore()
        results = await store.search('nonexistent', [0.1] * 10, 'ws_x')
        assert results == []


# ==============================================================================
# QdrantStore Tests (when Qdrant is available)
# ==============================================================================

class TestQdrantStore:
    """Tests for Qdrant-backed vector store — requires Qdrant running."""

    @pytest.fixture(autouse=True)
    async def setup_teardown(self):
        from app.rag.qdrant_store import QdrantStore
        self.store = QdrantStore(url="http://localhost:6333")
        healthy = await self.store.health_check()
        if not healthy:
            pytest.skip("Qdrant not reachable at localhost:6333")
        yield
        await self.store.delete_workspace("test_qdrant")
        await self.store.close()

    async def _sample_docs(self) -> tuple:
        documents = [
            {'title': 'Doc A', 'content': 'Content A'},
            {'title': 'Doc B', 'content': 'Content B'},
        ]
        embeddings = [[0.1] * 1536, [0.2] * 1536]
        return documents, embeddings

    async def test_qdrant_add_and_search(self):
        docs, embs = await self._sample_docs()
        ids = await self.store.add_documents('test_coll', docs, embs, 'test_qdrant')
        assert len(ids) == 2

        results = await self.store.search('test_coll', [0.2] * 1536, 'test_qdrant', limit=5)
        assert len(results) > 0

    async def test_qdrant_workspace_isolation(self):
        docs, embs = await self._sample_docs()
        await self.store.add_documents('test_coll', docs, embs, 'test_qdrant')

        results_a = await self.store.search('test_coll', [0.2] * 1536, 'test_qdrant')
        results_b = await self.store.search('test_coll', [0.2] * 1536, 'other_ws')
        assert len(results_a) > 0
        assert len(results_b) == 0

    async def test_qdrant_collection_info(self):
        docs, embs = await self._sample_docs()
        await self.store.add_documents('test_coll', docs, embs, 'test_qdrant')

        info = await self.store.get_collection_info('test_coll', 'test_qdrant')
        assert info['points_count'] >= 2
        assert 'config' in info

    async def test_qdrant_health_check(self):
        healthy = await self.store.health_check()
        assert healthy is True

    async def test_qdrant_delete_workspace(self):
        docs, embs = await self._sample_docs()
        await self.store.add_documents('test_coll', docs, embs, 'test_qdrant')

        deleted = await self.store.delete_workspace('test_qdrant')
        assert deleted > 0


# ==============================================================================
# VectorStore (dispatcher) Tests
# ==============================================================================

class TestVectorStoreDispatcher:
    """Tests for the auto-detect VectorStore dispatcher."""

    async def test_dispatcher_creates_file_fallback(self):
        from app.rag.vector_store import VectorStore
        store = VectorStore(force_fallback=True)
        assert store.is_qdrant_enabled() is False
        assert store._file_store is not None

    async def test_dispatcher_file_operations(self):
        _clear_store()
        from app.rag.vector_store import VectorStore
        store = VectorStore(force_fallback=True)

        docs = [{'title': 'Test'}]
        embs = [[0.5] * 10]
        ids = await store.add_documents('test_coll', docs, embs, 'ws_disp')
        assert len(ids) == 1

        results = await store.search('test_coll', [0.5] * 10, 'ws_disp')
        assert len(results) == 1

        info = await store.get_collection_info('test_coll')
        assert info['points_count'] >= 1

        healthy = await store.health_check()
        assert healthy is True

    async def test_dispatcher_close(self):
        from app.rag.vector_store import VectorStore
        store = VectorStore(force_fallback=True)
        await store.close()
        assert True  # no error on close
