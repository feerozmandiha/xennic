"""
Document Analysis API Endpoints

Endpoints for analyzing documents (PDF, DOCX, Images)
Supports workspace isolation and auto-indexing in RAG
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import base64

from ...agents.document_analyst.agent import DocumentAnalystAgent
from ...tools.minio_client import MinIOClient


router = APIRouter(prefix="/api/v1/ai/documents", tags=["Document Analysis"])


# ============================================================================
# Request/Response Models
# ============================================================================

class AnalyzeDocumentResponse(BaseModel):
    """Response model for document analysis"""
    success: bool
    file_id: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    pages: int = 0
    text_extracted: bool = False
    tables_found: int = 0
    summary: str = ""
    key_findings: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    indexed_in_rag: bool = False
    chunks_created: int = 0
    processing_time_ms: int = 0
    error: Optional[str] = None


class AnalyzeDocumentBase64Request(BaseModel):
    """Request model for analyzing a document from base64"""
    workspace_id: str
    file_name: str
    file_content_base64: str
    content_type: str = "application/octet-stream"


class GetContextRequest(BaseModel):
    """Request model for getting document context for a query"""
    workspace_id: str
    query: str
    limit: int = 5


class GetContextResponse(BaseModel):
    """Response model for document context"""
    success: bool
    context: str
    total_retrieved: int
    documents: List[Dict[str, Any]] = Field(default_factory=list)


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/analyze-upload", response_model=AnalyzeDocumentResponse)
async def analyze_uploaded_file(
    workspace_id: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Upload and analyze a document in one step
    
    Accepts file upload, parses it, extracts content,
    generates summary, and indexes in Qdrant.
    """
    try:
        # Read file content
        file_content = await file.read()
        
        # Validate file size (max 50MB)
        if len(file_content) > 50 * 1024 * 1024:
            return AnalyzeDocumentResponse(
                success=False,
                error="File too large (max 50MB)",
                file_name=file.filename,
            )
        
        # Analyze document
        agent = DocumentAnalystAgent()
        result = await agent.analyze_document(
            workspace_id=workspace_id,
            file_content=file_content,
            file_name=file.filename,
            content_type=file.content_type or "application/octet-stream",
        )
        
        # Ensure all required fields are present
        return AnalyzeDocumentResponse(
            success=result.get("success", False),
            file_id=result.get("file_id"),
            file_name=result.get("file_name", file.filename),
            file_type=result.get("file_type"),
            pages=result.get("pages", 0),
            text_extracted=result.get("text_extracted", False),
            tables_found=result.get("tables_found", 0),
            summary=result.get("summary", ""),
            key_findings=result.get("key_findings", []),
            metadata=result.get("metadata", {}),
            indexed_in_rag=result.get("indexed_in_rag", False),
            chunks_created=result.get("chunks_created", 0),
            processing_time_ms=result.get("processing_time_ms", 0),
            error=result.get("error"),
        )
    
    except Exception as e:
        return AnalyzeDocumentResponse(
            success=False,
            error=str(e),
            file_name=file.filename if file else None,
        )


@router.post("/analyze-base64", response_model=AnalyzeDocumentResponse)
async def analyze_base64_document(request: AnalyzeDocumentBase64Request):
    """
    Analyze a document from base64 encoded content
    
    Useful for API clients that can't use multipart uploads.
    """
    try:
        # Decode base64 content
        try:
            file_content = base64.b64decode(request.file_content_base64)
        except Exception as e:
            return AnalyzeDocumentResponse(
                success=False,
                error=f"Invalid base64 content: {str(e)}",
                file_name=request.file_name,
            )
        
        # Validate file size (max 50MB)
        if len(file_content) > 50 * 1024 * 1024:
            return AnalyzeDocumentResponse(
                success=False,
                error="File too large (max 50MB)",
                file_name=request.file_name,
            )
        
        # Analyze document
        agent = DocumentAnalystAgent()
        result = await agent.analyze_document(
            workspace_id=request.workspace_id,
            file_content=file_content,
            file_name=request.file_name,
            content_type=request.content_type,
        )
        
        return AnalyzeDocumentResponse(
            success=result.get("success", False),
            file_id=result.get("file_id"),
            file_name=result.get("file_name", request.file_name),
            file_type=result.get("file_type"),
            pages=result.get("pages", 0),
            text_extracted=result.get("text_extracted", False),
            tables_found=result.get("tables_found", 0),
            summary=result.get("summary", ""),
            key_findings=result.get("key_findings", []),
            metadata=result.get("metadata", {}),
            indexed_in_rag=result.get("indexed_in_rag", False),
            chunks_created=result.get("chunks_created", 0),
            processing_time_ms=result.get("processing_time_ms", 0),
            error=result.get("error"),
        )
    
    except Exception as e:
        return AnalyzeDocumentResponse(
            success=False,
            error=str(e),
            file_name=request.file_name,
        )


@router.get("/supported-types")
async def get_supported_file_types():
    """Get list of supported file types for document analysis"""
    from ...tools.document_parser import DocumentParser
    
    parser = DocumentParser()
    return {
        "success": True,
        "supported_extensions": parser.get_supported_extensions(),
        "max_file_size_mb": 50,
    }
