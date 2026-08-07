import cv2
import numpy as np
import pytesseract
import pytest

from app.stages.preprocessing.deskew import DeskewStage


@pytest.fixture
def readable_image() -> np.ndarray:
    image = np.full((900, 1600, 3), 255, dtype=np.uint8)

    lines = [
        "MODEL: ACME-2000",
        "POWER: 150 kW",
        "VOLTAGE: 400 V",
        "CURRENT: 250 A",
        "FREQUENCY: 50 Hz",
        "SPEED: 1480 RPM",
        "EFFICIENCY: 94.2%",
    ]

    for index, line in enumerate(lines):
        cv2.putText(
            image,
            line,
            (80, 80 + index * 100),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.8,
            (0, 0, 0),
            3,
            cv2.LINE_AA,
        )

    return image


@pytest.mark.asyncio
async def test_deskew_preserves_readable_horizontal_text(readable_image):
    stage = DeskewStage()

    output, result = await stage.process(readable_image, {})

    assert output is not None
    assert output.size > 0
    assert output.shape == readable_image.shape
    assert result.success is True

    gray = cv2.cvtColor(output, cv2.COLOR_BGR2GRAY)

    text = pytesseract.image_to_string(
        gray,
        lang="eng",
        config="--oem 3 --psm 6",
    )

    normalized = " ".join(text.upper().split())

    assert len(normalized) > 0
    assert "MODEL" in normalized
    assert "ACME" in normalized


@pytest.mark.asyncio
async def test_deskew_does_not_return_empty_image(readable_image):
    stage = DeskewStage()

    output, result = await stage.process(readable_image, {})

    assert output is not None
    assert output.size > 0
    assert output.shape[0] > 0
    assert output.shape[1] > 0
    assert result.confidence >= 0.0


@pytest.mark.asyncio
async def test_deskew_handles_blank_image_without_crashing():
    image = np.full((900, 1600, 3), 255, dtype=np.uint8)
    stage = DeskewStage()

    output, result = await stage.process(image, {})

    assert output is not None
    assert output.shape == image.shape
    assert result.success is True
    assert result.data.get("corrected") is False


@pytest.mark.asyncio
async def test_deskew_preserves_small_image_safely():
    image = np.zeros((64, 64, 3), dtype=np.uint8)
    stage = DeskewStage()

    output, result = await stage.process(image, {})

    assert output is not None
    assert output.shape == image.shape
    assert result.success is True
