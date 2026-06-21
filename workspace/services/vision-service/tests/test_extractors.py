"""Nameplate and bill extractor tests."""
import numpy as np
import pytest

from app.stages.extraction.nameplate import NameplateExtractor
from app.stages.extraction.bill import BillExtractor


@pytest.fixture
def nameplate_ocr_context():
    return {
        "ocr_text": "MODEL: ACME-2000\nMFR: AcmeCorp\n150 kW\n400 V\n250 A\n50 Hz\n1480 RPM\n4 POLE\nCLASS F\nDUTY S1\nIP55\nEFF: 94.2%",
        "ocr_llm_result": None,
        "ocr_raw_blocks": [],
    }


@pytest.mark.asyncio
async def test_nameplate_extractor_regex(nameplate_ocr_context):
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    stage = NameplateExtractor()
    img_out, result = await stage(img, nameplate_ocr_context)

    assert result.success is True
    data = result.data.get("nameplate", {})
    assert data.get("model", "").startswith("ACME")
    assert data.get("power_kw") == 150.0 or data.get("power_kw") == 150
    assert data.get("voltage_v") == 400 or data.get("voltage_v") == "400"
    assert data.get("current_a") == 250 or data.get("current_a") == "250"
    assert data.get("frequency_hz") == 50 or data.get("frequency_hz") == "50"


@pytest.mark.asyncio
async def test_nameplate_extractor_llm_override(nameplate_ocr_context):
    llm_data = {
        "manufacturer": "Siemens",
        "model": "1LA8 160-4",
        "power_kw": 15.0,
        "voltage_v": 400,
    }
    nameplate_ocr_context["ocr_llm_result"] = {"success": True, "data": llm_data}

    img = np.zeros((100, 100, 3), dtype=np.uint8)
    stage = NameplateExtractor()
    img_out, result = await stage(img, nameplate_ocr_context)

    assert result.success is True
    extracted = result.data.get("nameplate", {})
    assert extracted.get("manufacturer") == "Siemens"
    assert extracted.get("model") == "1LA8 160-4"


@pytest.mark.asyncio
async def test_bill_extractor():
    context = {
        "ocr_text": "Bill No: 1404-78901\nCustomer: Ahmad Rezaei\nقبلی: 12500\nفعلی: 13450\nمصرف: 950\nجمع: 1,250,000",
        "ocr_llm_result": None,
    }
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    stage = BillExtractor()
    img_out, result = await stage(img, context)

    assert result.success is True
    data = result.data.get("bill", {})
    assert data.get("bill_number") is not None
    assert data.get("customer_name") is not None
