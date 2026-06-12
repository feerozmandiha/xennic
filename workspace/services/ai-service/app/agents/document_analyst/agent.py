"""
Document Analyst Agent for Xennic AI Platform

Analyzes technical documents, PDFs, and images
Extracts text, tables, metadata, and generates AI summary
Auto-indexes documents in Qdrant for RAG
"""

import time
import uuid
import tempfile
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from ...core.base_agent import BaseAgent
from ...schemas.inputs import ChatInput
from ...schemas.outputs import ChatOutput
from ...tools.document_parser import DocumentParser
from ...tools.minio_client import MinIOClient
from ...rag.vector_store import VectorStore
from ...rag.embedding_pipeline import EmbeddingPipeline
from ...rag.chunker import DocumentChunker
from ...rag.retriever import RAGRetriever


class DocumentAnalystAgent(BaseAgent):
    """
    Document Analyst Agent - Analyzes technical documents
    
    Capabilities:
    - Parse PDF, DOCX, and Images
    - Extract text, tables, metadata
    - Generate AI summary
    - Auto-index in Qdrant for RAG
    - Workspace isolation
    """
    
    AGENT_ID = "document_analyst"
    AGENT_NAME = "Document Analyst Agent"
    DESCRIPTION = "Analyzes technical documents, PDFs, and images. Extracts text, tables, and generates summaries."
    REQUIRED_PERMISSION = "ai.document_analysis"
    
    def __init__(self):
        super().__init__()
        self.parser = DocumentParser()
        self.minio = MinIOClient()
        self.vector_store = VectorStore()
        self.embedding_pipeline = EmbeddingPipeline()
        self.chunker = DocumentChunker(chunk_size=500, chunk_overlap=50)
        self.retriever = RAGRetriever()
    
    def get_system_prompt(self, context: Dict[str, Any]) -> str:
        """
        Return system prompt for document analysis agent
        """
        return f"""You are a Document Analyst Agent for Xennic Platform.

Your role is to analyze technical documents, extract key information, and provide summaries.

Your capabilities:
1. Parse PDF, DOCX, and Image files
2. Extract text, tables, and metadata
3. Generate concise summaries of document content
4. Identify key findings and technical specifications
5. Index documents for RAG (Retrieval-Augmented Generation)

IMPORTANT RULES:
1. Always respect document confidentiality (workspace isolation)
2. Extract technical data accurately without interpretation
3. For engineering specifications, reference the original source
4. If you cannot extract certain content, clearly state the limitation

Context: {context}
"""
    
    async def analyze_document(
        self,
        workspace_id: str,
        file_content: bytes,
        file_name: str,
        content_type: str,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Analyze a document: parse, extract, summarize, index
        
        Args:
            workspace_id: Workspace ID for isolation
            file_content: File content as bytes
            file_name: Original file name
            content_type: MIME type
            user_id: User ID for audit
            
        Returns:
            Analysis result with summary and metadata
        """
        start_time = time.time()
        
        # Save to temporary file for parsing
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        try:
            # Step 1: Parse document
            parsed = await self.parser.parse(tmp_path, file_name)
            
            if parsed.error:
                return {
                    "success": False,
                    "error": parsed.error,
                    "file_name": file_name,
                    "file_type": parsed.file_type,
                }
            
            # Step 2: Chunk document for indexing
            document_dict = {
                "content": parsed.text,
                "source": file_name,
                "file_type": parsed.file_type,
                "pages": parsed.pages,
                "metadata": parsed.metadata,
                "tables": parsed.tables,
                "workspace_id": workspace_id,
                "user_id": user_id,
                "analyzed_at": datetime.now(timezone.utc).isoformat(),
            }
            
            chunks = self.chunker.chunk_document(document_dict)
            
            if chunks:
                # Step 3: Generate embeddings for chunks
                chunk_texts = [chunk.content for chunk in chunks]
                embeddings = await self.embedding_pipeline.generate_embeddings(chunk_texts)
                
                # Step 4: Index in vector store
                chunk_docs = self.chunker.chunks_to_documents(chunks)
                await self.vector_store.add_documents(
                    collection="documents",
                    documents=chunk_docs,
                    embeddings=embeddings,
                    workspace_id=workspace_id,
                )
            
            # Step 5: Generate AI summary (if API key available)
            summary = await self._generate_summary(parsed.text, file_name)
            
            # Step 6: Extract key findings
            key_findings = await self._extract_key_findings(parsed.text)
            
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            return {
                "success": True,
                "file_id": str(uuid.uuid4()),
                "file_name": file_name,
                "file_type": parsed.file_type,
                "pages": parsed.pages,
                "text_extracted": len(parsed.text) > 0,
                "tables_found": len(parsed.tables),
                "summary": summary,
                "key_findings": key_findings,
                "metadata": parsed.metadata,
                "indexed_in_rag": len(chunks) > 0,
                "chunks_created": len(chunks),
                "processing_time_ms": processing_time_ms,
            }
        
        finally:
            # Clean up temp file
            os.unlink(tmp_path)
    
    async def _generate_summary(self, text: str, file_name: str) -> str:
        """Generate AI summary of the document"""
        if not self._has_api_keys() or len(text) < 100:
            # Fallback: return first 500 characters
            return text[:500] + "..." if len(text) > 500 else text
        
        # Truncate text for summarization (first 5000 chars)
        truncated = text[:5000]
        
        try:
            # Use LLM to generate summary
            from ...core.model_router import ModelRouter, TaskType, Complexity
            
            router = ModelRouter()
            model = router.route(TaskType.DOCUMENT_ANALYSIS, Complexity.MEDIUM)
            provider_client = router.get_provider_client(model)
            
            if not provider_client:
                return text[:500] + "..." if len(text) > 500 else text
            
            messages = [
                {"role": "system", "content": "You are a document analyst. Provide a concise summary of the following technical document in 3-5 sentences."},
                {"role": "user", "content": f"Document: {file_name}\n\nContent: {truncated}"},
            ]
            
            if model.startswith("gpt"):
                response = await provider_client.chat.completions.create(
                    model=model,
                    messages=messages,
                    max_tokens=300,
                    temperature=0.3,
                )
                return response.choices[0].message.content
            elif model.startswith("claude"):
                response = await provider_client.messages.create(
                    model=model,
                    messages=messages,
                    max_tokens=300,
                    temperature=0.3,
                )
                return response.content[0].text
            else:
                return text[:500] + "..." if len(text) > 500 else text
        
        except Exception as e:
            print(f"⚠️ Summary generation failed: {e}")
            return text[:500] + "..." if len(text) > 500 else text
    
    async def _extract_key_findings(self, text: str) -> List[str]:
        """Extract key findings from document text"""
        # Simple extraction: find sentences with key engineering terms
        key_terms = ["shall", "must", "requires", "specifies", "maximum", "minimum", "warning", "caution", "shall be", "should be", "not exceed"]
        sentences = text.replace('\n', ' ').split('.')
        
        findings = []
        for sentence in sentences[:20]:  # Limit to first 20 sentences
            sentence_lower = sentence.lower()
            if any(term in sentence_lower for term in key_terms):
                finding = sentence.strip()
                if len(finding) > 20 and len(finding) < 300:
                    findings.append(finding + ".")
        
        return findings[:5]  # Return top 5
    
    def _has_api_keys(self) -> bool:
        """Check if API keys are configured"""
        from ...config.settings import settings
        return bool(settings.OPENAI_API_KEY or settings.ANTHROPIC_API_KEY or settings.GOOGLE_API_KEY)
    
    async def get_document_context(
        self,
        workspace_id: str,
        query: str,
        limit: int = 5,
    ) -> Dict[str, Any]:
        """Retrieve relevant document chunks for a query"""
        return await self.retriever.retrieve_with_context(
            query=query,
            workspace_id=workspace_id,
            collections=["documents"],
            limit=limit,
        )
    
    async def process(self, input: ChatInput) -> ChatOutput:
        """Process chat input (for agent interface)"""
        # For document analysis, process as document analysis request
        result = await self.analyze_document(
            workspace_id=input.workspace_id,
            file_content=input.context.get("file_content", b""),
            file_name=input.context.get("file_name", "unknown"),
            content_type=input.context.get("content_type", "application/octet-stream"),
            user_id=input.user_id,
        )
        
        return ChatOutput(
            success=result.get("success", False),
            data={
                "response": result.get("summary", result.get("error", "Failed to analyze document")),
                **result,
            },
            meta={"agent_id": self.AGENT_ID},
        )
    
    async def stream(self, input: ChatInput):
        """Stream response (not implemented for document analysis)"""
        result = await self.process(input)
        yield result.data.get("response", "")

    async def analyze_document(
        self,
        workspace_id: str,
        file_content: bytes,
        file_name: str,
        content_type: str,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Analyze a document: parse, extract, summarize, index
        """
        start_time = time.time()
        
        # Save to temporary file for parsing
        suffix = os.path.splitext(file_name)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        try:
            # Step 1: Parse document
            parsed = await self.parser.parse(tmp_path, file_name)
            
            if parsed.error:
                return {
                    "success": False,
                    "error": parsed.error,
                    "file_name": file_name,
                    "file_type": parsed.file_type,
                    "pages": 0,
                    "text_extracted": False,
                    "tables_found": 0,
                    "summary": "",
                    "key_findings": [],
                    "metadata": {},
                    "indexed_in_rag": False,
                    "chunks_created": 0,
                    "processing_time_ms": int((time.time() - start_time) * 1000),
                }
            
            # Step 2: Chunk document for indexing
            document_dict = {
                "content": parsed.text,
                "source": file_name,
                "file_type": parsed.file_type,
                "pages": parsed.pages,
                "metadata": parsed.metadata,
                "tables": parsed.tables,
                "workspace_id": workspace_id,
                "user_id": user_id,
                "analyzed_at": datetime.now(timezone.utc).isoformat(),
            }
            
            chunks = self.chunker.chunk_document(document_dict)
            chunks_created = len(chunks)
            indexed = False
            
            if chunks:
                try:
                    # Step 3: Generate embeddings for chunks
                    chunk_texts = [chunk.content for chunk in chunks]
                    embeddings = await self.embedding_pipeline.generate_embeddings(chunk_texts)
                    
                    # Step 4: Index in vector store
                    chunk_docs = self.chunker.chunks_to_documents(chunks)
                    await self.vector_store.add_documents(
                        collection="documents",
                        documents=chunk_docs,
                        embeddings=embeddings,
                        workspace_id=workspace_id,
                    )
                    indexed = True
                except Exception as e:
                    print(f"⚠️ Indexing failed: {e}")
                    # Continue even if indexing fails
            
            # Step 5: Generate AI summary (if API key available)
            summary = await self._generate_summary(parsed.text, file_name)
            
            # Step 6: Extract key findings
            key_findings = await self._extract_key_findings(parsed.text)
            
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            return {
                "success": True,
                "file_id": str(uuid.uuid4()),
                "file_name": file_name,
                "file_type": parsed.file_type,
                "pages": parsed.pages,
                "text_extracted": len(parsed.text) > 0,
                "tables_found": len(parsed.tables),
                "summary": summary,
                "key_findings": key_findings,
                "metadata": parsed.metadata,
                "indexed_in_rag": indexed,
                "chunks_created": chunks_created,
                "processing_time_ms": processing_time_ms,
                "error": None,
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "file_name": file_name,
                "file_type": "unknown",
                "pages": 0,
                "text_extracted": False,
                "tables_found": 0,
                "summary": "",
                "key_findings": [],
                "metadata": {},
                "indexed_in_rag": False,
                "chunks_created": 0,
                "processing_time_ms": int((time.time() - start_time) * 1000),
            }
        
        finally:
            # Clean up temp file
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
