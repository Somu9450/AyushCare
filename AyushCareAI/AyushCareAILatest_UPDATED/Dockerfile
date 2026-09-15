FROM python:3.12-slim

WORKDIR /app

# Install system dependencies & ca-certificates for Bhashini HTTPS + Tesseract OCR fallback for Indic languages
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    ffmpeg \
    tesseract-ocr \
    tesseract-ocr-hin \
    tesseract-ocr-ben \
    tesseract-ocr-tam \
    tesseract-ocr-tel \
    tesseract-ocr-mar \
    tesseract-ocr-kan \
    tesseract-ocr-mal \
    tesseract-ocr-guj \
    tesseract-ocr-san \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Create upload directory
RUN mkdir -p /app/uploads

# Non-root user for security
RUN adduser --disabled-password --gecos "" appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; r = httpx.get('http://localhost:8000/api/v1/health'); exit(0 if r.status_code == 200 else 1)"

# Run with uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]
