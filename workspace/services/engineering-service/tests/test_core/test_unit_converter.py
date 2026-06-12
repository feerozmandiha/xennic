# tests/test_core/test_unit_converter.py
import pytest
from src.core.unit_converter import UnitConversionEngine
from src.core.exceptions import UnitConversionError


@pytest.fixture
def converter():
    return UnitConversionEngine()


def test_voltage_conversion(converter):
    """Test voltage conversion V to kV"""
    result = converter.convert(1000, "V", "kV")
    assert abs(result - 1.0) < 0.000001


def test_voltage_conversion_reverse(converter):
    """Test voltage conversion kV to V"""
    result = converter.convert(1, "kV", "V")
    assert abs(result - 1000.0) < 0.000001


def test_current_conversion(converter):
    """Test current conversion kA to A"""
    result = converter.convert(1, "kA", "A")
    assert abs(result - 1000.0) < 0.000001


def test_current_conversion_milli(converter):
    """Test current conversion A to mA"""
    result = converter.convert(0.5, "A", "mA")
    assert abs(result - 500.0) < 0.000001


def test_power_conversion(converter):
    """Test power conversion MW to kW"""
    result = converter.convert(1, "MW", "kW")
    assert abs(result - 1000.0) < 0.000001


def test_power_conversion_kw_to_w(converter):
    """Test power conversion kW to W"""
    result = converter.convert(5.5, "kW", "W")
    assert abs(result - 5500.0) < 0.000001


def test_resistance_conversion(converter):
    """Test resistance conversion kΩ to Ω"""
    result = converter.convert(1, "kΩ", "Ω")
    assert abs(result - 1000.0) < 0.000001


def test_temperature_conversion(converter):
    """Test temperature conversion °C to °F"""
    result = converter.convert(0, "degC", "degF")
    assert abs(result - 32.0) < 0.000001


def test_invalid_unit_conversion(converter):
    """Test invalid unit conversion raises error"""
    with pytest.raises(UnitConversionError):
        converter.convert(100, "V", "A")  # Voltage to current - incompatible


def test_validate_unit_valid(converter):
    """Test validating a valid unit"""
    assert converter.validate_unit("V") is True
    assert converter.validate_unit("kV") is True
    assert converter.validate_unit("A") is True


def test_validate_unit_invalid(converter):
    """Test validating an invalid unit"""
    assert converter.validate_unit("invalid_unit_xyz") is False


def test_compatible_units(converter):
    """Test getting compatible units"""
    units = converter.get_compatible_units("V")
    assert len(units) > 0
    assert any("kV" in u for u in units)


def test_unit_category_voltage(converter):
    """Test unit category detection for voltage"""
    assert converter.get_unit_category("V") == "voltage"
    assert converter.get_unit_category("kV") == "voltage"


def test_unit_category_current(converter):
    """Test unit category detection for current"""
    assert converter.get_unit_category("A") == "current"
    assert converter.get_unit_category("kA") == "current"


def test_convert_with_units(converter):
    """Test convert_with_units method"""
    result = converter.convert_with_units(1000, "V", "kV")
    assert result["value"] == 1.0
    assert result["from_unit"] == "V"
    assert result["to_unit"] == "kV"
    assert result["multiplier"] == 0.001


def test_convert_if_needed_same_unit(converter):
    """Test convert_if_needed with same unit (no conversion)"""
    result = converter.convert_if_needed(100, "V", "V")
    assert result == 100


def test_convert_if_needed_different_unit(converter):
    """Test convert_if_needed with different unit"""
    result = converter.convert_if_needed(1000, "V", "kV")
    assert abs(result - 1.0) < 0.000001