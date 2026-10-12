# Project, Site, and Provider Infrastructure Mapping
**Program:** LIT Four-Site Unified Automation Command Center  
**Coordinator:** A00 Master Orchestration | A01 Architecture Lead  

## 1. Domain and Environment Matrix

| Site Key | Product Name | Production Canonical URL | Source Repo | Deployment Host | CDN / Edge Layer | Database Host | n8n Webhook Prefix |
|---|---|---|---|---|---|---|---|
| `CORPORATE` | Logic Intelligence Technologies | `https://www.logicintelligencetechnologies.in` | `logicintelligencetechnologies` | Vercel | Vercel Edge Network | Supabase (Production) | `/webhook/corp/` |
| `HEALTHCARE` | LIT Smart Hospital Platform | `https://healthcare.logicintelligencetechnologies.in` | `lit-smart-hospital-platform` | Vercel (Landing) / Render (API) | Vercel / Cloudflare | Supabase (Healthcare Dedicated) | `/webhook/hc/` |
| `LOGIC_VOICE` | Logic Voice Platform | `https://logicvoice.logicintelligencetechnologies.in` | `logic-voice` | Vercel (Web) / Render (Server) | Vercel / Origin Edge | Supabase (Auth/Config) / Local Redis | `/webhook/lv/` |
| `VOICESHIELD` | VoiceShield AI Protection | `https://voiceshield.logicintelligencetechnologies.in` | `voice-shield` | Vercel | Vercel Edge Network | Supabase (VoiceShield Dedicated) | `/webhook/vs/` |

---

## 2. Google Search Console Verified Properties

| Site Key | Canonical URL-Prefix Property | Alternative Domain Property | Expected Verification Method | API Quotas (Per Minute / Per Day) | Scope Required |
|---|---|---|---|---|---|
| `CORPORATE` | `https://www.logicintelligencetechnologies.in/` | `sc-domain:logicintelligencetechnologies.in` | DNS TXT / Google HTML Tag | 600 QPM / 2,000 QPD (Inspection) | `webmasters.readonly` + `webmasters` |
| `HEALTHCARE` | `https://healthcare.logicintelligencetechnologies.in/` | Inherited from domain | DNS TXT / Delegated Owner | 600 QPM / 2,000 QPD (Inspection) | `webmasters.readonly` + `webmasters` |
| `LOGIC_VOICE` | `https://logicvoice.logicintelligencetechnologies.in/` | Inherited from domain | DNS TXT / Delegated Owner | 600 QPM / 2,000 QPD (Inspection) | `webmasters.readonly` + `webmasters` |
| `VOICESHIELD` | `https://voiceshield.logicintelligencetechnologies.in/` | Inherited from domain | DNS TXT / Delegated Owner | 600 QPM / 2,000 QPD (Inspection) | `webmasters.readonly` + `webmasters` |

---

## 3. CDN & Edge Cache Policies

| Site Key | Static Asset Cache Policy | SSR / Dynamic Route Policy | Private / Workspace Route Policy | Invalidation Mechanism | Invalidation Risk Level |
|---|---|---|---|---|---|
| `CORPORATE` | `public, max-age=31536000, immutable` | `s-maxage=3600, stale-while-revalidate=86400` | `private, no-cache, no-store, must-revalidate` | Vercel Deploy Hook / Selective Tag Purge | R3 (Approval Required) |
| `HEALTHCARE` | `public, max-age=31536000, immutable` | `s-maxage=1800, stale-while-revalidate=43200` | `private, no-cache, no-store, must-revalidate` | Vercel Deploy / FastAPI Cache Headers | R3 (Approval Required) |
| `LOGIC_VOICE` | `public, max-age=31536000, immutable` | `s-maxage=1800, stale-while-revalidate=43200` | `private, no-cache, no-store, must-revalidate` | Vercel Deploy / Static Asset Hash | R3 (Approval Required) |
| `VOICESHIELD` | `public, max-age=31536000, immutable` | `s-maxage=1800, stale-while-revalidate=43200` | `private, no-cache, no-store, must-revalidate` | Vercel Deploy / Static Asset Hash | R3 (Approval Required) |

---

## 4. Central n8n Instance Mapping
- **Instance Host:** `https://automation.logicintelligencetechnologies.in/`
- **Isolation Strategy:** Project tags (`CORPORATE`, `HEALTHCARE`, `LOGIC_VOICE`, `VOICESHIELD`, `CROSS_SITE`)
- **Credential Storage:** Server-side KMS / Vault; no raw secrets stored in n8n nodes or Git.
- **Webhook Protocol:** Dedicated paths with per-product HMAC signing keys.
