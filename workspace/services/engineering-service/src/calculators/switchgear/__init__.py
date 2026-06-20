"""
Switchgear Engineering Module

Based on:
- IEC 61439-1: Low-voltage switchgear and controlgear assemblies
- IEC 60947-2: Circuit-breakers
- IEC 60947-3: Switches, disconnectors, switch-disconnectors and fuse-combination units
"""

from .main_switch import MainSwitchCalculator

__all__ = [
    "MainSwitchCalculator",
]
