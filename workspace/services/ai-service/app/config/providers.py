"""
Model Provider Configuration
"""

from typing import Dict, Any
import openai
import anthropic
import google.generativeai as genai
from .settings import settings


def initialize_providers() -> Dict[str, Any]:
    """Initialize all model providers"""
    providers = {}
    
    # OpenAI
    if settings.OPENAI_API_KEY:
        openai.api_key = settings.OPENAI_API_KEY
        providers["openai"] = {
            "client": openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY),
            "default_model": settings.OPENAI_MODEL,
        }
    
    # Anthropic
    if settings.ANTHROPIC_API_KEY:
        providers["anthropic"] = {
            "client": anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY),
            "default_model": settings.ANTHROPIC_MODEL,
        }
    
    # Google
    if settings.GOOGLE_API_KEY:
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        providers["google"] = {
            "client": genai,
            "default_model": settings.GOOGLE_MODEL,
        }
    
    return providers
