"""
Output schemas for AI Service
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class Source(BaseModel):
    """Source reference for AI response"""
    type: str  # "standard", "document", "calculation"
    reference: str
    section: Optional[str] = None


class ChatMetadata(BaseModel):
    """Metadata for AI response"""
    model_used: str
    tokens_used: int
    latency_ms: int
    agent_id: str


class ChatOutput(BaseModel):
    """Output schema for chat endpoint"""
    success: bool = True
    data: Dict[str, Any]
    meta: Dict[str, Any] = {}


class AgentInfo(BaseModel):
    """Information about an agent"""
    agent_id: str
    agent_name: str
    description: str
