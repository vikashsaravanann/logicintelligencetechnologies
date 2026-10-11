# Logic Intelligence Technologies — AI Server
# Docker container for deploying the LoRA fine-tuned Qwen model on external hosting
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server source
COPY ai_server.py .

# Copy model weights directory (use git-lfs for HuggingFace Spaces)
COPY models/ ./models/

# Expose port 8000
EXPOSE 8000

# Lightweight health check (does not reload the model)
HEALTHCHECK --interval=30s --timeout=10s --start-period=180s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Create non-root user and set permissions
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/false appuser && \
    chown -R appuser:appgroup /app

USER 10001

# Start the FastAPI server
CMD ["uvicorn", "ai_server:app", "--host", "0.0.0.0", "--port", "8000"]
