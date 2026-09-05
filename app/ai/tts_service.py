"""TTS (Text-to-Speech) service for reading questions aloud to patients.

Powered by Microsoft Edge Neural TTS (100% Free, zero billing, natural Indian language voices).
"""

from __future__ import annotations

import base64

import structlog

from app.config import Settings

logger = structlog.get_logger(__name__)


class TTSError(Exception):
    """Raised when text-to-speech synthesis fails."""


# Microsoft Edge Neural Voices for Indian languages (Free, no keys needed)
_EDGE_VOICE_MAP: dict[str, str] = {
    "en": "en-IN-NeerjaNeural",
    "hi": "hi-IN-MadhurNeural",
    "bn": "bn-IN-BashkarNeural",
    "ta": "ta-IN-PallaviNeural",
    "te": "te-IN-MohanNeural",
    "mr": "mr-IN-AarohiNeural",
    "gu": "gu-IN-DhwaniNeural",
    "kn": "kn-IN-GaganNeural",
    "ml": "ml-IN-MidhunNeural",
    "pa": "hi-IN-MadhurNeural",
}


class TTSService:
    """Text-to-Speech service for patient-facing audio output."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    @property
    def is_available(self) -> bool:
        try:
            import edge_tts
            return True
        except ImportError:
            return False

    async def synthesize(
        self,
        text: str,
        language: str = "en",
        *,
        speaking_rate: float = 0.9,
        audio_encoding: str = "MP3",
    ) -> dict:
        """Convert text to speech audio using free Edge Neural TTS.

        Args:
            text: Text to synthesize.
            language: 2-letter language code.
            speaking_rate: Speed of speech (0.25 to 4.0, default 0.9 for clarity).
            audio_encoding: Output format (defaults to "MP3").

        Returns:
            dict with keys: 'audio_base64', 'encoding', 'duration_estimate_sec'
        """
        try:
            import edge_tts

            voice = _EDGE_VOICE_MAP.get(language, "en-IN-NeerjaNeural")
            rate_diff = int((speaking_rate - 1.0) * 100)
            rate_str = f"{rate_diff:+d}%"

            communicate = edge_tts.Communicate(text, voice, rate=rate_str)
            audio_chunks: list[bytes] = []

            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_chunks.append(chunk["data"])

            audio_bytes = b"".join(audio_chunks)
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
            duration_estimate = (len(text) / 5) / (150 * speaking_rate) * 60

            logger.info(
                "edge_tts_synthesis_complete",
                voice=voice,
                text_length=len(text),
                audio_bytes=len(audio_bytes),
            )

            return {
                "audio_base64": audio_b64,
                "encoding": audio_encoding,
                "duration_estimate_sec": round(duration_estimate, 1),
            }
        except Exception as e:
            logger.error("edge_tts_failed", error=str(e))
            raise TTSError(f"TTS synthesis failed: {e}") from e
