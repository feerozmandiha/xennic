"""
Input schemas for AI Service
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class ChatInput(BaseModel):
    """Input schema for chat endpoint"""
    workspace_id: str = Field(..., description="Workspace ID for isolation")
    user_id: str = Field(..., description="User ID")
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID")
    agent_id: str = Field(..., description="Agent ID to use")
    message: str = Field(..., description="User message")
    context: Dict[str, Any] = Field(default_factory=dict, description="Additional context")


class StreamChatInput(BaseModel):
    """Input schema for streaming chat endpoint"""
    workspace_id: str = Field(..., description="Workspace ID for isolation")
    user_id: str = Field(..., description="User ID")
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID")
    agent_id: str = Field(..., description="Agent ID to use")
    message: str = Field(..., description="User message")
    context: Dict[str, Any] = Field(default_factory=dict, description="Additional context")
