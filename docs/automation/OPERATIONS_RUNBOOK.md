# Logic Intelligence Technologies — Operations & Site Reliability Runbook

**Production Infrastructure & Incident Response Manual**  
**Document**: `docs/automation/OPERATIONS_RUNBOOK.md`  
**Author**: Logic Intelligence Technologies SRE & DevOps Team  
**Lead System Engineer**: Vikash Saravanan  
**Status**: ACTIVE / PRODUCTION GOVERNANCE  

---

## 1. System Overview & Architecture Topology

Logic Intelligence Technologies utilizes an isolated, containerized orchestration topology:

```
┌────────────────────────────────┐         ┌────────────────────────────────┐
│   Vercel Edge / Corporate Web  │         │      Public Ingress Client     │
│ logicintelligencetechnologies  │         │   (Webhooks, Partners, APIs)   │
└───────────────┬────────────────┘         └───────────────┬────────────────┘
                │ (HMAC-SHA256 Signed HTTP)                │ (HTTPS / TLS 1.3)
                ▼                                          ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                       Caddy Reverse Proxy (Host OS)                       │
│             Domain: https://automation.logicintelligencetechnologies.in   │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Ingress Port 5678 (HTTP / Loopback)
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    Docker Container: lit_n8n (v2.1.4)                     │
│  - Image: docker.n8n.io/n8nio/n8n:latest                                 │
│  - Storage Volume: n8n_data (persistent SQLite / workflow state)          │
│  - Health Endpoint: /healthz (Status 200)                                 │
└──────────────────┬─────────────────────────────────────┬──────────────────┘
                   │                                     │
                   ▼ (HMAC Signed Callbacks)             ▼ (Zero-Secret Webhook)
┌─────────────────────────────────────┐   ┌─────────────────────────────────┐
│   Supabase PostgreSQL Engine        │   │ Slack / Discord / WhatsApp Alerts│
│ (lead_engine, platform_settings)    │   │      (#ops-alerts Channel)      │
└─────────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 2. Docker Container Operations (`lit_n8n`)

### 2.1 Service Verification & Health Check
Verify the status of the orchestration engine:
```bash
# Check running status
docker ps --filter "name=lit_n8n"

# Verify HTTP health endpoint directly
curl -I http://127.0.0.1:5678/healthz

# Verify public ingress through Caddy TLS
curl -I https://automation.logicintelligencetechnologies.in/healthz
```

### 2.2 Lifecycle Management Commands
```bash
# Graceful restart of n8n instance
docker restart lit_n8n

# View live log streams (tail 100 lines with timestamps)
docker logs -f --tail=100 lit_n8n

# Stop container for emergency maintenance
docker stop lit_n8n

# Start container after maintenance
docker start lit_n8n
```

### 2.3 Volume Persistence & Backups
All n8n workflow states, execution histories, and credential stores are persisted in the Docker volume `n8n_data`.
To create an offline backup:
```bash
# Stop n8n to ensure SQLite flush
docker stop lit_n8n

# Export volume archive
docker run --rm -v n8n_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/n8n_data_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Restart container
docker start lit_n8n
```

---

## 3. Reverse Proxy & SSL Termination (Caddy)

Caddy manages automated Let's Encrypt / ZeroSSL TLS certificates and terminates SSL for `automation.logicintelligencetechnologies.in`.

### 3.1 Caddy Configuration Snippet
```caddy
automation.logicintelligencetechnologies.in {
    reverse_proxy 127.0.0.1:5678 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }

    # Restrict internal diagnostics
    @denied path /metrics
    respond @denied 403
}
```

### 3.2 SSL Verification
```bash
# Check certificate validity and expiration
openssl s_client -connect automation.logicintelligencetechnologies.in:443 -servername automation.logicintelligencetechnologies.in < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

---

## 4. Dead-Letter Queue & Failed Event Recovery

### 4.1 Automated Retry Architecture
1. Inbound events dispatched to n8n are recorded in `automation_events` with status `DISPATCHED`.
2. If n8n returns an error (`5xx` status, timeout, or socket disconnect), status changes to `FAILED`.
3. The cron route `/api/cron/automation-retry` executes every 5 minutes:
   - Evaluates failed events where `retry_count < 5`.
   - Calculates exponential backoff: `delay = initial_delay * 2^retry_count`.
   - Re-dispatches with original `x-lit-idempotency-key` and `x-lit-correlation-id`.
