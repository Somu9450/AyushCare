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
        return self._groq_client is not None or bool(self._settings.gemini_api_key)

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
        language: str = "en",
        *,
        sample_rate_hertz: int = 16000,
        encoding: str = "LINEAR16",
        filename: str = "audio.wav",
    ) -> dict:
        """Transcribe audio to text with Groq Whisper and Gemini fallback.

        Args:
            audio_bytes: Raw audio data.
            language: 2-letter language code.
            sample_rate_hertz: Audio sample rate.
            encoding: Audio encoding format.

        Returns:
            dict with keys: 'text', 'confidence', 'language', 'alternatives'
        """
        clean_bytes, resolved_name = self._clean_audio_payload(audio_bytes, filename)

        # Primary: Groq Whisper
        if self._groq_client:
            try:
                res = await self._transcribe_groq(clean_bytes, language, filename=resolved_name)
                if res.get("text"):
                    return res
            except Exception as e:
                logger.warning("groq_whisper_error_trying_fallback", error=str(e))

        # Fallback: Google Gemini
        if self._settings.gemini_api_key:
            try:
                gemini_text = await self._transcribe_gemini(clean_bytes, language, resolved_name)
                if gemini_text:
                    return {
                        "text": gemini_text,
                        "confidence": 0.90,
                        "language": language,
                        "alternatives": [],
                    }
            except Exception as e:
                logger.warning("gemini_asr_failed", error=str(e))

        return {
            "text": "",
            "confidence": 0.0,
            "language": language,
            "alternatives": [],
        }

    async def _transcribe_groq(
        self,
        audio_bytes: bytes,
        language: str = "en",
        *,
        filename: str = "audio.webm",
    ) -> dict:
        """Transcribe audio using Groq Whisper."""
        lang_code = get_bhashini_code(language) or language
        supported_langs = ("en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa")
        selected_lang = lang_code if lang_code in supported_langs else "en"

        file_tuple = (filename, audio_bytes)

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

    async def _transcribe_gemini(
        self,
        audio_bytes: bytes,
        language: str = "en",
        filename: str = "audio.webm",
    ) -> str:
        """Transcribe audio using Google Gemini multimodal capabilities."""
        import google.generativeai as genai
        genai.configure(api_key=self._settings.gemini_api_key)

        model_name = self._settings.gemini_model or "gemini-3.6-flash"
        model = genai.GenerativeModel(model_name)

        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "webm"
        mime_type = f"audio/{ext}" if ext != "m4a" else "audio/mp4"

        prompt = (
            f"Please transcribe this spoken audio accurately. The expected language is '{language}'. "
            "Output ONLY the transcribed words with no comments, introductory phrases, or markdown formatting. "
            "If the audio is silence or unintelligible noise, output an empty string."
        )

        response = await model.generate_content_async([
            {"mime_type": mime_type, "data": audio_bytes},
            prompt,
        ])

        text = (response.text or "").strip()
        logger.info("gemini_transcription_complete", language=language, text_length=len(text))
        return text

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

