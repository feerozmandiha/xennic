"""
Advanced Agent API Endpoints

Provides endpoints for Agentic AI with tool calling capabilities
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from ...agents.electrical_engineer.agent import ElectricalEngineerAgent


router = APIRouter(prefix="/api/v1/ai/agents", tags=["Agentic AI"])


# ============================================================================
# Request/Response Models
# ============================================================================

class Message(BaseModel):
    """Message in conversation"""
    role: str = Field(..., description="user or assistant")
    content: str = Field(..., description="Message content")


class AgentChatRequest(BaseModel):
    """Request model for agent chat"""
    workspace_id: str = Field(..., description="Workspace ID for isolation")
    user_id: str = Field(..., description="User ID")
    message: str = Field(..., description="User message")
    history: Optional[List[Message]] = Field(default=None, description="Previous messages")


class ToolCall(BaseModel):
    """Record of a tool call by the agent"""
    tool: str = Field(..., description="Tool name called")
    inputs: Dict[str, Any] = Field(default_factory=dict, description="Inputs to the tool")
    result: Optional[Dict[str, Any]] = Field(default=None, description="Result from the tool")


class AgentChatResponse(BaseModel):
    """Response model for agent chat"""
    success: bool
    data: Dict[str, Any]
    meta: Dict[str, Any] = Field(default_factory=dict)


# Create agent instance
agent = ElectricalEngineerAgent()


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/electrical-engineer/chat", response_model=AgentChatResponse)
async def electrical_engineer_chat(request: AgentChatRequest):
    """
    Chat with the Advanced Electrical Engineer Agent.
    
    This agent can autonomously:
    1. Understand your engineering problem
    2. Extract relevant parameters
    3. Provide engineering advice based on standards
    
    Examples:
    - "What size cable do I need for 100A copper/PVC on wall?"
    - "Calculate voltage drop for 50m of 35mm² copper cable at 400V, 100A"
    - "I have a 50kW motor at 400V with 0.8 PF. What's the current?"
    """
    try:
        # Import ChatInput for the agent
        from ...schemas.inputs import ChatInput
        
        # Create input for agent
        chat_input = ChatInput(
            workspace_id=request.workspace_id,
            user_id=request.user_id,
            agent_id="electrical_engineer",
            message=request.message,
            context={},
            conversation_id=None,
        )
        
        # Process with agent
        result = await agent.process(chat_input)
        
        return AgentChatResponse(
            success=True,
            data={
                "response": result.data.get("response", ""),
                "tool_calls": [],
                "conversation_id": result.data.get("conversation_id"),
            },
            meta={
                "model_used": "fallback",
                "agent_id": "electrical_engineer",
                "workspace_id": request.workspace_id,
            }
        )
    
    except Exception as e:
        return AgentChatResponse(
            success=False,
            data={
                "response": f"An error occurred: {str(e)}",
                "tool_calls": [],
            },
            meta={"error": str(e)}
        )


@router.post("/electrical-engineer/chat/stream")
async def electrical_engineer_chat_stream(request: AgentChatRequest):
    """
    Chat with the Advanced Electrical Engineer Agent (Streaming).
    
    Returns response as a stream of text chunks for real-time display.
    """
    from fastapi.responses import StreamingResponse
    import json
    
    async def generate():
        try:
            # Import ChatInput for the agent
            from ...schemas.inputs import ChatInput
            
            # Create input for agent
            chat_input = ChatInput(
                workspace_id=request.workspace_id,
                user_id=request.user_id,
                agent_id="electrical_engineer",
                message=request.message,
                context={},
                conversation_id=None,
            )
            
            # Stream response
            async for chunk in agent.stream(chat_input):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            
            yield "data: [DONE]\n\n"
        
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/list")
async def list_available_agents():
    """List all available AI agents"""
    return {
        "success": True,
        "agents": [
            {
                "id": "electrical_engineer",
                "name": "Electrical Engineer Agent",
                "description": "Professional electrical engineering assistant with autonomous calculation capabilities",
                "capabilities": [
                    "Cable sizing (IEC 60364)",
                    "Voltage drop calculation",
                    "Short circuit analysis",
                    "Transformer sizing (IEC 60076)",
                    "Power calculations (Ohm's Law, Active/Reactive Power)",
                    "Protection coordination (IEC 60947)",
                ],
            }
        ]
    }
