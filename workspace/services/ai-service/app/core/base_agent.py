"""
Base Agent Framework for Xennic AI Platform

All AI agents must inherit from BaseAgent and implement:
- process(): For non-streaming responses
- stream(): For streaming responses
- get_system_prompt(): Return agent-specific system prompt
"""

from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, timezone
import uuid
import time
import json

from pydantic import BaseModel

from ..schemas.inputs import ChatInput
from ..schemas.outputs import ChatOutput, Source, ChatMetadata
from .model_router import ModelRouter, TaskType, Complexity


@dataclass
class Conversation:
    """Represents a conversation session"""
    conversation_id: str
    workspace_id: str
    user_id: str
    agent_id: str
    messages: list = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class BaseAgent(ABC):
    """
    Base class for all AI agents
    
    Usage:
        class MyAgent(BaseAgent):
            AGENT_ID = "my_agent"
            AGENT_NAME = "My Agent"
            DESCRIPTION = "Does something useful"
            
            def get_system_prompt(self, context: Dict[str, Any]) -> str:
                return "You are a helpful assistant..."
            
            async def process(self, input: ChatInput) -> ChatOutput:
                # Implementation
                pass
            
            async def stream(self, input: ChatInput) -> AsyncGenerator[str, None]:
                # Implementation
                pass
    """
    
    # Class-level metadata (must be overridden)
    AGENT_ID: str = ""
    AGENT_NAME: str = ""
    DESCRIPTION: str = ""
    REQUIRED_PERMISSION: str = "ai.chat"
    
    def __init__(self):
        self.model_router = ModelRouter()
        self._conversations: Dict[str, Conversation] = {}
    
    @abstractmethod
    def get_system_prompt(self, context: Dict[str, Any]) -> str:
        """
        Return the system prompt for this agent
        
        Args:
            context: Additional context (workspace data, user preferences, etc.)
            
        Returns:
            System prompt string
        """
        pass
    
    @abstractmethod
    async def process(self, input: ChatInput) -> ChatOutput:
        """
        Process user input and return response (non-streaming)
        
        Args:
            input: Chat input with message and context
            
        Returns:
            ChatOutput with response and metadata
        """
        pass
    
    @abstractmethod
    async def stream(self, input: ChatInput) -> AsyncGenerator[str, None]:
        """
        Stream response for real-time chat
        
        Args:
            input: Chat input with message and context
            
        Yields:
            Chunks of the response as they become available
        """
        pass
    
    def _get_or_create_conversation(self, input: ChatInput) -> Conversation:
        """Get existing conversation or create new one"""
        # If conversation_id provided and exists, return it
        if input.conversation_id and input.conversation_id in self._conversations:
            return self._conversations[input.conversation_id]
        
        # If conversation_id provided but doesn't exist, create new with that ID
        if input.conversation_id:
            conv = Conversation(
                conversation_id=input.conversation_id,
                workspace_id=input.workspace_id,
                user_id=input.user_id,
                agent_id=input.agent_id,
            )
            self._conversations[conv.conversation_id] = conv
            return conv
        
        # Create new conversation
        conv = Conversation(
            conversation_id=str(uuid.uuid4()),
            workspace_id=input.workspace_id,
            user_id=input.user_id,
            agent_id=input.agent_id,
        )
        self._conversations[conv.conversation_id] = conv
        return conv
    
    def _build_messages(self, system_prompt: str, conversation: Conversation, user_message: str) -> list:
        """Build message list for LLM API"""
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (last 10 messages for context)
        for msg in conversation.messages[-10:]:
            messages.append(msg)
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        return messages
    
    def _update_conversation(self, conversation: Conversation, user_message: str, assistant_response: str):
        """Update conversation with new messages"""
        conversation.messages.append({"role": "user", "content": user_message})
        conversation.messages.append({"role": "assistant", "content": assistant_response})
        conversation.updated_at = datetime.now(timezone.utc)
    
    def _determine_complexity(self, message: str) -> Complexity:
        """Determine complexity of user message"""
        message_lower = message.lower()
        
        # Keywords indicating high complexity
        high_complexity_keywords = [
            "calculate", "formula", "standard", "iec", "ieee",
            "coordination", "selectivity", "harmonic", "analysis",
            "detailed", "explain thoroughly"
        ]
        
        # Keywords indicating low complexity
        low_complexity_keywords = [
            "hello", "hi", "thanks", "ok", "what is", "define",
            "basic", "simple"
        ]
        
        if any(kw in message_lower for kw in high_complexity_keywords):
            return Complexity.HIGH
        elif len(message.split()) < 10 and any(kw in message_lower for kw in low_complexity_keywords):
            return Complexity.LOW
        else:
            return Complexity.MEDIUM
    
    def _determine_task_type(self, message: str) -> TaskType:
        """Determine task type from user message"""
        message_lower = message.lower()
        
        if any(kw in message_lower for kw in ["code", "function", "api", "implement", "class"]):
            return TaskType.CODE
        elif any(kw in message_lower for kw in ["calculate", "formula", "iec", "ieee", "standard", "engineering"]):
            return TaskType.ENGINEERING
        elif any(kw in message_lower for kw in ["image", "picture", "diagram", "screenshot", "figure", "chart"]):
            return TaskType.VISION
        elif any(kw in message_lower for kw in ["document", "pdf", "specification", "manual", "datasheet"]):
            return TaskType.DOCUMENT_ANALYSIS
        else:
            return TaskType.CHAT
