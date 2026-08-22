"""
Embedding Pipeline for Xennic AI Platform

Generates embeddings for documents using the configured OpenAI-compatible model
Dimension: configurable via EMBEDDING_DIMENSION

Fallback mode: Returns dummy embeddings when API key is not configured
"""

import asyncio
from typing import List, Optional
import numpy as np

from ..config.settings import settings


class EmbeddingPipeline:
    """
    Generate embeddings for documents
    
    Models:
    - OpenAI-compatible embedding model from EMBEDDING_MODEL
    - Fallback: Random embeddings for development
    """
    
    def __init__(self):
        self.api_key = settings.EMBEDDING_API_KEY or settings.OPENAI_API_KEY
        self.model = settings.EMBEDDING_MODEL
        self.dimension = settings.EMBEDDING_DIMENSION
        self._client = None
    
    def _get_client(self):
        """Get OpenAI client (lazy initialization)"""
        if self._client is None and self.api_key:
            import openai
            self._client = openai.AsyncOpenAI(api_key=self.api_key)
        return self._client
    
    def _has_api_key(self) -> bool:
        """Check if API key is configured"""
        return bool(self.api_key)
    
    def _generate_dummy_embedding(self, dimension: Optional[int] = None) -> List[float]:
        """Generate a dummy embedding for development (no API key)"""
        dimension = dimension or self.dimension
        # Use deterministic hash-based embeddings for consistency
        # This ensures same text gets same embedding in fallback mode
        np.random.seed(hash(str(dimension)) % 2**32)
        embedding = np.random.randn(dimension).tolist()
        # Normalize
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = (np.array(embedding) / norm).tolist()
        return embedding
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts
        
        Args:
            texts: List of text strings to embed
            
        Returns:
            List of embedding vectors (each of configured length)
        """
        if not texts:
            return []
        
        # Fallback: dummy embeddings
        if not self._has_api_key():
            print(f"⚠️ No OpenAI API key. Using dummy embeddings for {len(texts)} texts.")
            return [self._generate_dummy_embedding() for _ in texts]
        
        try:
            client = self._get_client()
            response = await client.embeddings.create(
                model=self.model,
                input=texts,
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            print(f"❌ Error generating embeddings: {e}")
            # Fallback to dummy
            return [self._generate_dummy_embedding() for _ in texts]
    
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text
        
        Args:
            text: Text string to embed
            
        Returns:
            Embedding vector (configured length)
        """
        embeddings = await self.generate_embeddings([text])
        return embeddings[0] if embeddings else self._generate_dummy_embedding()
    
    async def batch_generate_embeddings(
        self,
        texts: List[str],
        batch_size: int = 100,
    ) -> List[List[float]]:
        """
        Generate embeddings in batches for large document sets
        
        Args:
            texts: List of text strings
            batch_size: Number of texts per batch
            
        Returns:
            List of embedding vectors
        """
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = await self.generate_embeddings(batch)
            all_embeddings.extend(batch_embeddings)
            
            # Small delay to avoid rate limits
            if i + batch_size < len(texts):
                await asyncio.sleep(0.1)
        
        return all_embeddings
    
    def get_embedding_dimension(self) -> int:
        """Return the configured embedding dimension"""
        return self.dimension
