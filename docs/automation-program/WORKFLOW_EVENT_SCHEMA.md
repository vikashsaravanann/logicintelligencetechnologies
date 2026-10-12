# Workflow Event & Webhook Data Contracts
**Program:** LIT Four-Site Unified Automation Command Center  
**Coordinator:** A00 Master Orchestrator | A01 Architecture Lead  

## 1. Standard Domain Event Contract (Outbox Specification)
Every event dispatched by a product backend into n8n MUST conform to this immutable JSON schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "LITDomainEvent",
  "type": "object",
  "required": [
    "specversion",
    "event_id",
    "product_code",
    "event_type",
    "source_system",
    "timestamp",
    "correlation_id",
    "data_version",
    "data",
    "signature_version"
  ],
  "properties": {
    "specversion": { "type": "string", "enum": ["1.0"] },
    "event_id": { "type": "string", "format": "uuid" },
    "product_code": {
      "type": "string",
      "enum": ["CORPORATE", "HEALTHCARE", "LOGIC_VOICE", "VOICESHIELD", "CROSS_SITE"]
    },
    "event_type": { "type": "string", "pattern": "^[a-z0-9_]+\\.[a-z0-9_.]+$" },
    "source_system": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "correlation_id": { "type": "string" },
    "idempotency_key": { "type": "string" },
    "data_version": { "type": "string", "pattern": "^v[0-9]+$" },
    "data": {
      "type": "object",
      "description": "Sanitized payload. Must NOT contain PHI, raw audio, passwords, or full credit card numbers."
    },
    "signature_version": { "type": "string", "enum": ["v1", "v2"] }
  },
  "additionalProperties": false
}
```

---

## 2. HTTP Ingress Headers for n8n Webhooks
Every webhook dispatch from a product backend to n8n MUST provide these HTTP headers:

| Header Name | Type | Description |
|---|---|---|
| `X-LIT-Signature` | String | HMAC SHA-256 hex digest of `timestamp + "." + raw_body` |
| `X-LIT-Timestamp` | String | ISO 8601 or UNIX epoch milliseconds; rejected if clock skew > 300 seconds |
| `X-LIT-Event-ID` | UUID | Unique event identifier; checked against deduplication cache |
| `X-LIT-Product` | String | Product enum (`CORPORATE`, `HEALTHCARE`, etc.) |
| `Content-Type` | String | Must be `application/json; charset=utf-8` |

---

## 3. Webhook Callback & Execution Receipt Contract
When an asynchronous n8n execution completes, sanitized execution receipts are persisted back into the corporate operational database:

```json
{
  "execution_id": "string",
  "workflow_key": "string",
  "remote_workflow_id": "string",
  "product_code": "string",
  "status": "succeeded | failed | partial | dead_letter",
  "duration_ms": 1420,
  "node_steps_completed": 8,
  "node_steps_failed": 0,
  "error_category": "NONE | AUTH_ERROR | TIMEOUT | RATE_LIMIT | PROVIDER_5XX | VALIDATION_ERROR",
  "error_message": "Sanitized message with no secrets or customer PII",
  "downstream_receipt_id": "string",
  "finished_at": "2026-10-12T08:30:00Z"
}
```
