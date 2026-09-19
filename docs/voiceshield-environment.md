# VoiceShield Environment Configuration

VoiceShield runs across two deployable units: the **LIT Next.js Frontend** (Vercel) and the **VoiceShield FastAPI Backend** (Railway / Render / VPS).

## 1. LIT Frontend (Next.js)

Add these to your Vercel Environment Variables:

| Variable | Requirement | Description |
|----------|-------------|-------------|
| `FASTAPI_INFERENCE_URL` | **Required** | URL of the deployed FastAPI backend (e.g. `https://voiceshield-api.production.up.railway.app`). Used by the demo gate and the audio streamer. |
| `UPSTASH_REDIS_REST_URL` | **Required** | Upstash Redis REST URL. Used for rate limiting and AI exact-request caching. |
| `UPSTASH_REDIS_REST_TOKEN` | **Required** | Upstash Redis REST token. |
| `THROUGHPUTS_API_KEY` | **Required** | THROUGHPUTS platform API key for AI features. Server-side only. |
| `THROUGHPUTS_BASE_URL` | Optional | `https://api.throughputs.in/v1` |
| `THROUGHPUTS_INFERENCE_MODEL` | Optional | `throughputs-core-latest` |

## 2. VoiceShield FastAPI Backend

Configure these on your backend hosting provider (e.g. Railway):

### Application & Deployment
| Variable | Requirement | Description |
|----------|-------------|-------------|
| `APP_ENV` | **Required** | `production` |
| `PORT` | Optional | Defaults to `8000` |
| `NEXT_PUBLIC_SITE_URL` | **Required** | e.g. `https://www.logicintelligencetechnologies.in`. Used for strict CORS origin matching. |
| `FASTAPI_INTERNAL_API_KEY` | **Required** | Shared secret between Next.js and FastAPI for server-to-server calls. |

### Supabase / Persistence
Must point to the **same** Supabase project as LIT.
| Variable | Requirement | Description |
|----------|-------------|-------------|
| `SUPABASE_URL` | **Required** | Your LIT Supabase URL. |
| `SUPABASE_ANON_KEY` | **Required** | Your LIT Anon Key. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Required** | Service role key. Used for database operations bypassing RLS. |
| `SUPABASE_JWT_SECRET` | **Required** | Used to validate JWT tokens sent via WebSocket headers. |

### AI / Intelligence (THROUGHPUTS)
| Variable | Requirement | Description |
|----------|-------------|-------------|
| `THROUGHPUTS_API_KEY` | **Required** | Replaces the hardcoded NVIDIA key. Used for forensic summaries. |
| `THROUGHPUTS_BASE_URL` | Optional | `https://api.throughputs.in/v1` |
| `THROUGHPUTS_INFERENCE_MODEL` | Optional | e.g. `throughputs-core-latest` |

### Machine Learning
| Variable | Requirement | Description |
|----------|-------------|-------------|
| `MODEL_PATH` | **Required** | Path to the `.pt` TorchScript model (e.g., `./models/aasist.pt`). You must ensure this file exists in the deployment volume. |
| `DEVICE` | Optional | `cpu` or `cuda`. Defaults to `cpu`. |
| `STORE_RAW_AUDIO` | Optional | `false` (default) ensures compliance and zero-retention. |

### Optional Integrations
| Variable | Requirement | Description |
|----------|-------------|-------------|
| `TWILIO_ACCOUNT_SID` | Optional | If configured, VoiceShield sends WhatsApp/SMS alerts on high risk. |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio auth token. |
| `TWILIO_WHATSAPP_FROM` | Optional | e.g. `whatsapp:+14155238886` |
| `ALERT_PHONE_NUMBER` | Optional | The destination number for SOC alerts. |

---
**Security Warning:** Do NOT commit the `aasist.pt` model to Git. It is too large and should be fetched securely during the deployment CI/CD pipeline or mounted as a volume.
