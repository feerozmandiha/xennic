# services/engineering-service/src/core/base_calculator.py
"""
Base Calculator Framework for Xennic Engineering Engine

This module provides the foundation for all engineering calculations.
Every calculator must inherit from BaseCalculator and implement:
- validate_inputs()
- _calculate()
- get_units()

Design Principles:
- Standard-Based: Every calculation references a standard
- Version Controlled: Every formula has a version
- Reproducible: Same inputs = Same outputs
- Auditable: Every result includes metadata
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Generic, TypeVar, ClassVar
from pydantic import BaseModel, ConfigDict
from datetime import datetime, timezone
from decimal import Decimal

from .exceptions import ValidationError as CustomValidationError

T = TypeVar('T', bound='CalculationInput')


class CalculationInput(BaseModel):
    """
    Base class for all calculation inputs
    
    Features:
    - Strict validation (no extra fields)
    - Type safety
    - JSON serializable
    """
    model_config = ConfigDict(
        extra='forbid',
        str_strip_whitespace=True,
        validate_default=True,
        frozen=True,  # Immutable inputs for reproducibility
    )


class CalculationResult(BaseModel):
    """
    Standard calculation result structure
    
    According to XENNIC_CALCULATION_CATALOG_v1:
    Every calculation must include:
    - Unique Code
    - Formula Version
    - Standard Reference
    - Inputs
    - Outputs
    - Units
    - Timestamp
    """
    calculation_code: str
    calculation_name: str
    formula_version: str
    standard: str
    standard_version: str
    engine_version: str
    inputs: Dict[str, Any]
    results: Dict[str, Any]
    units: Dict[str, str]
    warnings: list[str] = []
    recommendations: list[str] = []
    calculation_timestamp: datetime
    
    model_config = ConfigDict(
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    )


class BaseCalculator(ABC, Generic[T]):
    """
    Base class for all engineering calculators
    
    Usage:
        class OhmsLawInput(CalculationInput):
            voltage_v: float | None = None
            current_a: float | None = None
            resistance_ohm: float | None = None
        
        class OhmsLawCalculator(BaseCalculator[OhmsLawInput]):
            CALCULATION_CODE = "BASIC-001"
            CALCULATION_NAME = "Ohm's Law"
            FORMULA_VERSION = "1.0"
            STANDARD = "IEC 60050"
            STANDARD_VERSION = "2023"
            
            def validate_inputs(self, inputs: OhmsLawInput) -> bool:
                # Count provided inputs
                provided = sum(1 for v in [inputs.voltage_v, inputs.current_a, inputs.resistance_ohm] if v is not None)
                if provided != 2:
                    raise CustomValidationError("inputs", provided, "exactly 2 of 3 parameters required")
                return True
            
            def _calculate(self, inputs: OhmsLawInput) -> dict:
                # Calculation logic
                pass
            
            def get_units(self) -> dict:
                return {"voltage_v": "V", "current_a": "A", "resistance_ohm": "Ω"}
    """
    
    # Class-level metadata (must be overridden by subclasses)
    CALCULATION_CODE: ClassVar[str] = ""
    CALCULATION_NAME: ClassVar[str] = ""
    FORMULA_VERSION: ClassVar[str] = "1.0"
    STANDARD: ClassVar[str] = ""
    STANDARD_VERSION: ClassVar[str] = ""
    ENGINE_VERSION: ClassVar[str] = "0.1.0"
    
    @abstractmethod
    def validate_inputs(self, inputs: T) -> bool:
        """
        Validate input parameters according to engineering rules
        
        Args:
            inputs: Calculation input parameters
            
        Returns:
            True if valid
            
        Raises:
            ValidationError: If validation fails
        """
        pass
    
    @abstractmethod
    def _calculate(self, inputs: T) -> Dict[str, Any]:
        """
        Perform the core calculation (internal method)
        
        Args:
            inputs: Validated calculation input parameters
            
        Returns:
            Dictionary of calculation results
        """
        pass
    
    @abstractmethod
    def get_units(self) -> Dict[str, str]:
        """
        Return units for all inputs and outputs
        
        Returns:
            Dictionary mapping field names to units
        """
        pass
    
    def execute(self, inputs: T) -> CalculationResult:
        """
        Execute the complete calculation pipeline
        
        Pipeline:
        1. Validate inputs
        2. Perform calculation
        3. Build standard result
        4. Return structured output
        
        Args:
            inputs: Calculation input parameters
            
        Returns:
            Standardized calculation result
            
        Raises:
            ValidationError: If validation fails
            CalculationError: If calculation fails
        """
        # Step 1: Validate
        self.validate_inputs(inputs)
        
        # Step 2: Calculate
        results = self._calculate(inputs)
        
        # Step 3: Build result
        return CalculationResult(
            calculation_code=self.CALCULATION_CODE,
            calculation_name=self.CALCULATION_NAME,
            formula_version=self.FORMULA_VERSION,
            standard=self.STANDARD,
            standard_version=self.STANDARD_VERSION,
            engine_version=self.ENGINE_VERSION,
            inputs=inputs.model_dump(),
            results=results,
            units=self.get_units(),
            calculation_timestamp=datetime.now(timezone.utc),
        )
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} code={self.CALCULATION_CODE}>"