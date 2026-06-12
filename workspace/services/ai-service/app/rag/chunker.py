"""
Document Chunker for RAG Pipeline

Splits documents into overlapping chunks for embedding and retrieval

Strategies:
- Fixed size with overlap
- Semantic chunking (by paragraphs)
- Section-based chunking
"""

import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class Chunk:
    """Represents a document chunk"""
    content: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    chunk_index: int = 0
    total_chunks: int = 1


class DocumentChunker:
    """
    Split documents into chunks for embedding
    
    Features:
    - Configurable chunk size and overlap
    - Preserves metadata across chunks
    - Paragraph boundary awareness
    """
    
    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        respect_paragraphs: bool = True,
    ):
        """
        Initialize the chunker
        
        Args:
            chunk_size: Target number of words per chunk
            chunk_overlap: Number of overlapping words between chunks
            respect_paragraphs: Try to split at paragraph boundaries
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.respect_paragraphs = respect_paragraphs
    
    def _split_by_paragraphs(self, text: str) -> List[str]:
        """Split text by paragraph boundaries"""
        # Split by double newline or multiple newlines
        paragraphs = re.split(r'\n\s*\n', text)
        return [p.strip() for p in paragraphs if p.strip()]
    
    def _chunk_by_words(self, words: List[str]) -> List[List[str]]:
        """Split words into chunks with overlap"""
        chunks = []
        
        for i in range(0, len(words), self.chunk_size - self.chunk_overlap):
            chunk_words = words[i:i + self.chunk_size]
            chunks.append(chunk_words)
            
            if i + self.chunk_size >= len(words):
                break
        
        return chunks
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into overlapping chunks
        
        Args:
            text: Input text to chunk
            
        Returns:
            List of text chunks
        """
        if not text:
            return []
        
        # If text is short, return as single chunk
        words = text.split()
        if len(words) <= self.chunk_size:
            return [text]
        
        # Try to respect paragraph boundaries if enabled
        if self.respect_paragraphs:
            paragraphs = self._split_by_paragraphs(text)
            
            # If paragraphs are short enough, keep them separate
            chunks = []
            current_chunk_words = []
            
            for para in paragraphs:
                para_words = para.split()
                
                # If this paragraph alone exceeds chunk size, split it
                if len(para_words) > self.chunk_size:
                    # Add current chunk if not empty
                    if current_chunk_words:
                        chunks.append(' '.join(current_chunk_words))
                        current_chunk_words = []
                    
                    # Split large paragraph
                    para_chunks = self._chunk_by_words(para_words)
                    for para_chunk in para_chunks:
                        chunks.append(' '.join(para_chunk))
                
                # Check if adding this paragraph exceeds chunk size
                elif len(current_chunk_words) + len(para_words) > self.chunk_size:
                    # Start new chunk
                    if current_chunk_words:
                        chunks.append(' '.join(current_chunk_words))
                    current_chunk_words = para_words.copy()
                else:
                    current_chunk_words.extend(para_words)
            
            # Add last chunk
            if current_chunk_words:
                chunks.append(' '.join(current_chunk_words))
            
            return chunks
        
        # Simple word-based chunking
        word_chunks = self._chunk_by_words(words)
        return [' '.join(chunk) for chunk in word_chunks]
    
    def chunk_document(
        self,
        document: Dict[str, Any],
        content_key: str = 'content',
    ) -> List[Chunk]:
        """
        Chunk a document and add metadata to each chunk
        
        Args:
            document: Document dictionary with content and metadata
            content_key: Key for the content field
            
        Returns:
            List of Chunk objects with preserved metadata
        """
        content = document.get(content_key, '')
        if not content:
            return []
        
        text_chunks = self.chunk_text(content)
        total_chunks = len(text_chunks)
        
        # Extract base metadata (exclude content)
        base_metadata = {
            k: v for k, v in document.items()
            if k != content_key and v is not None
        }
        
        chunks = []
        for i, chunk_content in enumerate(text_chunks):
            chunk_metadata = {
                **base_metadata,
                'chunk_index': i,
                'total_chunks': total_chunks,
                'chunk_size': len(chunk_content.split()),
            }
            
            chunks.append(Chunk(
                content=chunk_content,
                metadata=chunk_metadata,
                chunk_index=i,
                total_chunks=total_chunks,
            ))
        
        return chunks
    
    def chunk_documents(
        self,
        documents: List[Dict[str, Any]],
        content_key: str = 'content',
    ) -> List[Chunk]:
        """
        Chunk multiple documents
        
        Args:
            documents: List of document dictionaries
            content_key: Key for the content field
            
        Returns:
            List of Chunk objects from all documents
        """
        all_chunks = []
        for doc in documents:
            chunks = self.chunk_document(doc, content_key)
            all_chunks.extend(chunks)
        return all_chunks
    
    def chunks_to_documents(
        self,
        chunks: List[Chunk],
    ) -> List[Dict[str, Any]]:
        """
        Convert Chunk objects back to document dictionaries
        
        Args:
            chunks: List of Chunk objects
            
        Returns:
            List of document dictionaries ready for embedding
        """
        return [
            {
                'content': chunk.content,
                **chunk.metadata,
            }
            for chunk in chunks
        ]
