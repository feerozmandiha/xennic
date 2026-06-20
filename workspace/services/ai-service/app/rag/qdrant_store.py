"""
Qdrant-backed vector store for Xennic AI Service.

Uses the Qdrant async client for all operations.
Collection naming convention: {workspace_id}_{collection}
"""

import os
import logging
from typing import List, Dict, Any, Optional
from uuid import uuid4

logger = logging.getLogger(__name__)

try:
    from qdrant_client import AsyncQdrantClient
    from qdrant_client.models import (
        Distance,
        VectorParams,
        PointStruct,
        Filter,
        FieldCondition,
        MatchValue,
        HasIdCondition,
    )

    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    AsyncQdrantClient = None  # type: ignore


class QdrantStore:
    """
    Vector store backed by Qdrant.

    Uses async Qdrant client. Collections are namespaced by workspace_id
    to support multi-tenancy: each workspace gets its own named collection.
    """

    COLLECTIONS = ['documents', 'articles', 'engineering_standards', 'calculations', 'ai_knowledge']
    VECTOR_SIZE = 1536  # OpenAI text-embedding-3-small

    def __init__(
        self,
        url: Optional[str] = None,
        api_key: Optional[str] = None,
        prefer_grpc: bool = False,
    ):
        self._url = url or os.getenv("QDRANT_URL", "http://localhost:6333")
        self._api_key = api_key or os.getenv("QDRANT_API_KEY")
        self._prefer_grpc = prefer_grpc
        self._client: Optional[AsyncQdrantClient] = None
        self._initialized = False

    async def _ensure_client(self) -> AsyncQdrantClient:
        if self._client is None:
            self._client = AsyncQdrantClient(
                url=self._url,
                api_key=self._api_key or None,
                prefer_grpc=self._prefer_grpc,
            )
        return self._client

    async def _collection_name(self, collection: str, workspace_id: str) -> str:
        return f"xennic_{workspace_id}_{collection}"

    async def _ensure_collection(self, collection: str, workspace_id: str) -> bool:
        client = await self._ensure_client()
        name = await self._collection_name(collection, workspace_id)
        existing = await client.collection_exists(name)
        if not existing:
            await client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(size=self.VECTOR_SIZE, distance=Distance.COSINE),
            )
            return True
        return False

    async def add_documents(
        self,
        collection: str,
        documents: List[Dict[str, Any]],
        embeddings: List[List[float]],
        workspace_id: str,
    ) -> List[str]:
        client = await self._ensure_client()
        await self._ensure_collection(collection, workspace_id)
        name = await self._collection_name(collection, workspace_id)

        point_ids: List[str] = []
        points: List[PointStruct] = []

        for doc, embedding in zip(documents, embeddings):
            point_id = str(uuid4())
            point_ids.append(point_id)
            doc['workspace_id'] = workspace_id
            points.append(PointStruct(
                id=point_id,
                vector=embedding,
                payload=doc,
            ))

        await client.upsert(
            collection_name=name,
            points=points,
            wait=True,
        )
        return point_ids

    async def search(
        self,
        collection: str,
        query_embedding: List[float],
        workspace_id: str,
        limit: int = 5,
        score_threshold: float = 0.7,
    ) -> List[Dict[str, Any]]:
        client = await self._ensure_client()
        name = await self._collection_name(collection, workspace_id)

        exists = await client.collection_exists(name)
        if not exists:
            return []

        result = await client.search(
            collection_name=name,
            query_vector=query_embedding,
            limit=limit,
            score_threshold=score_threshold,
            with_payload=True,
        )

        return [
            {
                'id': str(hit.id),
                'score': hit.score,
                **(hit.payload or {}),
            }
            for hit in result
        ]

    async def delete_workspace(self, workspace_id: str) -> int:
        """Delete all collections for a workspace. Returns count of deleted collections."""
        client = await self._ensure_client()
        deleted = 0
        for collection in self.COLLECTIONS:
            name = await self._collection_name(collection, workspace_id)
            exists = await client.collection_exists(name)
            if exists:
                await client.delete_collection(name)
                deleted += 1
        return deleted

    async def delete_documents(
        self,
        collection: str,
        point_ids: List[str],
        workspace_id: str,
    ) -> int:
        client = await self._ensure_client()
        name = await self._collection_name(collection, workspace_id)
        exists = await client.collection_exists(name)
        if not exists:
            return 0
        result = await client.delete(
            collection_name=name,
            points_selector=Filter(
                must=[HasIdCondition(has_id=point_ids)],
            ),
            wait=True,
        )
        return len(point_ids)

    async def get_collection_info(self, collection: str, workspace_id: Optional[str] = None) -> Dict[str, Any]:
        if workspace_id is None:
            return {'name': collection, 'status': 'unknown'}

        client = await self._ensure_client()
        name = await self._collection_name(collection, workspace_id)
        exists = await client.collection_exists(name)
        if not exists:
            return {'name': collection, 'points_count': 0, 'status': 'green'}

        info = await client.get_collection(name)
        return {
            'name': collection,
            'points_count': info.points_count,
            'vectors_count': info.vectors_count,
            'status': 'green',
            'config': {
                'vector_size': info.config.params.vectors.size,
                'distance': str(info.config.params.vectors.distance),
            },
        }

    async def health_check(self) -> bool:
        try:
            client = await self._ensure_client()
            await client.get_collections()
            return True
        except Exception:
            return False

    async def close(self):
        if self._client is not None:
            await self._client.close()
            self._client = None
