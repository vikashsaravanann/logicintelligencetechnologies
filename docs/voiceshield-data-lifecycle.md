# VoiceShield Data Lifecycle & Security

## 1. Zero Audio Retention by Default

VoiceShield is designed for extreme privacy. By default, raw audio (PCM bytes) passing through the system is **never written to disk**.

- **Config Toggle:** `STORE_RAW_AUDIO=false` (Default).
- **Processing:** Audio is buffered in memory (RAM), chunked, transformed via `librosa`, fed to the PyTorch model, and immediately deallocated.
- **Opt-in Storage:** Only if `STORE_RAW_AUDIO=true` is explicitly set (e.g., for enterprise training feedback loops) will audio be stored in the Supabase Storage bucket (`challenge-audio`).

## 2. Telemetry and Metadata

While audio is discarded, **detection metadata** is retained for reporting and auditing.

### `vs_sessions`
Records the start and end of a detection session, the device fingerprint, and the final risk classification.
- **Retention:** Follows DPDP (Digital Personal Data Protection Act) guidelines. Default 90 days unless subject to a forensic hold.

### `vs_detection_events`
Records the numerical risk score for each 333ms chunk within a session.
- **Contents:** `chunk_index`, `spoof_probability`, `risk_level`, and aggregated JSON markers (e.g. `high_frequency_anomaly`).
- **Anonymised:** Contains no PII and no audio data.

## 3. Data Residency and Isolation

VoiceShield tables live within the LIT Supabase PostgreSQL database.

- **Namespacing:** All tables are prefixed with `vs_` (e.g. `vs_demo_requests`).
- **Row-Level Security (RLS):** Enabled on all tables.
  - End users can only SELECT rows where `user_id = auth.uid()`.
  - Service roles bypass RLS for system operations.
- **Admin Access:** LIT administrators view VoiceShield telemetry through the unified admin portal, restricted by the `profiles.role = 'admin'` check.

## 4. DPDP Act Compliance

A scheduled background worker executes a data retention policy (`0012_dpdp_retention.sql`) which automatically purges `vs_sessions` and `vs_detection_events` older than the configured threshold (e.g., 90 days) unless marked for legal retention.
