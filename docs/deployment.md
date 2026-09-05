# Deployment and Release Guide

## Production Architecture

MediKiosk AI is a hardened FastAPI backend designed to serve as the intelligence engine for patient intake kiosks in hospital OPDs and AYUSH facilities.

### Technology Stack
- **Framework**: FastAPI (Python 3.12+) with Uvicorn ASGI server
- **Primary LLM**: Google Gemini 2.0 Flash / 2.5 Pro (via Google AI Studio)
- **Fallback LLM**: Groq Qwen 2.5 32B (`qwen-2.5-32b`)
- **Speech-to-Text (ASR)**: Groq Whisper Large v3 Turbo (`whisper-large-v3-turbo`)
- **Text-to-Speech (TTS)**: Microsoft Edge Neural TTS (`edge-tts`)
- **Document OCR**: Gemini 2.0 Flash Vision with Tesseract local fallback
- **Persistence**: Async SQLAlchemy (PostgreSQL in production, SQLite in development)
- **Session Cache & Rate Limiting**: Redis 7+ with in-memory fallback

---

## Production Deployment with Docker Compose

```powershell
docker-compose up --build -d
```

This launches:
1. `app` on port `8000` (FastAPI with 4 Uvicorn workers)
2. `postgres` (PostgreSQL 16 on port 5432 with health checks)
3. `redis` (Redis 7 on port 6379 with health checks)

---

## Required Production Environment Variables

Ensure the following are set in your production `.env` or secret store:
- `SECRET_KEY`: High-entropy 32+ character random string
- `GEMINI_API_KEY`: Production Gemini API key
- `GROQ_API_KEY`: Production Groq API key
- `DATABASE_URL`: `postgresql+asyncpg://user:pass@host:5432/medikiosk`
- `REDIS_URL`: `redis://host:6379/0`
- `ALLOWED_ORIGINS`: JSON list of allowed HTTPS kiosk origins (e.g., `["https://kiosk.hospital.org"]`)

---

## CI / Automated Testing

Run the automated test suite before every release:
```powershell
pytest tests/ -v
```

All 48 test suites must pass before staging or production rollout.
