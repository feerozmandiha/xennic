"""
Agent Registry - Singleton registry for all AI agents

Allows:
- Register agents
- Get agent by ID
- List all agents
- Filter by permission
"""

from typing import Dict, List, Optional, Type
from threading import Lock
from .base_agent import BaseAgent


class AgentRegistry:
    """
    Singleton registry for all AI agents
    """
    
    _instance: Optional['AgentRegistry'] = None
    _lock: Lock = Lock()
    _agents: Dict[str, BaseAgent] = {}
    
    def __new__(cls) -> 'AgentRegistry':
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def register(self, agent: BaseAgent) -> None:
        """Register an agent instance"""
        with self._lock:
            self._agents[agent.AGENT_ID] = agent
    
    def get(self, agent_id: str) -> Optional[BaseAgent]:
        """Get agent by ID"""
        with self._lock:
            return self._agents.get(agent_id)
    
    def list_all(self) -> List[dict]:
        """List all registered agents"""
        with self._lock:
            return [
                {
                    "agent_id": agent.AGENT_ID,
                    "agent_name": agent.AGENT_NAME,
                    "description": agent.DESCRIPTION,
                }
                for agent in self._agents.values()
            ]
    
    def has(self, agent_id: str) -> bool:
        """Check if agent exists"""
        with self._lock:
            return agent_id in self._agents
