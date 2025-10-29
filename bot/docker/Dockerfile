# LemoTick Trading Bot Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY bot/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY bot/ .

# Create necessary directories
RUN mkdir -p /app/data /app/logs /app/config

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash lemotick && \
    chown -R lemotick:lemotick /app
USER lemotick

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/health')" || exit 1

# Default command
CMD ["python", "-m", "src"]

# Labels for metadata
LABEL maintainer="LemoTech Innovations"
LABEL version="1.0.0"
LABEL description="LemoTick - Deriv API Trading Bot"

