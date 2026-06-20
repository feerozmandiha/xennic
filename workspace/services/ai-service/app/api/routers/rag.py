"""
RAG API Endpoints for Xennic AI Platform

Endpoints for indexing and searching documents
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from ...rag.vector_store import VectorStore
from ...rag.embedding_pipeline import EmbeddingPipeline
from ...rag.chunker import DocumentChunker, Chunk
from ...rag.retriever import RAGRetriever


router = APIRouter(prefix="/api/v1/ai/rag", tags=["RAG"])


# ============================================================================
# Request/Response Models
# ============================================================================

class IndexDocumentRequest(BaseModel):
    """Request model for indexing documents"""
    workspace_id: str
    collection: str
    documents: List[Dict[str, Any]]
    chunk_size: Optional[int] = 500
    chunk_overlap: Optional[int] = 50


class IndexDocumentResponse(BaseModel):
    """Response model for indexing documents"""
    success: bool
    indexed_count: int
    chunk_count: int
    collection: str
    workspace_id: str


class SearchRequest(BaseModel):
    """Request model for searching documents"""
    workspace_id: str
    query: str
    collection: str = "documents"
    limit: int = 5
    score_threshold: float = 0.7


class SearchResponse(BaseModel):
    """Response model for searching documents"""
    success: bool
    query: str
    collection: str
    workspace_id: str
    results: List[Dict[str, Any]]
    total: int


class MultiCollectionSearchRequest(BaseModel):
    """Request model for searching multiple collections"""
    workspace_id: str
    query: str
    collections: List[str] = ["documents", "engineering_standards", "articles"]
    limit_per_collection: int = 3
    score_threshold: float = 0.6


class ContextResponse(BaseModel):
    """Response model for context retrieval"""
    success: bool
    query: str
    workspace_id: str
    context: str
    total_retrieved: int
    documents: List[Dict[str, Any]]


def _get_store(request: Request) -> VectorStore:
    if not hasattr(request.app.state, 'vector_store') or request.app.state.vector_store is None:
        request.app.state.vector_store = VectorStore()
    return request.app.state.vector_store


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/index", response_model=IndexDocumentResponse)
async def index_documents(request: Request, body: IndexDocumentRequest):
    """
    Index documents for RAG

    Processes documents by:
    1. Chunking into smaller pieces
    2. Generating embeddings
    3. Storing in vector database

    Documents are scoped by workspace_id for isolation.
    """
    try:
        vector_store = _get_store(request)
        embedding_pipeline = EmbeddingPipeline()
        chunker = DocumentChunker(
            chunk_size=body.chunk_size,
            chunk_overlap=body.chunk_overlap,
        )

        all_chunks: List[Chunk] = []
        for doc in body.documents:
            chunks = chunker.chunk_document(doc)
            all_chunks.extend(chunks)

        if not all_chunks:
            return IndexDocumentResponse(
                success=True,
                indexed_count=0,
                chunk_count=0,
                collection=body.collection,
                workspace_id=body.workspace_id,
            )

        chunk_docs = chunker.chunks_to_documents(all_chunks)
        contents = [chunk.content for chunk in all_chunks]
        embeddings = await embedding_pipeline.generate_embeddings(contents)

        await vector_store.add_documents(
            collection=body.collection,
            documents=chunk_docs,
            embeddings=embeddings,
            workspace_id=body.workspace_id,
        )

        return IndexDocumentResponse(
            success=True,
            indexed_count=len(body.documents),
            chunk_count=len(all_chunks),
            collection=body.collection,
            workspace_id=body.workspace_id,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search", response_model=SearchResponse)
async def search_documents(request: Request, body: SearchRequest):
    """
    Search for documents using semantic similarity

    Results are filtered by workspace_id for isolation.
    """
    try:
        retriever = RAGRetriever()

        results = await retriever.retrieve(
            query=body.query,
            workspace_id=body.workspace_id,
            collection=body.collection,
            limit=body.limit,
            score_threshold=body.score_threshold,
        )

        return SearchResponse(
            success=True,
            query=body.query,
            collection=body.collection,
            workspace_id=body.workspace_id,
            results=results,
            total=len(results),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/context", response_model=ContextResponse)
async def get_context(request: Request, body: MultiCollectionSearchRequest):
    """
    Retrieve context for RAG from multiple collections

    Returns a formatted context string ready for LLM prompts.
    """
    try:
        retriever = RAGRetriever()

        result = await retriever.retrieve_with_context(
            query=body.query,
            workspace_id=body.workspace_id,
            collections=body.collections,
            limit=body.limit_per_collection * len(body.collections),
        )

        return ContextResponse(
            success=True,
            query=body.query,
            workspace_id=body.workspace_id,
            context=result['context'],
            total_retrieved=result['total_retrieved'],
            documents=result['documents'],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/collections")
async def list_collections():
    """List all available collections"""
    return {
        "success": True,
        "collections": VectorStore.COLLECTIONS,
    }


@router.get("/collections/{collection}/info")
async def get_collection_info(request: Request, collection: str, workspace_id: Optional[str] = None):
    """Get information about a specific collection"""
    try:
        vector_store = _get_store(request)
        info = await vector_store.get_collection_info(collection, workspace_id)
        return {"success": True, **info}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/workspace/{workspace_id}")
async def delete_workspace_documents(request: Request, workspace_id: str):
    """Delete all documents for a workspace (for cleanup)"""
    try:
        vector_store = _get_store(request)
        deleted = await vector_store.delete_workspace(workspace_id)
        return {
            "success": True,
            "workspace_id": workspace_id,
            "deleted_count": deleted,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
