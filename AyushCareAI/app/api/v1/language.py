"""Language catalog and Bhashini translation endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.dependencies import get_translation_service
from app.domain.languages import list_supported_languages, get_locale
from app.ai.translation_service import TranslationService

router = APIRouter(tags=["Language"] )

class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4000)
    source_language: str = Field(..., min_length=2, max_length=10)
    target_language: str = Field(..., min_length=2, max_length=10)

@router.get("/languages")
async def languages() -> dict:
    return {"languages": list_supported_languages()}

@router.post("/translate")
async def translate_text(body: TranslationRequest, service: TranslationService = Depends(get_translation_service)) -> dict:
    source = body.source_language.lower().split("-")[0]
    target = body.target_language.lower().split("-")[0]
    if not get_locale(source) or not get_locale(target):
        raise HTTPException(status_code=400, detail="Unsupported source or target language")
    try:
        translated = await service.translate(body.text, source, target)
    except Exception:
        translated = body.text
    return {"text": translated, "source_language": source, "target_language": target, "provider": "bhashini"}
