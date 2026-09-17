"""ASR (Automatic Speech Recognition) service.

Primary: Bhashini Conformer (22 Indian languages, optimized for noisy environments).
Fallback: Groq Whisper (English-centric, fast).
"""

from __future__ import annotations

import base64
from typing import Any, Optional

import structlog

from app.config import Settings
from app.domain.languages import get_bhashini_code

logger = structlog.get_logger(__name__)


def detect_script_language(text: str) -> Optional[str]:
    """Detect Indian language code from unicode script in text."""
    if not text:
        return None
    for char in text:
        code = ord(char)
        if 0x0900 <= code <= 0x097F:
            return "hi"  # Devanagari (Hindi / Marathi)
        elif 0x0980 <= code <= 0x09FF:
            return "bn"  # Bengali
        elif 0x0B80 <= code <= 0x0BFF:
            return "ta"  # Tamil
        elif 0x0C00 <= code <= 0x0C7F:
            return "te"  # Telugu
        elif 0x0C80 <= code <= 0x0CFF:
            return "kn"  # Kannada
        elif 0x0D00 <= code <= 0x0D7F:
            return "ml"  # Malayalam
        elif 0x0A80 <= code <= 0x0AFF:
            return "gu"  # Gujarati
        elif 0x0A00 <= code <= 0x0A7F:
            return "pa"  # Gurmukhi (Punjabi)
        elif 0x0B00 <= code <= 0x0B7F:
            return "or"  # Odia
        elif 0x0600 <= code <= 0x06FF:
            return "ur"  # Urdu
    return None


WHISPER_LANG_TO_CODE = {
    "hindi": "hi",
    "bengali": "bn",
    "tamil": "ta",
    "telugu": "te",
    "marathi": "mr",
    "gujarati": "gu",
    "kannada": "kn",
    "malayalam": "ml",
    "punjabi": "pa",
    "odia": "or",
    "urdu": "ur",
    "assamese": "as",
    "english": "en",
    "hi": "hi",
    "bn": "bn",
    "ta": "ta",
    "te": "te",
    "mr": "mr",
    "gu": "gu",
    "kn": "kn",
    "ml": "ml",
    "pa": "pa",
    "or": "or",
    "ur": "ur",
    "en": "en",
}


class ASRError(Exception):
    """Raised when speech recognition fails."""


