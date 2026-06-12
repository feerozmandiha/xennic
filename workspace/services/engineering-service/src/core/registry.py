# services/engineering-service/src/core/registry.py
"""
Calculation Registry - Thread-safe singleton registry for all calculators

Features:
- Singleton pattern (only one registry instance)
- Thread-safe with Lock
- Register calculators by code
- Retrieve calculators by code
- List all registered calculators
- Filter by category

Design Principles:
- Immutable after production registration
- Version aware
- Category-based grouping
"""

from typing import Dict, Type, List, Optional
from threading import Lock

from .base_calculator import BaseCalculator
from .exceptions import RegistryError, CalculatorNotFoundError, DuplicateCalculatorError


class CalculationRegistry:
    """
    Thread-safe singleton registry for all engineering calculators
    
    Usage:
        registry = CalculationRegistry()
        registry.register(OhmsLawCalculator)
        
        calculator = registry.get("BASIC-001")
        result = calculator().execute(inputs)
    """
    
    _instance: Optional['CalculationRegistry'] = None
    _lock: Lock = Lock()
    _calculators: Dict[str, Type[BaseCalculator]] = {}
    _is_frozen: bool = False
    
    def __new__(cls) -> 'CalculationRegistry':
        """Singleton pattern implementation"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialize()
        return cls._instance
    
    def _initialize(self) -> None:
        """Initialize the registry instance"""
        self._calculators = {}
        self._is_frozen = False
    
    def register(self, calculator_class: Type[BaseCalculator]) -> None:
        """
        Register a calculator class in the registry (thread-safe)
        
        Args:
            calculator_class: Calculator class (subclass of BaseCalculator)
            
        Raises:
            ValueError: If calculator has no CALCULATION_CODE
            DuplicateCalculatorError: If calculator already registered
            RegistryError: If registry is frozen
        """
        if self._is_frozen:
            raise RegistryError("Registry is frozen, cannot register new calculators")
        
        code = calculator_class.CALCULATION_CODE
        if not code:
            raise ValueError(
                f"Calculator {calculator_class.__name__} must have CALCULATION_CODE class attribute"
            )
        
        # CRITICAL: Whole operation must be inside lock for thread safety
        with self._lock:
            if code in self._calculators:
                raise DuplicateCalculatorError(code)
            self._calculators[code] = calculator_class
    
    def get(self, code: str) -> Type[BaseCalculator]:
        """
        Get calculator class by its calculation code (thread-safe)
        
        Args:
            code: Unique calculation code (e.g., "BASIC-001")
            
        Returns:
            Calculator class
            
        Raises:
            CalculatorNotFoundError: If calculator not found
        """
        with self._lock:
            if code not in self._calculators:
                raise CalculatorNotFoundError(code)
            return self._calculators[code]
    
    def list_all(self) -> List[Dict[str, str]]:
        """
        List all registered calculators with metadata (thread-safe)
        
        Returns:
            List of dictionaries with calculator metadata
        """
        with self._lock:
            return [
                {
                    "code": calc.CALCULATION_CODE,
                    "name": calc.CALCULATION_NAME,
                    "standard": calc.STANDARD,
                    "standard_version": calc.STANDARD_VERSION,
                    "version": calc.FORMULA_VERSION,
                }
                for calc in self._calculators.values()
            ]
    
    def get_by_category(self, category: str) -> List[Type[BaseCalculator]]:
        """
        Get calculators by category (based on calculation code prefix)
        
        Args:
            category: Category prefix (e.g., "BASIC", "CABLE", "TRANSFORMER")
            
        Returns:
            List of calculator classes matching the category
        """
        with self._lock:
            return [
                calc for calc in self._calculators.values()
                if calc.CALCULATION_CODE.startswith(category)
            ]
    
    def get_by_standard(self, standard: str) -> List[Type[BaseCalculator]]:
        """
        Get calculators by standard reference
        
        Args:
            standard: Standard name (e.g., "IEC 60050", "IEEE 519")
            
        Returns:
            List of calculator classes using the standard
        """
        with self._lock:
            return [
                calc for calc in self._calculators.values()
                if calc.STANDARD == standard
            ]
    
    def has(self, code: str) -> bool:
        """
        Check if a calculator is registered
        
        Args:
            code: Calculation code
            
        Returns:
            True if registered, False otherwise
        """
        with self._lock:
            return code in self._calculators
    
    def count(self) -> int:
        """
        Get total number of registered calculators
        
        Returns:
            Number of registered calculators
        """
        with self._lock:
            return len(self._calculators)
    
    def freeze(self) -> None:
        """
        Freeze the registry - no more registrations allowed
        
        Call this in production after all calculators are registered
        """
        with self._lock:
            self._is_frozen = True
    
    def clear(self) -> None:
        """
        Clear all registered calculators (for testing only)
        
        Warning: This should only be used in tests
        """
        if not self._is_frozen:
            with self._lock:
                self._calculators.clear()
    
    def __len__(self) -> int:
        return self.count()
    
    def __contains__(self, code: str) -> bool:
        return self.has(code)