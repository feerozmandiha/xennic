# services/engineering-service/src/core/unit_converter.py
"""
Unit Conversion Engine for Xennic Engineering Platform

Powered by Pint - Python quantities library
Supports all engineering units for electrical power engineering

Supported Categories:
- Voltage: V, kV, MV
- Current: A, kA, mA, µA
- Power: W, kW, MW, HP
- Apparent Power: VA, kVA, MVA
- Reactive Power: VAR, kVAR, MVAR
- Resistance: Ω, mΩ, kΩ, MΩ
- Frequency: Hz, kHz, MHz
- Temperature: °C, °F, K
- Length: m, km, cm, mm, ft, in
- Area: m², cm², mm², kcmil
- Energy: Wh, kWh, MWh, J, kJ
- Time: s, ms, min, h
"""

from typing import Union, List, Optional
from pint import UnitRegistry, UndefinedUnitError, DimensionalityError


class UnitConversionEngine:
    """
    Engineering unit conversion engine
    
    Usage:
        converter = UnitConversionEngine()
        result = converter.convert(1000, "V", "kV")  # Returns 1.0
    """
    
    def __init__(self):
        """Initialize the unit registry with all standard units"""
        self.ureg = UnitRegistry()
        self._setup_engineering_aliases()
    
    def _setup_engineering_aliases(self) -> None:
        """Add engineering-specific unit aliases"""
        # Electrical engineering aliases
        self.ureg.define('kilovolt = 1000 * volt = kV')
        self.ureg.define('megavolt = 1000000 * volt = MV')
        self.ureg.define('kiloampere = 1000 * ampere = kA')
        self.ureg.define('milliampere = 0.001 * ampere = mA')
        self.ureg.define('microampere = 1e-6 * ampere = uA')
        self.ureg.define('kilowatt = 1000 * watt = kW')
        self.ureg.define('megawatt = 1000000 * watt = MW')
        self.ureg.define('kilovar = 1000 * var = kVAR')
        self.ureg.define('megavar = 1000000 * var = MVAR')
        self.ureg.define('kilohm = 1000 * ohm = kΩ')
        self.ureg.define('megohm = 1000000 * ohm = MΩ')
        self.ureg.define('milliohm = 0.001 * ohm = mΩ')
    
    def convert(
        self,
        value: Union[float, int],
        from_unit: str,
        to_unit: str,
    ) -> float:
        """
        Convert a value from one unit to another
        
        Args:
            value: Numeric value to convert
            from_unit: Source unit (e.g., 'V', 'kV', 'A')
            to_unit: Target unit (e.g., 'kV', 'V', 'mA')
            
        Returns:
            Converted value as float
            
        Raises:
            UnitConversionError: If units are incompatible
        """
        try:
            quantity = self.ureg.Quantity(value, from_unit)
            result = quantity.to(to_unit)
            return float(result.magnitude)
        except (UndefinedUnitError, DimensionalityError) as e:
            from .exceptions import UnitConversionError
            raise UnitConversionError(from_unit, to_unit, value) from e
    
    def convert_with_units(
        self,
        value: Union[float, int],
        from_unit: str,
        to_unit: str,
    ) -> dict:
        """
        Convert value and return both value and unit information
        
        Args:
            value: Numeric value to convert
            from_unit: Source unit
            to_unit: Target unit
            
        Returns:
            Dictionary with 'value', 'from_unit', 'to_unit', 'multiplier'
        """
        converted = self.convert(value, from_unit, to_unit)
        multiplier = converted / value if value != 0 else 0
        
        return {
            "value": converted,
            "from_unit": from_unit,
            "to_unit": to_unit,
            "multiplier": multiplier,
        }
    
    def validate_unit(self, unit: str) -> bool:
        """
        Validate if a unit is defined in the registry
        
        Args:
            unit: Unit string to validate
            
        Returns:
            True if unit exists, False otherwise
        """
        try:
            self.ureg.Unit(unit)
            return True
        except UndefinedUnitError:
            return False
    
    def get_compatible_units(self, unit: str) -> List[str]:
        """
        Get all compatible units for a given unit
        
        Args:
            unit: Reference unit
            
        Returns:
            List of compatible unit strings
        """
        if unit.lower() in ['v', 'volt']:
            return ['V', 'kV', 'MV', 'mV']
        if unit.lower() in ['a', 'ampere']:
            return ['A', 'kA', 'mA', 'uA']
        if unit.lower() in ['w', 'watt']:
            return ['W', 'kW', 'MW', 'GW']
        if unit.lower() in ['ohm', 'ω']:
            return ['Ω', 'kΩ', 'MΩ', 'mΩ']
        
        try:
            quantity = self.ureg.Quantity(1, unit)
            units = []
            for u in quantity.compatible_units():
                u_str = str(u)
                if u_str and not u_str.startswith('('):
                    if u_str not in units:
                        units.append(u_str)
                if len(units) >= 15:
                    break
            return units
        except (UndefinedUnitError, DimensionalityError):
            return []
    
    def get_unit_category(self, unit: str) -> Optional[str]:
        """
        Identify the category of a unit
        
        Args:
            unit: Unit string
            
        Returns:
            Category name or None if unknown
        """
        # Normalize unit (remove whitespace and lowercase)
        unit_clean = unit.strip().lower().replace(' ', '')
        
        # Category definitions with keywords
        categories = {
            "voltage": ['volt', 'v', 'kv', 'mv', 'kilovolt', 'megavolt', 'millivolt'],
            "current": ['ampere', 'a', 'ka', 'ma', 'ua', 'kiloampere', 'milliampere', 'microampere'],
            "power": ['watt', 'w', 'kw', 'mw', 'gw', 'hp', 'kilowatt', 'megawatt', 'gigawatt'],
            "apparent_power": ['va', 'kva', 'mva', 'voltampere'],
            "reactive_power": ['var', 'kvar', 'mvar'],
            "resistance": ['ohm', 'ω', 'kω', 'mω', 'kilohm', 'megohm', 'milliohm'],
            "frequency": ['hz', 'khz', 'mhz', 'ghz', 'hertz'],
            "temperature": ['degc', 'degf', 'k', 'celsius', 'fahrenheit', 'kelvin'],
            "length": ['m', 'km', 'cm', 'mm', 'ft', 'in', 'meter', 'foot', 'inch'],
            "area": ['m2', 'm²', 'cm2', 'cm²', 'mm2', 'mm²', 'km2', 'km²'],
            "energy": ['wh', 'kwh', 'mwh', 'j', 'kj', 'mj', 'watt-hour', 'joule'],
            "time": ['s', 'ms', 'min', 'h', 'second', 'minute', 'hour']
        }
        
        for category, keywords in categories.items():
            if any(keyword in unit_clean for keyword in keywords):
                return category
        
        return None
    
    def convert_if_needed(
        self,
        value: float,
        from_unit: str,
        target_unit: str,
    ) -> float:
        """
        Convert only if units are different
        
        Args:
            value: Value to convert
            from_unit: Source unit
            target_unit: Target unit
            
        Returns:
            Original value if units match, converted value otherwise
        """
        if from_unit == target_unit:
            return value
        return self.convert(value, from_unit, target_unit)