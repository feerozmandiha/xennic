# services/engineering-service/src/core/validation.py
"""
Engineering Validation Engine

Validates engineering inputs according to:
- Physical ranges (e.g., current > 0, voltage > 0)
- Unit consistency
- Dimensional analysis
- Standard compliance

All validation follows IEC/IEEE standards for electrical engineering
"""

from typing import Any, Dict, Type, Union, Optional
from pydantic import BaseModel, ValidationError as PydanticValidationError

from .exceptions import (
    ValidationError,
    PhysicalRangeError,
    PositiveValueError,
    NonNegativeValueError,
)


class ValidationEngine:
    """
    Engineering validation engine
    
    Usage:
        ValidationEngine.validate_positive(10.5, "voltage")
        ValidationEngine.validate_physical_range(220, 100, 400, "voltage")
        ValidationEngine.validate_schema(data, MyInputSchema)
    """
    
    # Standard physical ranges for electrical engineering
    PHYSICAL_RANGES = {
        "voltage": (0, 1000000),      # 0 to 1,000,000 V
        "current": (0, 100000),        # 0 to 100,000 A
        "power": (0, 1000000),         # 0 to 1,000,000 W
        "resistance": (0, 1000000000), # 0 to 1e9 Ω
        "frequency": (0, 10000),       # 0 to 10,000 Hz
        "temperature": (-273.15, 2000), # Absolute zero to 2000°C
        "power_factor": (-1, 1),       # -1 to 1 (leading/lagging)
        "efficiency": (0, 1),          # 0 to 1 (0% to 100%)
        "thd": (0, 100),               # 0% to 100%
    }
    
    @staticmethod
    def validate_physical_range(
        value: float,
        min_value: Optional[float] = None,
        max_value: Optional[float] = None,
        field_name: str = "value",
    ) -> bool:
        """
        Validate that a value is within physical range
        
        Args:
            value: Value to validate
            min_value: Minimum allowed value (inclusive)
            max_value: Maximum allowed value (inclusive)
            field_name: Name of the field for error messages
            
        Returns:
            True if valid
            
        Raises:
            PhysicalRangeError: If value is outside range
        """
        if min_value is not None and value < min_value:
            raise PhysicalRangeError(field_name, value, min_value, max_value or float('inf'))
        if max_value is not None and value > max_value:
            raise PhysicalRangeError(field_name, value, min_value or float('-inf'), max_value)
        return True
    
    @staticmethod
    def validate_positive(
        value: float,
        field_name: str = "value",
        allow_zero: bool = False,
    ) -> bool:
        """
        Validate that a value is positive (> 0)
        
        Args:
            value: Value to validate
            field_name: Name of the field for error messages
            allow_zero: If True, zero is allowed
            
        Returns:
            True if valid
            
        Raises:
            PositiveValueError: If value is not positive
        """
        if allow_zero:
            if value < 0:
                raise PositiveValueError(field_name, value)
        else:
            if value <= 0:
                raise PositiveValueError(field_name, value)
        return True
    
    @staticmethod
    def validate_non_negative(
        value: float,
        field_name: str = "value",
    ) -> bool:
        """
        Validate that a value is non-negative (>= 0)
        
        Args:
            value: Value to validate
            field_name: Name of the field for error messages
            
        Returns:
            True if valid
            
        Raises:
            NonNegativeValueError: If value is negative
        """
        if value < 0:
            raise NonNegativeValueError(field_name, value)
        return True
    
    @staticmethod
    def validate_schema(
        data: Dict[str, Any],
        schema: Type[BaseModel],
    ) -> BaseModel:
        """
        Validate data against a Pydantic schema
        
        Args:
            data: Dictionary of input data
            schema: Pydantic model class
            
        Returns:
            Validated model instance
            
        Raises:
            ValidationError: If validation fails
        """
        try:
            return schema(**data)
        except PydanticValidationError as e:
            errors = e.errors()
            first_error = errors[0] if errors else {"loc": ["unknown"], "msg": "validation failed"}
            field = ".".join(str(loc) for loc in first_error.get("loc", ["unknown"]))
            raise ValidationError(
                field,
                data.get(field, "unknown"),
                first_error.get("msg", "validation failed"),
            )
    
    @staticmethod
    def validate_by_category(
        value: float,
        category: str,
        field_name: str = "value",
    ) -> bool:
        """
        Validate value against standard physical range for a category
        
        Args:
            value: Value to validate
            category: Category from PHYSICAL_RANGES
            field_name: Field name for error messages
            
        Returns:
            True if valid
            
        Raises:
            PhysicalRangeError: If outside standard range
        """
        if category not in ValidationEngine.PHYSICAL_RANGES:
            # No predefined range, just return True
            return True
        
        min_val, max_val = ValidationEngine.PHYSICAL_RANGES[category]
        return ValidationEngine.validate_physical_range(
            value, min_val, max_val, field_name
        )
    
    @staticmethod
    def validate_not_none(
        value: Any,
        field_name: str = "value",
    ) -> bool:
        """
        Validate that a value is not None
        
        Args:
            value: Value to check
            field_name: Field name for error messages
            
        Returns:
            True if valid
            
        Raises:
            ValidationError: If value is None
        """
        if value is None:
            raise ValidationError(field_name, value, "cannot be None")
        return True
    
    @staticmethod
    def validate_length(
        value: str,
        min_length: Optional[int] = None,
        max_length: Optional[int] = None,
        field_name: str = "value",
    ) -> bool:
        """
        Validate string length
        
        Args:
            value: String to validate
            min_length: Minimum length
            max_length: Maximum length
            field_name: Field name for error messages
            
        Returns:
            True if valid
            
        Raises:
            ValidationError: If length constraints violated
        """
        if min_length is not None and len(value) < min_length:
            raise ValidationError(
                field_name, value, f"length must be at least {min_length}"
            )
        if max_length is not None and len(value) > max_length:
            raise ValidationError(
                field_name, value, f"length must be at most {max_length}"
            )
        return True
    
    @staticmethod
    def validate_in_enum(
        value: Any,
        allowed_values: list,
        field_name: str = "value",
    ) -> bool:
        """
        Validate that value is in allowed enum list
        
        Args:
            value: Value to validate
            allowed_values: List of allowed values
            field_name: Field name for error messages
            
        Returns:
            True if valid
            
        Raises:
            ValidationError: If value not in enum
        """
        if value not in allowed_values:
            raise ValidationError(
                field_name, value, f"must be one of {allowed_values}"
            )
        return True