# tests/test_core/test_validation.py
import pytest
from pydantic import BaseModel
from src.core.validation import ValidationEngine
from src.core.exceptions import (
    ValidationError, PhysicalRangeError, PositiveValueError, NonNegativeValueError
)


class TestSchema(BaseModel):
    voltage: float
    current: float
    frequency: float


def test_validate_positive():
    """Test positive value validation"""
    assert ValidationEngine.validate_positive(10.5, "voltage") is True
    assert ValidationEngine.validate_positive(0.001, "current") is True


def test_validate_positive_fails():
    """Test positive value validation failure"""
    with pytest.raises(PositiveValueError) as exc:
        ValidationEngine.validate_positive(-5.0, "voltage")
    assert "voltage" in str(exc.value)


def test_validate_positive_with_zero_allowed():
    """Test positive validation allowing zero"""
    assert ValidationEngine.validate_positive(0, "value", allow_zero=True) is True


def test_validate_non_negative():
    """Test non-negative value validation"""
    assert ValidationEngine.validate_non_negative(0, "value") is True
    assert ValidationEngine.validate_non_negative(100, "value") is True


def test_validate_non_negative_fails():
    """Test non-negative value validation failure"""
    with pytest.raises(NonNegativeValueError):
        ValidationEngine.validate_non_negative(-1, "value")


def test_validate_physical_range():
    """Test physical range validation"""
    assert ValidationEngine.validate_physical_range(50, 0, 100, "voltage") is True


def test_validate_physical_range_min_fails():
    """Test physical range validation fails below min"""
    with pytest.raises(PhysicalRangeError):
        ValidationEngine.validate_physical_range(-10, 0, 100, "voltage")


def test_validate_physical_range_max_fails():
    """Test physical range validation fails above max"""
    with pytest.raises(PhysicalRangeError):
        ValidationEngine.validate_physical_range(150, 0, 100, "voltage")


def test_validate_by_category():
    """Test validation by engineering category"""
    # Valid voltage
    assert ValidationEngine.validate_by_category(230, "voltage", "line_voltage") is True
    # Valid power factor
    assert ValidationEngine.validate_by_category(0.85, "power_factor", "pf") is True


def test_validate_by_category_fails():
    """Test validation by category fails"""
    with pytest.raises(PhysicalRangeError):
        ValidationEngine.validate_by_category(1.5, "power_factor", "pf")  # PF > 1


def test_validate_schema_success():
    """Test Pydantic schema validation success"""
    data = {"voltage": 230.0, "current": 10.0, "frequency": 50.0}
    result = ValidationEngine.validate_schema(data, TestSchema)
    assert isinstance(result, TestSchema)
    assert result.voltage == 230.0


def test_validate_schema_fails():
    """Test Pydantic schema validation failure"""
    data = {"voltage": "invalid", "current": 10.0, "frequency": 50.0}
    with pytest.raises(ValidationError):
        ValidationEngine.validate_schema(data, TestSchema)


def test_validate_not_none():
    """Test not None validation"""
    assert ValidationEngine.validate_not_none(100, "value") is True
    assert ValidationEngine.validate_not_none("test", "value") is True


def test_validate_not_none_fails():
    """Test not None validation fails"""
    with pytest.raises(ValidationError):
        ValidationEngine.validate_not_none(None, "value")


def test_validate_length():
    """Test string length validation"""
    assert ValidationEngine.validate_length("hello", 1, 10, "name") is True


def test_validate_length_fails():
    """Test string length validation fails"""
    with pytest.raises(ValidationError):
        ValidationEngine.validate_length("a", 2, 10, "name")


def test_validate_in_enum():
    """Test enum validation"""
    allowed = ["RED", "GREEN", "BLUE"]
    assert ValidationEngine.validate_in_enum("RED", allowed, "color") is True


def test_validate_in_enum_fails():
    """Test enum validation fails"""
    allowed = ["RED", "GREEN", "BLUE"]
    with pytest.raises(ValidationError):
        ValidationEngine.validate_in_enum("YELLOW", allowed, "color")