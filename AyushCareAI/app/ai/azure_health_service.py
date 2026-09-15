"""Azure AI Language - Text Analytics for Health provider.

This is an assistive medical NLP signal. It does not diagnose or replace
clinician review. Credentials remain server-side.
"""

from __future__ import annotations

from typing import Any

import httpx
import structlog

from app.config import Settings

logger = structlog.get_logger(__name__)


class AzureHealthNLPError(Exception):
    """Raised when Azure Text Analytics for Health fails."""


class AzureHealthNLP:
    """Medical entity/assertion extraction using Azure AI Language."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._endpoint = (settings.azure_language_endpoint or "").rstrip("/")
        self._key = settings.azure_language_key or ""
        self._api_version = settings.azure_language_api_version

    @property
    def is_configured(self) -> bool:
        return bool(self._endpoint and self._key)

    async def analyze(self, text: str, language: str = "en") -> dict[str, Any]:
        if not text.strip():
            return {"entities": [], "relations": [], "provider": "azure"}

        if not self.is_configured:
            raise AzureHealthNLPError(
                "Azure Text Analytics for Health is selected but endpoint/key are not configured."
            )

        # Text Analytics for Health accepts a Healthcare analysis task.
        # Azure's hosted Health model has a more limited language set than
        # Bhashini; when the OCR language is unsupported, callers may choose
        # to translate to English before invoking this provider.
        normalized_language = self._normalize_language(language)
        url = f"{self._endpoint}/language/analyze-text/jobs?api-version={self._api_version}"
        payload = {
            "analysisInput": {
                "documents": [{"id": "document-1", "language": normalized_language, "text": text}]
            },
            "tasks": [{
                "taskId": "health-1",
                "kind": "Healthcare",
                "parameters": {"fhirVersion": "4.0.1"}
            }]
        }
        headers = {
            "Ocp-Apim-Subscription-Key": self._key,
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=10.0)) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code >= 400:
                raise AzureHealthNLPError(
                    f"Azure Health NLP request failed ({response.status_code}): {response.text[:500]}"
                )
            operation_url = response.headers.get("operation-location") or response.headers.get("Operation-Location")
            if not operation_url:
                # Some service revisions may return the result directly.
                data = response.json()
            else:
                data = await self._poll(client, operation_url, headers)

        return self._normalize(data)

    async def _poll(self, client: httpx.AsyncClient, operation_url: str, headers: dict[str, str]) -> dict[str, Any]:
        for _ in range(60):
            response = await client.get(operation_url, headers=headers)
            if response.status_code >= 400:
                raise AzureHealthNLPError(f"Azure Health NLP polling failed ({response.status_code}): {response.text[:500]}")
            payload = response.json()
            status = str(payload.get("status", "")).lower()
            if status == "succeeded":
                return payload
            if status in {"failed", "cancelled"}:
                raise AzureHealthNLPError(f"Azure Health NLP operation {status}: {payload.get('errors', payload)}")
            import asyncio
            await asyncio.sleep(1)
        raise AzureHealthNLPError("Azure Health NLP operation timed out.")

    @staticmethod
    def _normalize_language(language: str) -> str:
        code = (language or "en").split("-")[0].lower()
        # Hosted Text Analytics for Health currently supports English and a
        # small set of other languages; unsupported Indic languages should be
        # translated upstream rather than silently mislabeled.
        return code

    @staticmethod
    def _normalize(data: dict[str, Any]) -> dict[str, Any]:
        results = data.get("results", {})
        if not results and isinstance(data.get("tasks"), dict):
            for item in data.get("tasks", {}).get("items", []):
                if item.get("kind") == "HealthcareLROResults":
                    results = item.get("results", item)
                    break
        docs = results.get("documents", [])
        if not docs:
            return {"entities": [], "relations": [], "provider": "azure"}

        doc = docs[0]
        entities: list[dict[str, Any]] = []
        for entity in doc.get("entities", []):
            entities.append({
                "text": entity.get("text", ""),
                "category": entity.get("category", ""),
                "subcategory": entity.get("subcategory"),
                "confidence": entity.get("confidenceScore", 0.0),
                "offset": entity.get("offset"),
                "length": entity.get("length"),
                "assertion": entity.get("assertion"),
                "links": entity.get("links", []),
                "data_sources": entity.get("dataSources", []),
            })

        return {
            "entities": entities,
            "relations": doc.get("relations", []),
            "provider": "azure",
        }