class ASRService:
    """Automatic Speech Recognition service with Bhashini + Groq Whisper."""

    def __init__(
        self,
        settings: Settings,
        bhashini_client: Any = None,
    ) -> None:
        self._settings = settings
        self._bhashini_client = bhashini_client
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
        return self._bhashini_client is not None or self._groq_client is not None

    @staticmethod
    def _clean_audio_payload(audio_bytes: bytes, filename: str = "audio.wav") -> tuple[bytes, str]:
        """Detect and clean audio bytes, unwrap multipart if present, and resolve correct filename."""
        data = audio_bytes
        # If multipart boundary text was sent directly, extract binary body
        if data.startswith(b"--"):
            header_end = data.find(b"\r\n\r\n")
            if header_end != -1:
                boundary_end = data.rfind(b"\r\n--")
                if boundary_end > header_end + 4:
                    data = data[header_end + 4:boundary_end]
                else:
                    data = data[header_end + 4:]

        # Detect audio container by magic bytes
        if data.startswith(b"\x1a\x45\xdf\xa3"):
            return data, "audio.webm"
        elif data.startswith(b"RIFF"):
            return data, "audio.wav"
        elif data.startswith(b"OggS"):
            return data, "audio.ogg"
        elif data.startswith(b"ID3") or (len(data) > 2 and data[:2] == b"\xff\xfb"):
            return data, "audio.mp3"
        elif len(data) > 8 and data[4:8] == b"ftyp":
            return data, "audio.m4a"

        # Fallback to filename extension or webm for browser media
        if "." in filename:
            ext = filename.rsplit(".", 1)[-1].lower()
            if ext in ("webm", "wav", "ogg", "mp3", "m4a", "flac"):
                return data, f"audio.{ext}"
        return data, "audio.webm"

    async def transcribe(
        self,
        audio_bytes: bytes,
        language: str = "auto",
        *,
        sample_rate_hertz: int = 16000,
        encoding: str = "LINEAR16",
        filename: str = "audio.wav",
    ) -> dict:
        """Transcribe audio to text with automatic language detection.

        Priority: Bhashini ASR (primary) → Groq Whisper (fallback / auto-detect).

        Returns:
            dict with keys: 'text', 'confidence', 'language', 'detected_language', 'alternatives'
        """
        clean_bytes, resolved_name = self._clean_audio_payload(audio_bytes, filename)
        is_auto = not language or str(language).lower().strip() in ("auto", "detect", "default")

        # Primary: Bhashini ASR (if specific language requested or if bhashini active)
        if self._bhashini_client and self._settings.asr_provider == "bhashini":
            try:
                target_lang = "hi" if is_auto else language
                res = await self._transcribe_bhashini(clean_bytes, target_lang)
                if res.get("text"):
                    detected = detect_script_language(res.get("text")) or (target_lang if not is_auto else "hi")
                    res["language"] = detected
                    res["detected_language"] = detected
                    return res
            except Exception as e:
                logger.warning("bhashini_asr_error_trying_fallback", error=str(e))

        # Fallback: Groq Whisper (with auto-detect and native script transcription)
        if self._groq_client:
            try:
                res = await self._transcribe_groq(clean_bytes, language, filename=resolved_name)
                if res.get("text"):
                    return res
            except Exception as e:
                logger.warning("groq_whisper_error", error=str(e))

        return {
            "text": "",
            "confidence": 0.0,
            "language": "en" if is_auto else language,
            "detected_language": "en" if is_auto else language,
            "alternatives": [],
        }

    async def _transcribe_bhashini(
        self,
        audio_bytes: bytes,
        language: str = "en",
    ) -> dict:
        """Transcribe audio using Bhashini Conformer ASR."""
        bhashini_lang = get_bhashini_code(language) or language

        # Select model: English-specific or multilingual conformer
        if bhashini_lang == "en":
            service_id = self._settings.bhashini_asr_en_model
        else:
            service_id = self._settings.bhashini_asr_model

        # Encode audio to base64 for Bhashini API
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        result = await self._bhashini_client.asr(
            audio_base64=audio_b64,
            source_lang=bhashini_lang,
            service_id=service_id,
        )

        logger.info(
            "bhashini_asr_transcription_complete",
            language=bhashini_lang,
            text_length=len(result.get("text", "")),
            confidence=result.get("confidence", 0.0),
        )

        text = result.get("text", "").strip()
        detected_lang = detect_script_language(text) or language

        return {
            "text": text,
            "confidence": result.get("confidence", 0.85),
            "language": detected_lang,
            "detected_language": detected_lang,
            "provider": "bhashini",
            "alternatives": [],
        }

    async def _transcribe_groq(
        self,
        audio_bytes: bytes,
        language: str = "auto",
        *,
        filename: str = "audio.webm",
    ) -> dict:
        """Transcribe audio using Groq Whisper with automatic language identification."""
        is_auto = not language or str(language).lower().strip() in ("auto", "detect", "default")
        lang_code = get_bhashini_code(language) or language
        supported_langs = ("en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa")

        file_tuple = (filename, audio_bytes)
        call_kwargs = {
            "file": file_tuple,
            "model": self._settings.whisper_model,
            "response_format": "verbose_json",
        }

        # If a specific supported language was requested and not auto, pass language constraint
        if not is_auto and lang_code in supported_langs:
            call_kwargs["language"] = lang_code

        response = await self._groq_client.audio.transcriptions.create(**call_kwargs)

        text = getattr(response, "text", "") or str(response)
        whisper_lang_raw = str(getattr(response, "language", "")).lower().strip()
        detected_lang = (
            WHISPER_LANG_TO_CODE.get(whisper_lang_raw)
            or detect_script_language(text)
            or (lang_code if not is_auto else "en")
        )

        logger.info(
            "groq_whisper_transcription_complete",
            whisper_detected_language=whisper_lang_raw,
            resolved_language=detected_lang,
            text_length=len(text),
        )

        return {
            "text": text.strip(),
            "confidence": 0.95,
            "language": detected_lang,
            "detected_language": detected_lang,
            "provider": "groq_whisper",
            "alternatives": [],
        }

    async def assess_audio_quality(self, audio_bytes: bytes) -> dict:
        """Assess audio quality metrics (RMS, duration estimation).

        Returns:
            dict with keys: 'status', 'rms_level', 'duration_estimate_sec', 'issues'
        """
        issues = []

        if len(audio_bytes) < 200:
            issues.append("Audio too short (< 0.5 second).")

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
