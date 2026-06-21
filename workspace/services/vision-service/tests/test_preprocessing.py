"""Preprocessing stage tests."""
import numpy as np
import pytest

from app.stages.preprocessing.validator import ImageValidator
from app.stages.preprocessing.enhancer import ImageEnhancer
from app.stages.preprocessing.deskew import DeskewStage
from app.stages.preprocessing.denoiser import Denoiser


@pytest.mark.asyncio
async def test_validator_accepts_valid(sample_image_bgr):
    stage = ImageValidator()
    img, result = await stage(sample_image_bgr)
    assert result.success is True


@pytest.mark.asyncio
async def test_validator_rejects_small():
    tiny = np.zeros((10, 10, 3), dtype=np.uint8)
    stage = ImageValidator()
    img, result = await stage(tiny)
    assert result.success is False


@pytest.mark.asyncio
async def test_enhancer(sample_image_bgr):
    stage = ImageEnhancer()
    img, result = await stage(sample_image_bgr)
    assert result.success is True
    assert img.shape == sample_image_bgr.shape


@pytest.mark.asyncio
async def test_denoiser(sample_image_bgr):
    stage = Denoiser()
    img, result = await stage(sample_image_bgr)
    assert result.success is True
    assert img.shape == sample_image_bgr.shape


@pytest.mark.asyncio
async def test_deskew(sample_image_bgr):
    stage = DeskewStage()
    img, result = await stage(sample_image_bgr)
    assert result.success is True
