"""Pipeline orchestrator tests."""
import pytest

from app.core.pipeline import Pipeline
from app.core.result import PipelineResult
from app.core.stage import PipelineStage


class DummyStage(PipelineStage):
    async def process(self, image, context):
        return image, self._make_result(name=self.name, success=True, confidence=1.0, data={})

    def _make_result(self, **kw):
        from app.core.result import StageResult
        return StageResult(**kw)


class FailingStage(PipelineStage):
    async def process(self, image, context):
        return image, self._make_result(name=self.name, success=False, confidence=0.0, errors=["fail"])

    def _make_result(self, **kw):
        from app.core.result import StageResult
        return StageResult(**kw)


@pytest.mark.asyncio
async def test_pipeline_empty(sample_image_bgr):
    pipe = Pipeline()
    result = await pipe.run(sample_image_bgr)
    assert isinstance(result, PipelineResult)
    assert result.success is True


@pytest.mark.asyncio
async def test_pipeline_with_stages(sample_image_bgr):
    pipe = Pipeline([DummyStage("stage1"), DummyStage("stage2")])
    result = await pipe.run(sample_image_bgr)
    assert result.success is True
    assert result.pipeline_trace == ["stage1", "stage2"]
    assert len(result.stage_results) == 2


@pytest.mark.asyncio
async def test_pipeline_failing_stage(sample_image_bgr):
    pipe = Pipeline([DummyStage("s1"), FailingStage("s2"), DummyStage("s3")])
    result = await pipe.run(sample_image_bgr)
    assert result.success is False
    # Pipeline should stop at failing stage
    assert result.pipeline_trace[-1] == "s2"


@pytest.mark.asyncio
async def test_pipeline_confidence(sample_image_bgr):
    pipe = Pipeline([DummyStage("s1")])
    result = await pipe.run(sample_image_bgr)
    assert 0.0 <= result.confidence <= 1.0
