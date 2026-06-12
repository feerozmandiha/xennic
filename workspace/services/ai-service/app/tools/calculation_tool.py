"""
Calculation Tool - Bridge between AI Agent and Engineering Service

IMPORTANT: AI agents MUST use this tool for ALL engineering calculations.
AI agents are NEVER allowed to perform calculations themselves.
"""

import httpx
from typing import Dict, Any, Optional
from datetime import datetime

from ..config.settings import settings


class CalculationTool:
    """
    Tool for AI agents to call Engineering Service calculations
    
    Usage:
        tool = CalculationTool()
        result = await tool.calculate("BASIC-001", {"current_a": 10.0, "resistance_ohm": 5.0})
    
    IMPORTANT RULES:
    1. AI must NEVER calculate itself
    2. AI must ALWAYS use this tool for calculations
    3. Results from this tool are authoritative
    """
    
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.ENGINEERING_SERVICE_URL
        self._client = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client"""
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=30.0)
        return self._client
    
    async def calculate(
        self,
        calculation_code: str,
        inputs: Dict[str, Any],
        endpoint: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Execute a calculation via Engineering Service API
        
        Args:
            calculation_code: Code of the calculator (e.g., "BASIC-001", "CABLE-001")
            inputs: Input parameters for the calculation
            endpoint: Optional custom endpoint (defaults to /calculations/{code})
            
        Returns:
            Calculation result with success/data/meta structure
            
        Raises:
            httpx.HTTPError: If the API call fails
        """
        client = await self._get_client()
        
        # Map calculation code to endpoint
        if endpoint is None:
            endpoint = self._code_to_endpoint(calculation_code)
        
        url = f"{self.base_url}{endpoint}"
        
        response = await client.post(url, json=inputs)
        response.raise_for_status()
        
        return response.json()
    
    def _code_to_endpoint(self, calculation_code: str) -> str:
        """
        Map calculation code to API endpoint
        
        BASIC-001 -> /api/v1/engineering/basic/ohms-law
        CABLE-001 -> /api/v1/engineering/cable/sizing
        TRF-001 -> /api/v1/engineering/transformer/sizing
        PROT-001 -> /api/v1/engineering/protection/mccb-selection
        """
        mapping = {
            # Basic Electrical
            "BASIC-001": "/api/v1/engineering/basic/ohms-law",
            "BASIC-002": "/api/v1/engineering/basic/active-power",
            "BASIC-003": "/api/v1/engineering/basic/apparent-power",
            "BASIC-004": "/api/v1/engineering/basic/reactive-power",
            "BASIC-005": "/api/v1/engineering/basic/power-factor",
            # Cable Engineering
            "CABLE-001": "/api/v1/engineering/cable/sizing",
            "CABLE-002": "/api/v1/engineering/cable/voltage-drop",
            "CABLE-003": "/api/v1/engineering/cable/short-circuit",
            "CABLE-004": "/api/v1/engineering/cable/pe-sizing",
            # Transformer Engineering
            "TRF-001": "/api/v1/engineering/transformer/sizing",
            "TRF-002": "/api/v1/engineering/transformer/losses",
            "TRF-003": "/api/v1/engineering/transformer/regulation",
            "TRF-004": "/api/v1/engineering/transformer/k-factor",
            # Protection Engineering
            "PROT-001": "/api/v1/engineering/protection/mccb-selection",
        }
        
        return mapping.get(calculation_code, f"/api/v1/engineering/calculations/{calculation_code}")
    
    async def get_health(self) -> Dict[str, Any]:
        """Check if Engineering Service is healthy"""
        client = await self._get_client()
        response = await client.get(f"{self.base_url}/health")
        response.raise_for_status()
        return response.json()
    
    async def close(self):
        """Close HTTP client"""
        if self._client:
            await self._client.aclose()
            self._client = None
