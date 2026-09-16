"""Translation service using Bhashini NMT (IndicTrans v2).

Provides bidirectional translation between English and 22 Indian languages.
Used as a bridge layer: ASR(regional) → NMT(→English) → LLM → NMT(→regional) → TTS.
"""

from __future__ import annotations

from typing import Any

import structlog

from app.config import Settings

logger = structlog.get_logger(__name__)


class TranslationError(Exception):
    """Raised when translation fails."""


class TranslationService:
    """Bhashini NMT-powered translation service."""

    def __init__(self, bhashini_client: Any, settings: Settings, llm_service: Optional[Any] = None) -> None:
        self._bhashini = bhashini_client
        self._settings = settings
        self._llm = llm_service

    @property
    def is_available(self) -> bool:
        return self._bhashini is not None or (self._llm is not None and self._llm.is_available)

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
    ) -> str:
        """Translate text between languages using Bhashini NMT with LLM fallback.

        If source == target, returns text as-is.

        Args:
            text: Text to translate.
            source_lang: ISO 639-1 source language code.
            target_lang: ISO 639-1 target language code.

        Returns:
            Translated text string.
        """
        if not text or not text.strip():
            return text

        if source_lang == target_lang:
            return text

        # 1. Primary: Bhashini NMT
        if self._bhashini is not None:
            try:
                result = await self._bhashini.translate(
                    text=text,
                    source_lang=source_lang,
                    target_lang=target_lang,
                    service_id=self._settings.bhashini_nmt_model,
                )

                translated = result.get("translated_text", "")
                if translated and translated.strip():
                    logger.info(
                        "translation_complete",
                        provider="bhashini",
                        source_lang=source_lang,
                        target_lang=target_lang,
                        input_len=len(text),
                        output_len=len(translated),
                    )
                    return translated.strip()

            except Exception as e:
                logger.warning(
                    "bhashini_translation_failed_trying_llm",
                    source_lang=source_lang,
                    target_lang=target_lang,
                    error=str(e),
                )

        # 2. Fallback: Fast LLM (Groq) translation
        if self._llm is not None and self._llm.is_available:
            try:
                prompt = (
                    f"Translate the following healthcare/kiosk text from {source_lang} to {target_lang}. "
                    "Provide ONLY the direct translation without any explanation, quotes, or conversational preamble:\n\n"
                    f"{text}"
                )
                translated = await self._llm.generate(
                    system_prompt="You are a professional medical and multilingual translation assistant for healthcare kiosks.",
                    user_prompt=prompt,
                    temperature=0.1,
                    max_tokens=1000,
                )
                cleaned = (translated or "").strip().strip('"').strip("'")
                if cleaned:
                    logger.info(
                        "translation_complete",
                        provider="llm_groq",
                        source_lang=source_lang,
                        target_lang=target_lang,
                        input_len=len(text),
                        output_len=len(cleaned),
                    )
                    return cleaned
            except Exception as e:
                logger.warning(
                    "llm_translation_failed",
                    source_lang=source_lang,
                    target_lang=target_lang,
                    error=str(e),
                )

        # 3. Graceful fallback: return original text
        return text

    async def translate_to_english(self, text: str, source_lang: str) -> str:
        """Translate any language to English.

        If source_lang is already 'en', returns text as-is.
        """
        if source_lang == "en":
            return text
        return await self.translate(text, source_lang, "en")

    async def translate_from_english(self, text: str, target_lang: str) -> str:
        """Translate English text to the target language.

        If target_lang is 'en', returns text as-is.
        """
        if target_lang == "en":
            return text
        return await self.translate(text, "en", target_lang)

    async def detect_and_translate(
        self,
        text: str,
        target_lang: str,
    ) -> tuple[str, str]:
        """Auto-detect source language and translate.

        Uses Bhashini text language detection, then translates.

        Returns:
            Tuple of (translated_text, detected_source_lang).
        """
        if not text or not text.strip():
            return text, "en"

        try:
            detection = await self._bhashini.detect_language_text(
                text=text,
                service_id=self._settings.bhashini_tld_model,
            )
            detected_lang = detection.get("detected_language", "en")
        except Exception as e:
            logger.warning("language_detection_failed_defaulting_to_en", error=str(e))
            detected_lang = "en"

        if detected_lang == target_lang:
            return text, detected_lang

        translated = await self.translate(text, detected_lang, target_lang)
        return translated, detected_lang
