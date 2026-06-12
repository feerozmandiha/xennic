# tests/test_core/test_registry.py
import pytest
import threading
from src.core.registry import CalculationRegistry
from src.core.base_calculator import BaseCalculator, CalculationInput
from src.core.exceptions import CalculatorNotFoundError, DuplicateCalculatorError


class TestInput(CalculationInput):
    value: float


class TestCalculator1(BaseCalculator[TestInput]):
    CALCULATION_CODE = "TEST-001"
    CALCULATION_NAME = "Test 1"
    FORMULA_VERSION = "1.0"
    STANDARD = "TEST"
    STANDARD_VERSION = "2026"
    ENGINE_VERSION = "0.1.0"
    
    def validate_inputs(self, inputs): return True
    def _calculate(self, inputs): return {"result": inputs.value * 2}
    def get_units(self): return {}


class TestCalculator2(BaseCalculator[TestInput]):
    CALCULATION_CODE = "BASIC-001"
    CALCULATION_NAME = "Basic Test"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEC"
    STANDARD_VERSION = "2023"
    ENGINE_VERSION = "0.1.0"
    
    def validate_inputs(self, inputs): return True
    def _calculate(self, inputs): return {"result": inputs.value}
    def get_units(self): return {}


def test_registry_singleton():
    """Test that registry is a singleton"""
    registry1 = CalculationRegistry()
    registry2 = CalculationRegistry()
    assert registry1 is registry2


def test_registry_register_and_get():
    """Test registering and retrieving a calculator"""
    registry = CalculationRegistry()
    registry.clear()
    registry.register(TestCalculator1)
    
    retrieved = registry.get("TEST-001")
    assert retrieved == TestCalculator1


def test_registry_list_all():
    """Test listing all registered calculators"""
    registry = CalculationRegistry()
    registry.clear()
    registry.register(TestCalculator1)
    registry.register(TestCalculator2)
    
    calculators = registry.list_all()
    assert len(calculators) == 2
    codes = [c["code"] for c in calculators]
    assert "TEST-001" in codes
    assert "BASIC-001" in codes


def test_registry_duplicate_registration():
    """Test that duplicate registration raises error"""
    registry = CalculationRegistry()
    registry.clear()
    registry.register(TestCalculator1)
    
    with pytest.raises(DuplicateCalculatorError):
        registry.register(TestCalculator1)


def test_registry_get_not_found():
    """Test that getting non-existent calculator raises error"""
    registry = CalculationRegistry()
    registry.clear()
    
    with pytest.raises(CalculatorNotFoundError):
        registry.get("NON-EXISTENT")


def test_registry_get_by_category():
    """Test filtering calculators by category"""
    registry = CalculationRegistry()
    registry.clear()
    registry.register(TestCalculator1)  # TEST-001
    registry.register(TestCalculator2)  # BASIC-001
    
    basic_calcs = registry.get_by_category("BASIC")
    assert len(basic_calcs) == 1
    assert basic_calcs[0] == TestCalculator2


def test_registry_has_method():
    """Test has method"""
    registry = CalculationRegistry()
    registry.clear()
    registry.register(TestCalculator1)
    
    assert registry.has("TEST-001") is True
    assert registry.has("NONE") is False


def test_registry_count():
    """Test count method"""
    registry = CalculationRegistry()
    registry.clear()
    registry.register(TestCalculator1)
    registry.register(TestCalculator2)
    
    assert registry.count() == 2
    assert len(registry) == 2


def test_registry_thread_safe():
    """Test thread safety of registry"""
    registry = CalculationRegistry()
    registry.clear()
    
    results = []
    
    def register_calculator():
        class DynamicCalculator(BaseCalculator[TestInput]):
            CALCULATION_CODE = f"THREAD-{threading.current_thread().ident}"
            CALCULATION_NAME = "Thread Test"
            FORMULA_VERSION = "1.0"
            STANDARD = "TEST"
            STANDARD_VERSION = "2026"
            ENGINE_VERSION = "0.1.0"
            
            def validate_inputs(self, inputs): return True
            def _calculate(self, inputs): return {}
            def get_units(self): return {}
        
        try:
            registry.register(DynamicCalculator)
            results.append(True)
        except Exception:
            results.append(False)
    
    threads = [threading.Thread(target=register_calculator) for _ in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    
    assert all(results)