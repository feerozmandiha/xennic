from fastapi import APIRouter

from app.api.routes.vision import router as vision_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(vision_router)
