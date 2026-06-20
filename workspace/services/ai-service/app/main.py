"""
Xennic AI Service - FastAPI Application
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse, HTMLResponse
from fastapi.exceptions import RequestValidationError
import json
import os

from .config.settings import settings
from .core.agent_registry import AgentRegistry
from .agents import ElectricalEngineerAgent
from .agents.document_analyst.agent import DocumentAnalystAgent
from .schemas.inputs import ChatInput, StreamChatInput
from .schemas.outputs import ChatOutput, AgentInfo


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup/shutdown events"""
    print("🚀 Starting Xennic AI Service...")
    
    registry = AgentRegistry()
    registry.register(ElectricalEngineerAgent())
    registry.register(DocumentAnalystAgent())
    
    print(f"✅ Registered {len(registry.list_all())} agents:")
    for agent_info in registry.list_all():
        print(f"   - {agent_info['agent_id']}: {agent_info['agent_name']}")
    
    app.state.registry = registry

    from .rag.vector_store import VectorStore
    app.state.vector_store = VectorStore()
    if app.state.vector_store.is_qdrant_enabled():
        print("✅ Qdrant vector store active")
    else:
        print("⚠️ File-based vector store active (Qdrant not available)")

    yield

    if hasattr(app.state, 'vector_store') and app.state.vector_store is not None:
        await app.state.vector_store.close()
    print("🛑 Shutting down Xennic AI Service...")


# Create FastAPI app
app = FastAPI(
    title="Xennic AI Service",
    description="AI Gateway for Xennic Platform - Intelligent Engineering Assistants",
    version="0.2.0",
    lifespan=lifespan,
    docs_url=None,          # Disable default Swagger (CDN issue)
    redoc_url=None,         # Disable default ReDoc (CDN issue)
    openapi_url="/openapi.json",
)


# Custom Swagger UI using local files or alternative CDN
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui():
    """Custom Swagger UI endpoint"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Xennic AI Service - API Documentation</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
        <style>
            body { margin: 0; padding: 0; }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
        <script>
            window.onload = function() {
                const ui = SwaggerUIBundle({
                    url: "/openapi.json",
                    dom_id: '#swagger-ui',
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    layout: "BaseLayout",
                    deepLinking: true,
                });
                window.ui = ui;
            };
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


# Global Exception Handlers
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"success": False, "error": {"code": "VALIDATION_ERROR", "message": str(exc)}}
    )


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"success": False, "error": {"code": "REQUEST_VALIDATION_ERROR", "message": "Invalid request parameters"}}
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": {"code": "HTTP_ERROR", "message": exc.detail}}
    )


# Health Check
@app.get("/health", tags=["System"])
async def health_check():
    registry = AgentRegistry()
    return {
        "status": "ok",
        "service": "ai-service",
        "version": "0.2.0",
        "agents_registered": len(registry.list_all()),
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "service": "Xennic AI Service",
        "version": "0.2.0",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/api/v1/ai/agents", tags=["AI Gateway"], response_model=list[AgentInfo])
async def list_agents():
    registry = AgentRegistry()
    return registry.list_all()


@app.post("/api/v1/ai/chat", tags=["AI Gateway"])
async def chat(input: ChatInput):
    registry = AgentRegistry()
    agent = registry.get(input.agent_id)
    
    if not agent:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": {"code": "AGENT_NOT_FOUND", "message": f"Agent '{input.agent_id}' not found"}}
        )
    
    response = await agent.process(input)
    return response.dict()


@app.post("/api/v1/ai/chat/stream", tags=["AI Gateway"])
async def chat_stream(input: StreamChatInput):
    registry = AgentRegistry()
    agent = registry.get(input.agent_id)
    
    if not agent:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": {"code": "AGENT_NOT_FOUND", "message": f"Agent '{input.agent_id}' not found"}}
        )
    
    chat_input = ChatInput(
        workspace_id=input.workspace_id,
        user_id=input.user_id,
        conversation_id=input.conversation_id,
        agent_id=input.agent_id,
        message=input.message,
        context=input.context,
    )
    
    async def generate():
        async for chunk in agent.stream(chat_input):
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


# Import routers
from .api.routers.rag import router as rag_router
from .api.routers.documents import router as documents_router
app.include_router(rag_router)
app.include_router(documents_router)

# Import Agent router
from .api.routers.agents import router as agents_router

# Include Agent router
app.include_router(agents_router)
