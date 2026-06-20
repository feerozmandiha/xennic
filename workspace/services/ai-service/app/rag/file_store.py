"""
File-based fallback vector store for development (when Qdrant is not available).
"""

import json
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class FileVectorStore:
    """
    Simple file-based vector store — fallback when Qdrant is not reachable.
    Stores collections as flat JSON files under /tmp/vector_store/.
    """

    COLLECTIONS = ['documents', 'articles', 'engineering_standards', 'calculations', 'ai_knowledge']

    def __init__(self):
        self.storage_dir = Path("/tmp/vector_store")
        self.storage_dir.mkdir(exist_ok=True, parents=True)

    def _get_collection_file(self, collection: str) -> Path:
        return self.storage_dir / f"{collection}.json"

    def _load_collection(self, collection: str) -> Dict:
        file_path = self._get_collection_file(collection)
        if file_path.exists():
            with open(file_path, 'r') as f:
                return json.load(f)
        return {"points": {}, "next_id": 0}

    def _save_collection(self, collection: str, data: Dict):
        with open(self._get_collection_file(collection), 'w') as f:
            json.dump(data, f)

    async def add_documents(
        self,
        collection: str,
        documents: List[Dict[str, Any]],
        embeddings: List[List[float]],
        workspace_id: str,
    ) -> List[str]:
        data = self._load_collection(collection)
        point_ids = []

        for i, (doc, embedding) in enumerate(zip(documents, embeddings)):
            point_id = f"{workspace_id}_{collection}_{data['next_id']}"
            point_ids.append(point_id)
            doc['workspace_id'] = workspace_id
            doc['_embedding'] = embedding[:10]
            data['points'][point_id] = doc
            data['next_id'] += 1

        self._save_collection(collection, data)
        return point_ids

    async def search(
        self,
        collection: str,
        query_embedding: List[float],
        workspace_id: str,
        limit: int = 5,
        score_threshold: float = 0.7,
    ) -> List[Dict[str, Any]]:
        data = self._load_collection(collection)
        results = []

        for point_id, doc in data['points'].items():
            if doc.get('workspace_id') != workspace_id:
                continue
            embedding = doc.get('_embedding', [])
            if embedding and query_embedding:
                similarity = sum(a * b for a, b in zip(embedding[:10], query_embedding[:10]))
                if similarity >= score_threshold:
                    results.append({
                        'id': point_id,
                        'score': similarity,
                        **doc,
                    })

        results.sort(key=lambda x: x.get('score', 0), reverse=True)
        return results[:limit]

    async def delete_workspace(self, workspace_id: str) -> int:
        deleted = 0
        for collection in self.COLLECTIONS:
            data = self._load_collection(collection)
            keys_to_delete = [
                k for k, v in data['points'].items()
                if v.get('workspace_id') == workspace_id
            ]
            for k in keys_to_delete:
                del data['points'][k]
                deleted += 1
            if keys_to_delete:
                self._save_collection(collection, data)
        return deleted

    async def get_collection_info(self, collection: str) -> Dict[str, Any]:
        data = self._load_collection(collection)
        return {
            'name': collection,
            'points_count': len(data['points']),
            'vectors_count': len(data['points']),
            'status': 'green',
        }

    async def delete_documents(
        self,
        collection: str,
        point_ids: List[str],
        workspace_id: str,
    ) -> int:
        data = self._load_collection(collection)
        deleted = 0
        for pid in point_ids:
            if pid in data['points'] and data['points'][pid].get('workspace_id') == workspace_id:
                del data['points'][pid]
                deleted += 1
        if deleted:
            self._save_collection(collection, data)
        return deleted

    def health_check(self) -> bool:
        try:
            test_file = self.storage_dir / "test.tmp"
            test_file.touch()
            test_file.unlink()
            return True
        except Exception:
            return False
