# VoiceShield Production Verification Checklist

Before announcing VoiceShield as "Live" on Logic Intelligence Technologies, complete the following verification steps.

## Phase 1: Environment & Secrets
- [ ] `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` configured in Vercel.
- [ ] `THROUGHPUTS_API_KEY` configured in Vercel.
- [ ] `FASTAPI_INFERENCE_URL` configured in Vercel.
- [ ] Vercel deployment completes successfully with `npm run build` passing all TS typechecks.
- [ ] Hardcoded NVIDIA keys verified ABSENT from the entire codebase.

## Phase 2: Database Migration
- [ ] Supabase migrations applied successfully to production.
- [ ] `vs_demo_requests` table exists with RLS enabled.
- [ ] Existing `contact_leads` table accepts `projectType = "VoiceShield Demo Request"`.

## Phase 3: FastAPI Backend Deployment
- [ ] Railway/Render project created for `apps/voiceshield-api/`.
- [ ] `aasist.pt` TorchScript model successfully loaded at application lifespan startup.
- [ ] CORS configured to strictly allow `https://www.logicintelligencetechnologies.in`.
- [ ] `/health` endpoint returns `200 OK`.
- [ ] THROUGHPUTS API connection verified via startup check.

## Phase 4: Integration Testing
- [ ] Load the VoiceShield product page (`/voice-shield`). Verify all UI components render and animations trigger correctly.
- [ ] Submit a test request via the "Request a Demo" CTA. Verify the lead appears in Supabase `vs_demo_requests`.
- [ ] Click "Launch Live Demo" on `/voice-shield/demo`. Verify WebSocket connection establishes without 403 CORS errors.
- [ ] Speak into the microphone and verify that `detection.result` messages flow back from the WebSocket at ~3Hz.

## Phase 5: Security Review
- [ ] Verify `STORE_RAW_AUDIO` is false in production.
- [ ] Verify `THROUGHPUTS_API_KEY` is not exposed in any browser network requests.
- [ ] Verify the rate limiter (Upstash Redis) drops requests correctly when spammed.
