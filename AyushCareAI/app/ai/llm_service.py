"""LLM service — unified interface for Gemini (primary) and Groq (fallback).

Provides structured output parsing, automatic retry with exponential backoff,
and transparent provider fallback.
"""

from __future__ import annotations

import asyncio
import json
from typing import Any, Optional

import structlog
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.config import Settings

logger = structlog.get_logger(__name__)


class LLMError(Exception):
    """Raised when all LLM providers fail."""


class LLMService:
    """Unified LLM interface with provider fallback."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._gemini_client: Any = None
        self._groq_client: Any = None
        self._initialize_providers()

    def _initialize_providers(self) -> None:
        """Lazily initialize LLM provider clients."""
        if self._settings.gemini_api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self._settings.gemini_api_key)
                self._gemini_client = genai
                logger.info("llm_provider_initialized", provider="gemini")
            except Exception as e:
                logger.warning("llm_gemini_init_failed", error=str(e))

        if self._settings.groq_api_key:
            try:
                from groq import AsyncGroq
                self._groq_client = AsyncGroq(api_key=self._settings.groq_api_key)
                logger.info("llm_provider_initialized", provider="groq")
            except Exception as e:
                logger.warning("llm_groq_init_failed", error=str(e))

    @property
    def is_available(self) -> bool:
        return self._gemini_client is not None or self._groq_client is not None

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        *,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[str] = None,
        model_tier: str = "standard",
    ) -> str:
        """Generate a completion from the best available provider.

        Args:
            system_prompt: System instructions for the LLM.
            user_prompt: The user-facing prompt / question.
            temperature: Override default temperature.
            max_tokens: Override default max_tokens.
            response_format: "json" to request JSON-mode output.
            model_tier: "standard" or "advanced" (uses larger model).

        Returns:
            The generated text response.

        Raises:
            LLMError: If all providers fail.
        """
        errors: list[str] = []

        # Try Gemini first
        if self._gemini_client is not None:
            try:
                return await asyncio.wait_for(
                    self._call_gemini(
                        system_prompt, user_prompt,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        response_format=response_format,
                        model_tier=model_tier,
                    ),
                    timeout=self._settings.llm_request_timeout_seconds,
                )
            except Exception as e:
                logger.warning("llm_gemini_failed", error=str(e))
                errors.append(f"Gemini: {e}")

        # Fallback to Groq
        if self._groq_client is not None:
            try:
                return await asyncio.wait_for(
                    self._call_groq(
                        system_prompt, user_prompt,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        response_format=response_format,
                    ),
                    timeout=self._settings.llm_request_timeout_seconds,
                )
            except Exception as e:
                logger.warning("llm_groq_failed", error=str(e))
                errors.append(f"Groq: {e}")

        raise LLMError(f"All LLM providers failed: {'; '.join(errors)}")

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        *,
        temperature: Optional[float] = None,
        model_tier: str = "standard",
    ) -> dict:
        """Generate and parse a JSON response.

        Returns:
            Parsed JSON as a dict.

        Raises:
            LLMError: If generation or parsing fails.
        """
        raw = await self.generate(
            system_prompt,
            user_prompt,
            temperature=temperature,
            response_format="json",
            model_tier=model_tier,
        )
        # Strip markdown code fences if present
        text = raw.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            # Remove first and last line (```json and ```)
            text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            logger.error("llm_json_parse_failed", raw_response=raw[:500], error=str(e))
            raise LLMError(f"Failed to parse LLM JSON output: {e}") from e

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    async def _call_gemini(
        self,
        system_prompt: str,
        user_prompt: str,
        *,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[str] = None,
        model_tier: str = "standard",
    ) -> str:
        """Call Google Gemini API with retry."""
        model_name = (
            self._settings.gemini_model_advanced
            if model_tier == "advanced"
            else self._settings.gemini_model
        )
        temp = temperature if temperature is not None else self._settings.gemini_temperature
        tokens = max_tokens if max_tokens is not None else self._settings.gemini_max_tokens

        model = self._gemini_client.GenerativeModel(
            model_name=model_name,
            system_instruction=system_prompt,
        )

        generation_config = {
            "temperature": temp,
            "max_output_tokens": tokens,
        }
        if response_format == "json":
            generation_config["response_mime_type"] = "application/json"

        response = await model.generate_content_async(
            user_prompt,
            generation_config=generation_config,
        )

        if not response.text:
            raise LLMError("Gemini returned empty response")

        logger.debug(
            "llm_gemini_response",
            model=model_name,
            prompt_len=len(user_prompt),
            response_len=len(response.text),
        )
        return response.text

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    async def _call_groq(
        self,
        system_prompt: str,
        user_prompt: str,
        *,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[str] = None,
    ) -> str:
        """Call Groq API with retry."""
        temp = temperature if temperature is not None else self._settings.groq_temperature
        tokens = max_tokens if max_tokens is not None else self._settings.groq_max_tokens

        kwargs: dict[str, Any] = {
            "model": self._settings.groq_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temp,
            "max_tokens": tokens,
        }
        if response_format == "json":
            kwargs["response_format"] = {"type": "json_object"}

        response = await self._groq_client.chat.completions.create(**kwargs)
        text = response.choices[0].message.content

        if not text:
            raise LLMError("Groq returned empty response")

        logger.debug(
            "llm_groq_response",
            model=self._settings.groq_model,
            prompt_len=len(user_prompt),
            response_len=len(text),
        )
        return text
