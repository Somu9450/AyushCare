"""Centralised application configuration via pydantic-settings.

All secrets and tunables are loaded from environment variables or a .env file.
No secret is ever hardcoded or committed to source control.
"""

from __future__ import annotations

from enum import Enum
from functools import lru_cache
from typing import Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    """Application settings loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── General ──────────────────────────────────────────────────────────
    environment: Environment = Environment.DEVELOPMENT
    app_name: str = "MediKiosk AI"
    app_version: str = "1.0.0"
    debug: bool = False
    log_level: str = "INFO"
    enable_docs: bool = False

    # ── Server ───────────────────────────────────────────────────────────
    host: str = "127.0.0.1"
    port: int = 8000
    allowed_origins: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
    )

    # ── LLM — Google Gemini (primary) ────────────────────────────────────
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-3.6-flash"
    gemini_model_advanced: str = "gemini-3.6-flash"
    gemini_max_tokens: int = 8192
    gemini_temperature: float = 0.2

    # ── LLM — Groq (fast, free fallback) ─────────────────────────────────
    groq_api_key: Optional[str] = None
    groq_model: str = "openai/gpt-oss-120b"
    groq_max_tokens: int = 8192
    groq_temperature: float = 0.2
    llm_request_timeout_seconds: float = 10.0

    # ── OCR ──────────────────────────────────────────────────────────────
    ocr_provider: str = "gemini_vision"  # "gemini_vision" (free with Gemini) | "tesseract"
    tesseract_cmd: Optional[str] = None

    # ── ASR — Speech-to-Text ─────────────────────────────────────────────
    asr_provider: str = "groq_whisper"  # "groq_whisper" (free with Groq key)
    whisper_model: str = "whisper-large-v3-turbo"

    # ── TTS — Text-to-Speech ─────────────────────────────────────────────
    tts_provider: str = "edge_tts"  # "edge_tts" (100% free neural voices)

    # ── Database ─────────────────────────────────────────────────────────
    database_url: str = "sqlite+aiosqlite:///./medikiosk_dev.db"
    database_echo: bool = False

    # ── Redis ────────────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"
    session_ttl_seconds: int = 1800  # 30 minutes

    # ── Security ─────────────────────────────────────────────────────────
    secret_key: str = "CHANGE-ME-IN-PRODUCTION"
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 60

    # ── Rate Limiting ────────────────────────────────────────────────────
    rate_limit_per_minute: int = 60

    # ── File Storage ─────────────────────────────────────────────────────
    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 20

    @field_validator("secret_key")
    @classmethod
    def _warn_default_secret(cls, v: str) -> str:
        if v == "CHANGE-ME-IN-PRODUCTION":
            import warnings
            warnings.warn(
                "Using default secret key. Set SECRET_KEY env var in production.",
                stacklevel=2,
            )
        return v

    @property
    def is_production(self) -> bool:
        return self.environment == Environment.PRODUCTION

    @property
    def primary_llm_available(self) -> bool:
        return self.gemini_api_key is not None

    @property
    def fallback_llm_available(self) -> bool:
        return self.groq_api_key is not None


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached singleton settings instance."""
    return Settings()
