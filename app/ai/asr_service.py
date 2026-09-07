"""ASR (Automatic Speech Recognition) service.

Powered by Groq Whisper (Free, ultra-fast, state-of-the-art multilingual).
"""

from __future__ import annotations

from typing import Any, Optional

import structlog

from app.config import Settings
from app.domain.languages import get_bhashini_code

logger = structlog.get_logger(__name__)


class ASRError(Exception):
    """Raised when speech recognition fails."""


class ASRService:
    """Automatic Speech Recognition service using Groq Whisper."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._groq_client: Any = None
        self._initialize()

    def _initialize(self) -> None:
        if self._settings.groq_api_key:
            try:
                from groq import AsyncGroq
                self._groq_client = AsyncGroq(api_key=self._settings.groq_api_key)
                logger.info("asr_provider_initialized", provider="groq_whisper")
            except Exception as e:
                logger.warning("asr_groq_init_failed", error=str(e))

    @property
    def is_available(self) -> bool:
        return self._groq_client is not None

    async def transcribe(
        self,
        audio_bytes: bytes,
        language: str = "en",
        *,
        sample_rate_hertz: int = 16000,
        encoding: str = "LINEAR16",
        filename: str = "audio.wav",
    ) -> dict:
        """Transcribe audio to text.

        Args:
            audio_bytes: Raw audio data.
            language: 2-letter language code.
            sample_rate_hertz: Audio sample rate.
            encoding: Audio encoding format.

        Returns:
            dict with keys: 'text', 'confidence', 'language', 'alternatives'
        """
        if not self._groq_client:
            raise ASRError("Groq API key not configured. Set GROQ_API_KEY in .env for speech recognition.")

        return await self._transcribe_groq(audio_bytes, language, filename=filename)

    async def _transcribe_groq(
        self,
        audio_bytes: bytes,
        language: str = "en",
        *,
        filename: str = "audio.wav",
    ) -> dict:
        """Transcribe audio using Groq Whisper."""
        lang_code = get_bhashini_code(language) or language
        supported_langs = ("en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa")
        selected_lang = lang_code if lang_code in supported_langs else "en"

        safe_name = filename if "." in filename else "audio.wav"
        file_tuple = (safe_name, audio_bytes)

        response = await self._groq_client.audio.transcriptions.create(
            file=file_tuple,
            model=self._settings.whisper_model,
            language=selected_lang,
            response_format="verbose_json",
        )

        text = getattr(response, "text", "") or str(response)

        logger.info(
            "groq_whisper_transcription_complete",
            language=selected_lang,
            text_length=len(text),
        )

        return {
            "text": text.strip(),
            "confidence": 0.95,
            "language": language,
            "alternatives": [],
        }

    async def assess_audio_quality(self, audio_bytes: bytes) -> dict:
        """Assess audio quality metrics (RMS, duration estimation).

        Returns:
            dict with keys: 'status', 'rms_level', 'duration_estimate_sec', 'issues'
        """
        issues = []

        if len(audio_bytes) < 1000:
            issues.append("Audio too short (< 1 second).")

        rms = 0.0
        # RMS sampling is meaningful for PCM/WAV, but not for compressed
        # browser recordings such as WebM/Opus. Never reject those recordings
        # based on a WAV-specific byte offset.
        if audio_bytes[:4] == b"RIFF" and len(audio_bytes) > 44:
            import struct
            samples = []
            data = audio_bytes[44:]
            for i in range(0, min(len(data), 32000), 2):
                if i + 1 < len(data):
                    try:
                        sample = struct.unpack_from("<h", data, i)[0]
                        samples.append(sample)
                    except struct.error:
                        break
            if samples:
                rms = (sum(s * s for s in samples) / len(samples)) ** 0.5
                if rms < 200:
                    issues.append("Audio level too low. Speak closer to the microphone.")
                elif rms > 30000:
                    issues.append("Audio is clipping. Move away from the microphone.")

        duration_estimate = len(audio_bytes) / (16000 * 2)

        return {
            "status": "acceptable" if not issues else "poor",
            "rms_level": round(rms, 1),
            "duration_estimate_sec": round(duration_estimate, 1),
            "issues": issues,
        }
