# VoiceShield API Design

The VoiceShield API facilitates communication between the browser (AudioWorklet), the Next.js server, and the FastAPI backend.

## 1. Real-Time Audio Streaming (WebSocket)

**Endpoint:** `WSS {FASTAPI_INFERENCE_URL}/ws/audio`
**Authentication:** The first message must be a JSON handshake containing a valid Supabase JWT.

### Handshake Protocol

**Client → Server:**
```json
{
  "type": "session.start",
  "session_id": "uuid-v4",
  "token": "supabase-jwt",
  "sample_rate": 16000
}
```

**Server → Client (Ack):**
```json
{
  "type": "session.ready",
  "message": "Send PCM16 chunks"
}
```

### Audio Streaming

Once ready, the client streams binary messages containing Int16 (PCM) audio chunks. The backend expects 333ms chunks by default.

**Server → Client (Inference Result):**
For every chunk, the server returns an async JSON response:
```json
{
  "type": "detection.result",
  "chunk_index": 42,
  "timestamp": 1726732000.123,
  "risk_level": "medium",
  "spoof_probability": 0.45,
  "latency_ms": 12.4
}
```

## 2. Forensic Analysis (REST)

**Endpoint:** `POST {FASTAPI_INFERENCE_URL}/api/forensics/analyze`
**Authentication:** `Bearer {FASTAPI_INTERNAL_API_KEY}` (Server-to-Server only)

Accepts an audio file upload, processes it using AASIST, and queries THROUGHPUTS for a forensic XAI summary.

**Request:** `multipart/form-data` with an `audio` file field.
**Response:**
```json
{
  "file_name": "evidence_01.wav",
  "duration_seconds": 12.5,
  "overall_risk_level": "high",
  "peak_spoof_probability": 0.92,
  "splice_detected": true,
  "xai_summary": "Acoustic analysis indicates HIGH risk... Phase discontinuity (18.2%) suggests splice insertion at 0:04s.",
  "segments": [
    { "start_s": 0.0, "end_s": 0.5, "prob": 0.12 },
    { "start_s": 0.5, "end_s": 1.0, "prob": 0.88 }
  ]
}
```

## 3. Demo Request Leads (Next.js)

**Endpoint:** `POST /api/contact`
**Project Type:** `"VoiceShield Demo Request"`

VoiceShield reuses the standard LIT contact API to avoid duplicating email and database infrastructure.

**Request Payload:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "companyName": "Acme Bank",
  "phone": "+1 555 1234",
  "projectType": "VoiceShield Demo Request",
  "description": "Looking to protect our IVR.",
  "pageUrl": "/voice-shield"
}
```
