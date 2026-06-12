"""
Vector Store - Fallback mode for development (without Qdrant)
"""

import os
import json
from typing import List, Dict, Any, Optional
from pathlib import Path


class VectorStore:
    """
    Simple file-based vector store for development (fallback when Qdrant is not available)
    """
    
    COLLECTIONS = ['documents', 'articles', 'engineering_standards', 'calculations', 'ai_knowledge']
    
    def __init__(self):
        self.storage_dir = Path("/tmp/vector_store")
        self.storage_dir.mkdir(exist_ok=True, parents=True)
        print("⚠️ Using fallback file-based vector store (Qdrant not available)")
    
    def _get_collection_file(self, collection: str) -> Path:
        """Get file path for a collection"""
        return self.storage_dir / f"{collection}.json"
    
    def _load_collection(self, collection: str) -> Dict:
        """Load collection from file"""
        file_path = self._get_collection_file(collection)
        if file_path.exists():
            with open(file_path, 'r') as f:
                return json.load(f)
        return {"points": {}, "next_id": 0}
    
    def _save_collection(self, collection: str, data: Dict):
        """Save collection to file"""
        with open(self._get_collection_file(collection), 'w') as f:
            json.dump(data, f)
    
    async def add_documents(
        self,
        collection: str,
        documents: List[Dict[str, Any]],
        embeddings: List[List[float]],
        workspace_id: str,
    ) -> List[str]:
        """Add documents to collection"""
        data = self._load_collection(collection)
        point_ids = []
        
        for i, (doc, embedding) in enumerate(zip(documents, embeddings)):
            point_id = f"{workspace_id}_{collection}_{data['next_id']}"
            point_ids.append(point_id)
            
            doc['workspace_id'] = workspace_id
            doc['_embedding'] = embedding[:10]  # Store truncated for fallback
            
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
        """Simple similarity search using dot product"""
        data = self._load_collection(collection)
        
        results = []
        for point_id, doc in data['points'].items():
            if doc.get('workspace_id') != workspace_id:
                continue
            
            # Simple similarity using embedding (if available)
            embedding = doc.get('_embedding', [])
            if embedding and query_embedding:
                # Dot product similarity
                similarity = sum(a * b for a, b in zip(embedding[:10], query_embedding[:10]))
                if similarity >= score_threshold:
                    results.append({
                        'id': point_id,
                        'score': similarity,
                        **doc,
                    })
        
        # Sort by score and limit
        results.sort(key=lambda x: x.get('score', 0), reverse=True)
        return results[:limit]
    
    async def get_collection_info(self, collection: str) -> Dict[str, Any]:
        """Get collection information"""
        data = self._load_collection(collection)
        return {
            'name': collection,
            'points_count': len(data['points']),
            'vectors_count': len(data['points']),
            'status': 'green',
        }
    
    def health_check(self) -> bool:
        """Check if storage is writable"""
        try:
            test_file = self.storage_dir / "test.tmp"
            test_file.touch()
            test_file.unlink()
            return True
        except Exception:
            return False
