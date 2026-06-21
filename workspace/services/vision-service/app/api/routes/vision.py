from __future__ import annotations

from typing import Any

import cv2
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from app.core.pipeline import Pipeline
from app.schemas.inputs import (
    VisionResponse,
    DocumentType,
    ProcessingMode,
)
from app.stages.preprocessing.validator import ImageValidator
from app.stages.preprocessing.enhancer import ImageEnhancer
from app.stages.preprocessing.corrector import PerspectiveCorrector
from app.stages.preprocessing.deskew import DeskewStage
from app.stages.preprocessing.denoiser import Denoiser
from app.stages.detection.classifier import DocumentClassifier
from app.stages.ocr.stage import OCRStage
from app.stages.extraction.nameplate import NameplateExtractor
from app.stages.extraction.bill import BillExtractor
from app.stages.validation.engine import ValidationStage
from app.stages.knowledge.engine import KnowledgeEngine

router = APIRouter(prefix="/vision", tags=["vision"])


def _decode_image(contents: bytes) -> np.ndarray:
    if contents[:4] == b'%PDF':
        try:
            import fitz
            doc = fitz.open(stream=contents, filetype="pdf")
            page = doc[0]
            pix = page.get_pixmap(dpi=200)
            img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
                pix.height, pix.width, 3
            )
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            doc.close()
            return img
        except Exception as e:
            raise HTTPException(400, detail=f"PDF conversion failed: {e}")

    arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(400, detail="Invalid or corrupted image")
    return img


def _build_pipeline(doc_type: DocumentType, mode: ProcessingMode) -> Pipeline:
    pipe = Pipeline()

    # Preprocessing
    pipe.add_stage(ImageValidator())
    pipe.add_stage(ImageEnhancer())
    pipe.add_stage(PerspectiveCorrector())
    pipe.add_stage(DeskewStage())
    pipe.add_stage(Denoiser())

    # Detection
    pipe.add_stage(DocumentClassifier())

    # OCR — always
    pipe.add_stage(OCRStage())

    # Extraction
    if doc_type == DocumentType.nameplate:
        pipe.add_stage(NameplateExtractor())
    elif doc_type == DocumentType.bill:
        pipe.add_stage(BillExtractor())

    # Validation + knowledge (only in analyze mode)
    if mode == ProcessingMode.analyze:
        pipe.add_stage(ValidationStage())
        pipe.add_stage(KnowledgeEngine())

    return pipe


@router.post("/nameplate/read")
async def read_nameplate(
    file: UploadFile = File(...),
    mode: str = Form("read"),
) -> VisionResponse:
    """Read an electrical equipment nameplate and return structured data."""
    contents = await file.read()
    image = _decode_image(contents)
    doc_type = DocumentType.nameplate
    proc_mode = ProcessingMode(mode)

    pipe = _build_pipeline(doc_type, proc_mode)
    ctx: dict[str, Any] = {"document_type": doc_type.value}
    result = await pipe.run(image, context=ctx)

    return VisionResponse(**result.to_dict())


@router.post("/nameplate/analyze")
async def analyze_nameplate(
    file: UploadFile = File(...),
) -> VisionResponse:
    """Read and analyze an electrical nameplate with engineering knowledge."""
    contents = await file.read()
    image = _decode_image(contents)
    doc_type = DocumentType.nameplate
    proc_mode = ProcessingMode.analyze

    pipe = _build_pipeline(doc_type, proc_mode)
    ctx: dict[str, Any] = {"document_type": doc_type.value}
    result = await pipe.run(image, context=ctx)

    return VisionResponse(**result.to_dict())


@router.post("/bill/read")
async def read_bill(
    file: UploadFile = File(...),
    mode: str = Form("read"),
) -> VisionResponse:
    """Read an electricity bill and return structured data."""
    contents = await file.read()
    image = _decode_image(contents)
    doc_type = DocumentType.bill
    proc_mode = ProcessingMode(mode)

    pipe = _build_pipeline(doc_type, proc_mode)
    ctx: dict[str, Any] = {"document_type": doc_type.value}
    result = await pipe.run(image, context=ctx)

    return VisionResponse(**result.to_dict())


@router.post("/bill/analyze")
async def analyze_bill(
    file: UploadFile = File(...),
) -> VisionResponse:
    """Read and analyze an electricity bill with engineering knowledge."""
    contents = await file.read()
    image = _decode_image(contents)
    doc_type = DocumentType.bill
    proc_mode = ProcessingMode.analyze

    pipe = _build_pipeline(doc_type, proc_mode)
    ctx: dict[str, Any] = {"document_type": doc_type.value}
    result = await pipe.run(image, context=ctx)

    return VisionResponse(**result.to_dict())


@router.post("/ocr")
async def generic_ocr(
    file: UploadFile = File(...),
) -> VisionResponse:
    """Generic OCR — extract all text from any document."""
    contents = await file.read()
    image = _decode_image(contents)
    doc_type = DocumentType.generic

    pipe = _build_pipeline(doc_type, ProcessingMode.read)
    ctx: dict[str, Any] = {"document_type": doc_type.value}
    result = await pipe.run(image, context=ctx)

    return VisionResponse(**result.to_dict())


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
) -> VisionResponse:
    """Unified upload — auto-detect document type and extract data.
    
    Accepts any file (bill, nameplate, or generic document).
    Runs classification → appropriate extraction pipeline.
    """
    contents = await file.read()
    image = _decode_image(contents)

    # Phase 1: Preprocess + OCR (document-agnostic)
    detect_pipe = Pipeline()
    detect_pipe.add_stage(ImageValidator())
    detect_pipe.add_stage(ImageEnhancer())
    detect_pipe.add_stage(PerspectiveCorrector())
    detect_pipe.add_stage(DeskewStage())
    detect_pipe.add_stage(Denoiser())
    detect_pipe.add_stage(OCRStage())

    ctx: dict[str, Any] = {"document_type": DocumentType.generic.value}
    result = await detect_pipe.run(image, context=ctx)

    # Phase 2: Classify using OCR text + visual heuristics
    classifier = DocumentClassifier()
    _, cls_result = await classifier(image, ctx)
    result.add_stage(cls_result)
    detected_type = ctx.get("detected_type", DocumentType.generic)

    # Phase 3: Run appropriate extractor
    if detected_type == DocumentType.nameplate:
        extractor = NameplateExtractor()
        image, stage_result = await extractor(image, ctx)
        result.add_stage(stage_result)
    elif detected_type == DocumentType.bill:
        extractor = BillExtractor()
        image, stage_result = await extractor(image, ctx)
        result.add_stage(stage_result)
    else:
        result.warnings.append("Document type not recognized — returning raw OCR")

    # Merge extracted data into result.data (preserve combined_text from OCR)
    extracted = ctx.get("extracted_data", {})
    result.data.update(extracted)
    result.data["detected_type"] = detected_type.value

    return VisionResponse(**result.to_dict())


@router.post("/preprocess")
async def preprocess_only(
    file: UploadFile = File(...),
) -> VisionResponse:
    """Run preprocessing pipeline only (validation, enhancement, correction)."""
    contents = await file.read()
    image = _decode_image(contents)

    pipe = Pipeline()
    pipe.add_stage(ImageValidator())
    pipe.add_stage(ImageEnhancer())
    pipe.add_stage(PerspectiveCorrector())
    pipe.add_stage(DeskewStage())
    pipe.add_stage(Denoiser())

    result = await pipe.run(image)

    return VisionResponse(**result.to_dict())
