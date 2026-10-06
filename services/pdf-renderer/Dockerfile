# LIT PDF renderer — ReportLab generator wrapped in FastAPI.
# Pure Python (no Chromium), so it runs comfortably on a small instance.
FROM python:3.12-slim

# Fonts/Pillow need no system libs beyond what slim provides for ReportLab's
# bundled TTFs; keep the image minimal.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# The generator (build_templates.py, docsys.py, helpers.py, fonts, logos) and
# the service wrapper. masters/ are not needed at runtime (fidelity baseline).
COPY generator ./generator
COPY app.py ./

# Render sets $PORT; default to 8080 for local runs.
ENV PORT=8080
EXPOSE 8080

# Single worker: rendering is CPU-bound and the free/small tiers are tiny.
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1"]
