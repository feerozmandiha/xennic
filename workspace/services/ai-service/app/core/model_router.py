"""
Intelligent Model Router for Xennic AI Platform

Routes requests to appropriate models based on:
- Task type (chat, code, vision, engineering)
- Complexity (low, medium, high)
- Cost optimization
- Latency requirements
"""

from enum import Enum
from typing import Dict, Any, Tuple, Optional
from dataclasses import dataclass
import time

from ..config.settings import settings
from ..config.providers import initialize_providers


class TaskType(str, Enum):
    CHAT = "chat"
    CODE = "code"
    VISION = "vision"
    ENGINEERING = "engineering"
    DOCUMENT_ANALYSIS = "document_analysis"


class Complexity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    ANY = "any"  # Add ANY for wildcard matching


@dataclass
class ModelCapability:
    """Capabilities of a model"""
    max_tokens: int
    supports_vision: bool
    supports_function_calling: bool
    cost_per_1k_input: float
    cost_per_1k_output: float
    latency_ms_avg: int


class ModelRouter:
    """
    Intelligent model router based on task requirements
    
    Routing Strategy:
    - Simple chat → GPT-4o-mini (cheap, fast)
    - Complex reasoning → Claude 3.5 Sonnet or GPT-4o
    - Code generation → Claude 3.5 Sonnet
    - Vision tasks → GPT-4o
    - Engineering analysis → Claude 3.5 Sonnet
    """
    
    # Model capabilities database
    MODEL_CAPABILITIES: Dict[str, ModelCapability] = {
        "gpt-4o-mini": ModelCapability(
            max_tokens=16384,
            supports_vision=False,
            supports_function_calling=True,
            cost_per_1k_input=0.00015,
            cost_per_1k_output=0.0006,
            latency_ms_avg=500,
        ),
        "gpt-4o": ModelCapability(
            max_tokens=128000,
            supports_vision=True,
            supports_function_calling=True,
            cost_per_1k_input=0.005,
            cost_per_1k_output=0.015,
            latency_ms_avg=800,
        ),
        "claude-3-5-sonnet-20241022": ModelCapability(
            max_tokens=200000,
            supports_vision=True,
            supports_function_calling=True,
            cost_per_1k_input=0.003,
            cost_per_1k_output=0.015,
            latency_ms_avg=700,
        ),
        "gemini-1.5-pro": ModelCapability(
            max_tokens=2000000,
            supports_vision=True,
            supports_function_calling=True,
            cost_per_1k_input=0.0025,
            cost_per_1k_output=0.005,
            latency_ms_avg=900,
        ),
    }
    
    # Routing table: (task_type, complexity) -> model
    ROUTING_TABLE: Dict[Tuple[TaskType, Complexity], str] = {
        (TaskType.CHAT, Complexity.LOW): "gpt-4o-mini",
        (TaskType.CHAT, Complexity.MEDIUM): "gpt-4o",
        (TaskType.CHAT, Complexity.HIGH): "claude-3-5-sonnet-20241022",
        (TaskType.CODE, Complexity.LOW): "gpt-4o-mini",
        (TaskType.CODE, Complexity.MEDIUM): "claude-3-5-sonnet-20241022",
        (TaskType.CODE, Complexity.HIGH): "claude-3-5-sonnet-20241022",
        (TaskType.VISION, Complexity.LOW): "gpt-4o",
        (TaskType.VISION, Complexity.MEDIUM): "gpt-4o",
        (TaskType.VISION, Complexity.HIGH): "gpt-4o",
        (TaskType.VISION, Complexity.ANY): "gpt-4o",
        (TaskType.ENGINEERING, Complexity.LOW): "gpt-4o",
        (TaskType.ENGINEERING, Complexity.MEDIUM): "claude-3-5-sonnet-20241022",
        (TaskType.ENGINEERING, Complexity.HIGH): "claude-3-5-sonnet-20241022",
        (TaskType.DOCUMENT_ANALYSIS, Complexity.LOW): "gpt-4o",
        (TaskType.DOCUMENT_ANALYSIS, Complexity.MEDIUM): "gpt-4o",
        (TaskType.DOCUMENT_ANALYSIS, Complexity.HIGH): "gpt-4o",
        (TaskType.DOCUMENT_ANALYSIS, Complexity.ANY): "gpt-4o",
    }
    
    def __init__(self):
        self.providers = initialize_providers()
    
    def route(
        self,
        task_type: TaskType,
        complexity: Complexity = Complexity.MEDIUM,
        prefer_cost: bool = False,
    ) -> str:
        """
        Route to the best model for the task
        
        Args:
            task_type: Type of task (chat, code, vision, engineering)
            complexity: Complexity level
            prefer_cost: If True, prefer cheaper models
            
        Returns:
            Model name string
        """
        # Get model from routing table
        key = (task_type, complexity)
        
        # Try exact match first
        model = self.ROUTING_TABLE.get(key)
        
        # If no exact match, try with ANY
        if not model:
            model = self.ROUTING_TABLE.get((task_type, Complexity.ANY))
        
        # If still no match, use default
        if not model:
            model = "gpt-4o-mini"
        
        # If cost is priority, find cheaper alternative
        if prefer_cost and model not in ["gpt-4o-mini", "gemini-1.5-pro"]:
            # Try to downgrade to cheaper model if capabilities allow
            cheaper_options = ["gemini-1.5-pro", "gpt-4o-mini"]
            for cheaper in cheaper_options:
                if self._is_capable(cheaper, task_type):
                    return cheaper
        
        return model
    
    def _is_capable(self, model: str, task_type: TaskType) -> bool:
        """Check if model is capable of the task"""
        capabilities = self.MODEL_CAPABILITIES.get(model)
        if not capabilities:
            return False
        
        if task_type == TaskType.VISION:
            return capabilities.supports_vision
        if task_type == TaskType.CODE:
            return capabilities.supports_function_calling
        
        return True
    
    def get_capabilities(self, model: str) -> Optional[ModelCapability]:
        """Get capabilities of a model"""
        return self.MODEL_CAPABILITIES.get(model)
    
    def get_provider_client(self, model: str) -> Any:
        """Get the client for a specific model"""
        if model.startswith("gpt"):
            return self.providers.get("openai", {}).get("client")
        elif model.startswith("claude"):
            return self.providers.get("anthropic", {}).get("client")
        elif model.startswith("gemini"):
            return self.providers.get("google", {}).get("client")
        return None
    
    def get_provider_model(self, model: str) -> str:
        """Get the provider-specific model name"""
        return model
