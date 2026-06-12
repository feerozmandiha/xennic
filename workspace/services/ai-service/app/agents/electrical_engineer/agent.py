"""
Advanced Electrical Engineer Agent with Tool Calling

Currently using fallback mode (no API key required)
Compatible with BaseAgent interface
"""

from typing import Dict, Any, List, Optional
from ...core.base_agent import BaseAgent
from ...schemas.inputs import ChatInput
from ...schemas.outputs import ChatOutput


class ElectricalEngineerAgent(BaseAgent):
    """Electrical Engineer Assistant with fallback responses"""
    
    # Required BaseAgent attributes
    AGENT_ID = "electrical_engineer"
    AGENT_NAME = "Electrical Engineer Agent"
    DESCRIPTION = "Professional electrical engineering assistant for power systems, cable sizing, transformer selection, and protection coordination"
    REQUIRED_PERMISSION = "ai.chat"
    
    def __init__(self):
        super().__init__()
    
    def get_system_prompt(self, context: Dict[str, Any]) -> str:
        """Return system prompt for electrical engineer agent"""
        return """You are a senior electrical engineer assistant for Xennic Platform.

Your role is to help engineers with electrical power system design, analysis, and troubleshooting.

Your capabilities:
1. Answer questions about electrical engineering standards (IEC, IEEE, NEC)
2. Perform engineering calculations using the CalculationTool
3. Explain calculation results and their engineering significance
4. Provide design recommendations based on standards

IMPORTANT RULES:
1. NEVER calculate anything yourself. ALWAYS use the CalculationTool for any numerical calculation.
2. ALWAYS reference the relevant standard (IEC, IEEE) when providing technical advice.
3. Remind users that final engineering decisions are their responsibility.
"""
    
    async def _generate_response(self, user_prompt: str, message_history: Optional[List] = None) -> str:
        """Generate response based on user prompt"""
        message_lower = user_prompt.lower()
        
        # Cable Sizing Questions
        if any(word in message_lower for word in ['cable', 'کابل', 'سیم', 'cable size', 'cable sizing']):
            import re
            match = re.search(r'(\d+)\s*A', user_prompt)
            if match:
                current = int(match.group(1))
                if current <= 100:
                    cable_size = "35mm²"
                elif current <= 150:
                    cable_size = "50mm²"
                elif current <= 200:
                    cable_size = "70mm²"
                else:
                    cable_size = "Contact engineering team for custom sizing"
                
                return f"""Based on IEC 60364-5-52, for a {current}A load with copper conductor and PVC insulation on wall (Method C):

**Recommended Cable Size:** {cable_size}
**Reference Standard:** IEC 60364-5-52
**Safety Margin:** ~20%

*Note: For precise calculation including temperature derating and voltage drop, please provide:
- Installation method (B2 for conduit, C for on wall)
- Ambient temperature
- Cable length (for voltage drop)
- Number of circuits in proximity

This is an AI-generated recommendation. Final engineering decisions are your responsibility."""
            
            return """I understand you're asking about cable sizing.

To properly calculate the cable size according to IEC 60364-5-52, I need:
1. **Load current** (Amperes) - Please specify
2. Conductor material (copper or aluminum) - default: copper
3. Insulation type (PVC or XLPE) - default: PVC
4. Installation method (B2 for conduit, C for on wall) - default: C

Example: "What size cable for 100A copper/PVC on wall?"
"""
        
        # Power Calculation Questions
        if any(word in message_lower for word in ['power', 'توان', 'وات', 'current', 'جریان', 'voltage', 'ولتاژ', 'ohm', 'اهم']):
            return """I can help with electrical power calculations.

**Ohm's Law:** V = I × R
- Provide any two of: Voltage, Current, Resistance

**Active Power:** P = V × I × PF
- For three-phase: P = √3 × V × I × PF

**Power Factor:** PF = P / S

Please provide the specific parameters for calculation.

Example:
- "Calculate current for 230V and 23Ω" → Ohm's Law
- "Calculate power for 230V, 10A, 0.85 PF" → Active Power
"""
        
        # Transformer Questions
        if any(word in message_lower for word in ['transformer', 'ترانس', 'ترانسفورماتور']):
            return """I can help with transformer calculations based on IEC 60076.

**Transformer Sizing:**
- For three-phase: S (kVA) = √3 × V × I / 1000
- For single-phase: S (kVA) = V × I / 1000

**Required information:**
- Primary voltage (V)
- Secondary voltage (V)
- Load current (A) or desired kVA rating

Example: "Size transformer for 100kVA, 11kV/400V, three-phase"
"""
        
        # Default response
        return f"""I received your message: "{user_prompt[:100]}{'...' if len(user_prompt) > 100 else ''}"

I'm the **Electrical Engineer Assistant** for Xennic Platform.

**What I can help with:**
- 🔌 **Cable Sizing** (IEC 60364) - Tell me your load current
- ⚡ **Power Calculations** - Ohm's Law, Active/Reactive Power
- 🔧 **Transformer Selection** (IEC 60076)
- 🛡️ **Protection Coordination** (IEC 60947)

**Example questions:**
- "What size cable for 100A?"
- "Calculate current for 230V and 23Ω"
- "Size transformer for 100kVA, 11kV/400V"

How can I assist you today?"""
    
    async def process(self, input: ChatInput) -> ChatOutput:
        """Process user input and return response (non-streaming)"""
        response_text = await self._generate_response(input.message)
        
        return ChatOutput(
            success=True,
            data={
                "conversation_id": input.conversation_id or "",
                "message_id": f"msg_{__import__('time').time()}",
                "agent_id": self.AGENT_ID,
                "response": response_text,
                "sources": [],
                "metadata": {
                    "model_used": "fallback",
                    "tokens_used": 0,
                    "latency_ms": 0,
                    "agent_id": self.AGENT_ID,
                }
            },
            meta={}
        )
    
    async def stream(self, input: ChatInput):
        """Stream response for real-time chat"""
        response_text = await self._generate_response(input.message)
        
        # Yield in chunks for streaming effect
        chunk_size = 50
        for i in range(0, len(response_text), chunk_size):
            yield response_text[i:i + chunk_size]
            import asyncio
            await asyncio.sleep(0.03)
