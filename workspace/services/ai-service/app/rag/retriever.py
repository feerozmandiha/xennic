"""
RAG Retriever for Xennic AI Platform

Retrieves relevant documents for RAG (Retrieval-Augmented Generation)

Flow:
1. Generate embedding for user query
2. Search in vector store
3. Filter by workspace_id (CRITICAL for multi-tenancy)
4. Return top-k results with scores
"""

from typing import List, Dict, Any, Optional
from .vector_store import VectorStore
from .embedding_pipeline import EmbeddingPipeline


class RAGRetriever:
    """
    Retrieve relevant documents for RAG
    
    Features:
    - Workspace isolation (always filters by workspace_id)
    - Multi-collection support
    - Configurable similarity threshold
    - Result caching (optional)
    """
    
    def __init__(self):
        self.vector_store = VectorStore()
        self.embedding_pipeline = EmbeddingPipeline()
        self._cache = {}  # Simple in-memory cache
    
    async def retrieve(
        self,
        query: str,
        workspace_id: str,
        collection: str = 'documents',
        limit: int = 5,
        score_threshold: float = 0.7,
        use_cache: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant documents for a query
        
        CRITICAL: Always filters by workspace_id for isolation
        
        Args:
            query: User query string
            workspace_id: Workspace ID for filtering
            collection: Collection to search
            limit: Maximum number of results
            score_threshold: Minimum similarity score
            use_cache: Whether to use cache
            
        Returns:
            List of retrieved documents with scores and metadata
        """
        # Check cache
        cache_key = f"{workspace_id}:{collection}:{query}:{limit}"
        if use_cache and cache_key in self._cache:
            return self._cache[cache_key]
        
        # Generate embedding for query
        query_embedding = await self.embedding_pipeline.generate_embedding(query)
        
        # Search in vector store (with workspace filter)
        results = await self.vector_store.search(
            collection=collection,
            query_embedding=query_embedding,
            workspace_id=workspace_id,
            limit=limit,
            score_threshold=score_threshold,
        )
        
        # Cache results
        if use_cache:
            self._cache[cache_key] = results
        
        return results
    
    async def retrieve_from_multiple_collections(
        self,
        query: str,
        workspace_id: str,
        collections: List[str],
        limit_per_collection: int = 3,
        score_threshold: float = 0.7,
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Retrieve documents from multiple collections
        
        Args:
            query: User query
            workspace_id: Workspace ID
            collections: List of collection names
            limit_per_collection: Limit per collection
            score_threshold: Minimum similarity score
            
        Returns:
            Dictionary mapping collection name to results
        """
        results = {}
        
        for collection in collections:
            collection_results = await self.retrieve(
                query=query,
                workspace_id=workspace_id,
                collection=collection,
                limit=limit_per_collection,
                score_threshold=score_threshold,
                use_cache=False,
            )
            results[collection] = collection_results
        
        return results
    
    async def retrieve_with_context(
        self,
        query: str,
        workspace_id: str,
        collections: Optional[List[str]] = None,
        limit: int = 5,
    ) -> Dict[str, Any]:
        """
        Retrieve documents and build context string for LLM
        
        Args:
            query: User query
            workspace_id: Workspace ID
            collections: List of collections (default: ['documents', 'engineering_standards'])
            limit: Total number of documents to retrieve
            
        Returns:
            Dictionary with context string and retrieved documents
        """
        if collections is None:
            collections = ['documents', 'engineering_standards', 'articles']
        
        # Calculate limit per collection
        limit_per_collection = max(1, limit // len(collections))
        
        # Retrieve from all collections
        all_results = []
        for collection in collections:
            results = await self.retrieve(
                query=query,
                workspace_id=workspace_id,
                collection=collection,
                limit=limit_per_collection,
                score_threshold=0.6,  # Lower threshold for broader context
            )
            all_results.extend(results)
        
        # Sort by score and limit total
        all_results.sort(key=lambda x: x.get('score', 0), reverse=True)
        all_results = all_results[:limit]
        
        # Build context string
        context_parts = []
        for i, doc in enumerate(all_results, 1):
            source = doc.get('source', doc.get('title', f'Document {i}'))
            content = doc.get('content', '')
            score = doc.get('score', 0)
            
            context_parts.append(f"[{i}] Source: {source} (relevance: {score:.2f})\n{content}")
        
        context = '\n\n---\n\n'.join(context_parts) if context_parts else ""
        
        return {
            'context': context,
            'documents': all_results,
            'total_retrieved': len(all_results),
        }
    
    def clear_cache(self, workspace_id: Optional[str] = None):
        """
        Clear the cache
        
        Args:
            workspace_id: If provided, clear only cache for this workspace
        """
        if workspace_id:
            keys_to_remove = [k for k in self._cache if k.startswith(f"{workspace_id}:")]
            for key in keys_to_remove:
                del self._cache[key]
        else:
            self._cache.clear()
    
    async def get_relevant_standards(
        self,
        query: str,
        workspace_id: str,
        limit: int = 3,
    ) -> List[Dict[str, Any]]:
        """
        Get relevant engineering standards for a query
        
        Args:
            query: User query
            workspace_id: Workspace ID
            limit: Number of standards to retrieve
            
        Returns:
            List of relevant standards
        """
        return await self.retrieve(
            query=query,
            workspace_id=workspace_id,
            collection='engineering_standards',
            limit=limit,
            score_threshold=0.5,
        )
