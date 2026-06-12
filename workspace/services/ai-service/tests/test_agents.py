"""
Unit tests for AI Agents
"""

import pytest
from app.agents import ElectricalEngineerAgent
from app.schemas.inputs import ChatInput


class TestElectricalEngineerAgent:
    """Tests for Electrical Engineer Agent"""
    
    def setup_method(self):
        self.agent = ElectricalEngineerAgent()
    
    def test_agent_metadata(self):
        """Test agent metadata is correct"""
        assert self.agent.AGENT_ID == "electrical_engineer"
        assert self.agent.AGENT_NAME == "Electrical Engineer Agent"
        assert len(self.agent.DESCRIPTION) > 0
    
    def test_system_prompt_contains_standards(self):
        """Test system prompt includes standard references"""
        context = {"workspace_id": "test_ws", "user_role": "engineer"}
        prompt = self.agent.get_system_prompt(context)
        
        assert "IEC" in prompt or "IEEE" in prompt
        assert "CalculationTool" in prompt
        assert "NEVER calculate anything yourself" in prompt
    
    def test_complexity_detection_simple(self):
        """Test complexity detection for simple messages"""
        msg = "Hello, can you help me?"
        complexity = self.agent._determine_complexity(msg)
        assert complexity in ["low", "medium", "high"]
    
    def test_complexity_detection_complex(self):
        """Test complexity detection for complex messages"""
        msg = "Can you calculate the voltage drop for a 100m cable with 50A load?"
        complexity = self.agent._determine_complexity(msg)
        # Should detect as high due to "calculate" keyword
        assert complexity == "high"
    
    def test_task_type_detection_chat(self):
        """Test task type detection for general chat"""
        msg = "What is a transformer?"
        task_type = self.agent._determine_task_type(msg)
        assert task_type == "chat"
    
    def test_task_type_detection_calculation(self):
        """Test task type detection for calculation requests"""
        msg = "Calculate the voltage drop for this cable"
        task_type = self.agent._determine_task_type(msg)
        assert task_type == "engineering"
    
    def test_conversation_management(self):
        """Test conversation storage and retrieval with same conversation_id"""
        # Use same conversation_id for both calls
        conversation_id = "test-conversation-123"
        
        input1 = ChatInput(
            workspace_id="test_ws",
            user_id="test_user",
            agent_id="electrical_engineer",
            message="Hello",
            context={},
            conversation_id=conversation_id,
        )
        
        input2 = ChatInput(
            workspace_id="test_ws",
            user_id="test_user",
            agent_id="electrical_engineer",
            message="Hi again",
            context={},
            conversation_id=conversation_id,
        )
        
        conv1 = self.agent._get_or_create_conversation(input1)
        assert conv1.workspace_id == "test_ws"
        assert conv1.user_id == "test_user"
        assert conv1.conversation_id == conversation_id
        assert conv1.messages == []
        
        # Same conversation_id should return same conversation
        conv2 = self.agent._get_or_create_conversation(input2)
        assert conv1.conversation_id == conv2.conversation_id
        assert conv1 is conv2  # Same object reference
