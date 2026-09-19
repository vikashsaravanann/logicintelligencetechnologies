# VoiceShield Manual Setup Guide

If you need to run the VoiceShield backend locally for development or testing, follow these steps.

## Prerequisites
- Python 3.10+
- Node.js 20+
- `ffmpeg` installed on your system (required by `librosa`)

## 1. Setup the FastAPI Backend

1. Navigate to the backend directory:
   ```bash
   cd apps/voiceshield-api
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

3. Download the AASIST Model:
   You must obtain the `aasist.pt` model file (contact the ML team). Place it in the `models/` directory:
   ```bash
   mkdir -p models
   # Move aasist.pt into models/
   ```

4. Configure Environment Variables:
   Copy the example config and fill in the required values:
   ```bash
   cp .env.example .env
   # Edit .env to add your Supabase keys and THROUGHPUTS API key
   ```

5. Run the Server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend is now running at `http://localhost:8000`.

## 2. Setup the Next.js Frontend

1. In the root of the LIT repository, copy the environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Add the VoiceShield specific variables to `.env.local`:
   ```env
   FASTAPI_INFERENCE_URL=ws://localhost:8000
   UPSTASH_REDIS_REST_URL=your_upstash_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_token
   THROUGHPUTS_API_KEY=your_throughputs_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Navigate to `http://localhost:3000/voice-shield/demo` to test the integration locally.
