"""Reusable fixtures for vision-service tests."""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pytest

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"

NP_DTYPE = np.uint8


@pytest.fixture
def sample_image_bgr() -> np.ndarray:
    """Return a 320x240 synthetic BGR image."""
    img = np.random.randint(50, 200, (240, 320, 3), dtype=NP_DTYPE)
    # Add some text-like patterns
    img[20:40, 30:120] = (255, 255, 255)   # white band
    img[60:80, 30:200] = (200, 200, 200)   # gray band
    img[100:120, 30:150] = (255, 255, 255)
    return img


@pytest.fixture
def sample_image_gray() -> np.ndarray:
    """Return a 240x320 grayscale image."""
    return np.random.randint(50, 200, (240, 320), dtype=NP_DTYPE)


@pytest.fixture
def blank_image() -> np.ndarray:
    """Return a nearly-blank image for validation tests."""
    return np.full((100, 100, 3), 128, dtype=NP_DTYPE)


@pytest.fixture
def nameplate_text() -> str:
    return """MODEL: ACME-2000
    MFR: AcmeCorp
    S/N: 2024-78901
    150 kW
    400 V
    250 A
    50 Hz
    1480 RPM
    4 POLE
    CLASS F
    DUTY S1
    IP55
    EFF: 94.2%
    """
