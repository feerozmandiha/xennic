# services/engineering-service/src/core/exceptions.py
"""
Custom exceptions for Xennic Engineering Calculation Engine

These exceptions provide fine-grained error handling for:
- Calculation errors (formula, execution)
- Validation errors (input, range, schema)
- Unit conversion errors
- Registry errors (duplicate, not found)
"""


class EngineeringCalculationError(Exception):
    """Base exception for all engineering calculation errors"""
    pass


class CalculationError(EngineeringCalculationError):
    """Raised when a calculation fails during execution"""
    def __init__(self, calculation_code: str, message: str, details: dict = None):
        self.calculation_code = calculation_code
        self.details = details or {}
        super().__init__(f"[{calculation_code}] {message}")


class ValidationError(EngineeringCalculationError):
    """Raised when input validation fails"""
    def __init__(self, field: str, value: any, constraint: str):
        self.field = field
        self.value = value
        self.constraint = constraint
        super().__init__(f"Validation failed for '{field}': {value} - {constraint}")


class UnitConversionError(EngineeringCalculationError):
    """Raised when unit conversion fails"""
    def __init__(self, from_unit: str, to_unit: str, value: float = None):
        self.from_unit = from_unit
        self.to_unit = to_unit
        self.value = value
        msg = f"Cannot convert {from_unit} to {to_unit}"
        if value is not None:
            msg = f"Cannot convert {value} {from_unit} to {to_unit}"
        super().__init__(msg)


class RegistryError(EngineeringCalculationError):
    """Raised when calculation registry operations fail"""
    pass


class CalculatorNotFoundError(RegistryError):
    """Raised when a calculator is not found in registry"""
    def __init__(self, calculation_code: str):
        self.calculation_code = calculation_code
        super().__init__(f"Calculator '{calculation_code}' not found in registry")


class DuplicateCalculatorError(RegistryError):
    """Raised when trying to register a duplicate calculator"""
    def __init__(self, calculation_code: str):
        self.calculation_code = calculation_code
        super().__init__(f"Calculator '{calculation_code}' already registered")


class PhysicalRangeError(ValidationError):
    """Raised when a value is outside physical range"""
    def __init__(self, field: str, value: float, min_val: float, max_val: float):
        super().__init__(
            field, value, 
            f"must be between {min_val} and {max_val}"
        )


class PositiveValueError(ValidationError):
    """Raised when a positive value is required"""
    def __init__(self, field: str, value: float):
        super().__init__(field, value, "must be positive")


class NonNegativeValueError(ValidationError):
    """Raised when a non-negative value is required"""
    def __init__(self, field: str, value: float):
        super().__init__(field, value, "must be non-negative")