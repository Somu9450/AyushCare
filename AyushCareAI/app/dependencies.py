"""FastAPI dependency injection providers.

Provides singleton service instances to API route handlers via Depends().
"""

from __future__ import annotations

from functools import lru_cache

from app.ai.asr_service import ASRService
from app.ai.llm_service import LLMService
from app.ai.ocr_service import OCRService
from app.ai.tts_service import TTSService
from app.config import Settings, get_settings
from app.services.clinical_summary import ClinicalSummaryService
from app.services.consent_manager import ConsentManager
from app.services.conversation_engine import ConversationEngine
from app.services.document_intelligence import DocumentIntelligenceService
from app.services.fhir_mapper import FHIRMapper
from app.services.red_flag_detector import RedFlagDetector


# ── Settings ─────────────────────────────────────────────────────────────

def get_config() -> Settings:
    return get_settings()


# ── AI Provider Singletons ───────────────────────────────────────────────

@lru_cache(maxsize=1)
def get_llm_service() -> LLMService:
    return LLMService(get_settings())


@lru_cache(maxsize=1)
def get_ocr_service() -> OCRService:
    return OCRService(get_settings())


@lru_cache(maxsize=1)
def get_asr_service() -> ASRService:
    return ASRService(get_settings())


@lru_cache(maxsize=1)
def get_tts_service() -> TTSService:
    return TTSService(get_settings())


# ── Business Service Singletons ──────────────────────────────────────────

@lru_cache(maxsize=1)
def get_conversation_engine() -> ConversationEngine:
    return ConversationEngine(
        llm=get_llm_service(),
        asr=get_asr_service(),
        tts=get_tts_service(),
    )


@lru_cache(maxsize=1)
def get_document_intelligence() -> DocumentIntelligenceService:
    return DocumentIntelligenceService(
        ocr=get_ocr_service(),
        llm=get_llm_service(),
    )


@lru_cache(maxsize=1)
def get_clinical_summary_service() -> ClinicalSummaryService:
    return ClinicalSummaryService(llm=get_llm_service())


@lru_cache(maxsize=1)
def get_red_flag_detector() -> RedFlagDetector:
    return RedFlagDetector(llm=get_llm_service())


@lru_cache(maxsize=1)
def get_fhir_mapper() -> FHIRMapper:
    return FHIRMapper()


@lru_cache(maxsize=1)
def get_consent_manager() -> ConsentManager:
    return ConsentManager()
