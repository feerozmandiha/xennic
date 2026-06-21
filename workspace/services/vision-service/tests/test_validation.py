"""Validation and knowledge engine tests."""
import numpy as np
import pytest

from app.stages.validation.engine import ValidationStage
from app.stages.knowledge.engine import KnowledgeEngine


@pytest.mark.asyncio
async def test_validation_valid_data():
    context = {
        "extracted_data": {
            "power_kw": 150.0,
            "voltage_v": 400,
            "current_a": 250,
            "frequency_hz": 50,
            "speed_rpm": 1480,
            "efficiency_pct": 94.2,
            "power_factor": 0.85,
        }
    }
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    stage = ValidationStage()
    img_out, result = await stage(img, context)
    assert result.success is True


@pytest.mark.asyncio
async def test_validation_invalid_data():
    context = {
        "extracted_data": {
            "power_kw": 100000,  # exceeds 50000
            "voltage_v": 100,     # within range
            "current_a": 50000,   # exceeds range
            "speed_rpm": 0,
            "efficiency_pct": 150,  # > 100
        }
    }
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    stage = ValidationStage()
    img_out, result = await stage(img, context)
    # Should have errors for out-of-range values
    assert len(result.errors) > 0


@pytest.mark.asyncio
async def test_knowledge_motor_inference():
    context = {
        "extracted_data": {
            "power_kw": 15.0,
            "voltage_v": 400,
            "current_a": 29.0,
            "speed_rpm": 1460,
            "frequency_hz": 50,
            "poles": 4,
            "efficiency_pct": 90.0,
        }
    }
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    stage = KnowledgeEngine()
    img_out, result = await stage(img, context)
    assert result.success is True
    knowledge = result.data.get("knowledge", {})
    assert "inferred_device_type" in knowledge
    assert "synchronous_speed_rpm" in knowledge
    assert knowledge.get("synchronous_speed_rpm") == 1500  # 120*50/4


@pytest.mark.asyncio
async def test_knowledge_no_data():
    context = {"extracted_data": {}}
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    stage = KnowledgeEngine()
    img_out, result = await stage(img, context)
    assert result.success is True