4. If `retry_count >= 5`, status transitions to `DEAD_LETTER` and fires an `OPS-04` alert.

### 4.2 Manual Dead-Letter Re-Drive Procedure
To re-drive dead-lettered events:
1. Log in to the LIT Admin Console at `https://logicintelligencetechnologies.in/admin/automations`.
2. Locate the **Dead-Letter Queue (DLQ)** table.
3. Review payload details and failure stack traces.
4. Click **Re-Drive Event**; the server generates a fresh timestamp header (`x-lit-timestamp`) while preserving the business `idempotency_key` and dispatches immediately.

---

## 5. Security Secret Rotation Procedure

Secrets are stored dynamically in the Supabase PostgreSQL `platform_settings` table rather than hardcoded in source repositories:

### 5.1 Rotating `N8N_WEBHOOK_SECRET`
1. Generate a high-entropy 256-bit hexadecimal key:
   ```bash
   openssl rand -hex 32
   ```
2. Update the secret in `platform_settings`:
   ```sql
   UPDATE platform_settings 
   SET setting_value = '<new_hex_secret>', updated_at = NOW() 
   WHERE setting_key = 'n8n_webhook_secret';
   ```
3. Update the matching environment variable inside the n8n Docker container environment or execution settings.
4. Verify by running the webhook signing unit tests:
   ```bash
   node --import tsx --test tests/automation/n8n-workflows.test.ts
   ```

### 5.2 Rotating `N8N_API_KEY`
1. Access the n8n admin UI at `https://automation.logicintelligencetechnologies.in`.
2. Navigate to **Settings** -> **API** -> **Create API Key**.
3. Copy key and update `platform_settings`:
   ```sql
   UPDATE platform_settings 
   SET setting_value = '<new_api_key>', updated_at = NOW() 
   WHERE setting_key = 'n8n_api_key';
   ```
4. Test connectivity from the corporate dashboard (`/admin/automations`).

---

## 6. Incident Response & Alert Escalation Runbooks

### Incident Type A: Deployment Failure (`OPS-01`)
* **Trigger:** Vercel build failure, GitHub Actions CI failure on `main`.
* **Severity:** High (Sev-2).
* **Automated Actions:**
  - `OPS-01` parses failure payload (commit hash, author, build error snippet).
  - Posts alert card to Slack `#deployments` channel.
  - Sends priority WhatsApp alert to the author and Lead System Engineer.
* **Engineer Action:**
  1. Inspect failed GitHub Action run or Vercel log.
  2. If typecheck failed, run `npm run typecheck` locally to reproduce.
  3. Revert offending commit or push immediate hotfix.

### Incident Type B: Automation Reliability Degradation (`OPS-04`)
* **Trigger:** Dead-letter event count > 5 within 15 minutes, or n8n `/healthz` returning non-200.
* **Severity:** Critical (Sev-1).
* **Automated Actions:**
  - Fires high-priority webhook alert to SRE team.
* **Engineer Action:**
  1. SSH to host server; run `docker ps` to verify `lit_n8n` container state.
  2. Inspect container logs: `docker logs --tail=100 lit_n8n`.
  3. Check memory and CPU usage: `docker stats --no-stream lit_n8n`.
  4. If container crashed due to memory exhaustion, restart: `docker restart lit_n8n`.
  5. Check dead-letter queue in `/admin/automations` and re-drive queued events.

---

## 7. Emergency Circuit Breaker (Kill Switch)

If an external service is down or unexpected looping occurs, terminate all automated dispatching immediately:
```sql
-- Disable automated dispatch globally across corporate platform
UPDATE platform_settings 
SET setting_value = 'false', updated_at = NOW() 
WHERE setting_key = 'automations_enabled';
```
When set to `false`, `src/lib/automation/dispatch.ts` will safely log inbound events to the database but will bypass HTTP dispatch to n8n, preventing downstream cascading failures.
