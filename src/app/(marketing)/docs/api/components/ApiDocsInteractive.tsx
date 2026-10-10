"use client";

import React, { useState } from "react";
import {
  Terminal,
  Key,
  Webhook,
  FileJson,
  Check,
  Copy,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface EndpointSpec {
  id: string;
  name: string;
  method: "POST" | "GET" | "PUT" | "DELETE";
  path: string;
  tag: string;
  description: string;
  latency: string;
  statusResponse: string;
  icon: React.ElementType;
  curl: string;
  typescript: string;
  python: string;
  response: string;
  headers: { name: string; required: boolean; description: string }[];
  parameters: { name: string; type: string; required: boolean; description: string }[];
}

const ENDPOINTS: EndpointSpec[] = [
  {
    id: "voice-analyze",
    name: "Analyze Audio Stream",
    method: "POST",
    path: "/v1/voice/analyze",
    tag: "Voice Intelligence",
    description:
      "Uploads an audio buffer for real-time DNN acoustic inference, emotion classification, and synthetic spoof detection. Audio is processed ephemerally in volatile memory with zero disk storage.",
    latency: "< 42ms p95",
    statusResponse: "200 OK",
    icon: Terminal,
    curl: `curl -X POST https://api.logicintelligencetechnologies.in/v1/voice/analyze \\
  -H "Authorization: Bearer lit_live_YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "audio=@/path/to/stream.wav" \\
  -F "webhook_url=https://your-server.com/hooks/lit-ai"`,
    typescript: `import { LitClient } from "@lit-ai/sdk";
import fs from "node:fs";

const client = new LitClient({ 
  apiKey: process.env.LIT_API_KEY 
});

const analysis = await client.voice.analyze({
  audioStream: fs.createReadStream("./audio-sample.wav"),
  encoding: "LINEAR16",
  sampleRateHertz: 16000,
  webhookUrl: "https://your-server.com/hooks/lit-ai",
});

console.log(\`Verdict: \${analysis.verdict}, Latency: \${analysis.latencyMs}ms\`);`,
    python: `from lit_ai import LitClient

client = LitClient(api_key="lit_live_YOUR_API_KEY")

with open("audio-sample.wav", "rb") as audio_file:
    response = client.voice.analyze(
        audio=audio_file,
        format="wav",
        webhook_url="https://your-server.com/hooks/lit-ai"
    )

print(f"Status: {response.status}, Verdict: {response.verdict}")`,
    response: `{
  "id": "req_8f73b2a",
  "status": "completed",
  "verdict": "VERIFIED",
  "confidence": 0.984,
  "latency_ms": 42,
  "acoustic_features": {
    "snr_db": 28.4,
    "jitter_percent": 0.012,
    "synthetic_score": 0.002
  }
}`,
    headers: [
      { name: "Authorization", required: true, description: "Bearer token format: 'Bearer lit_live_...'" },
      { name: "Content-Type", required: true, description: "multipart/form-data or application/octet-stream" },
      { name: "X-Idempotency-Key", required: false, description: "Unique UUIDv4 to safely retry requests without re-processing" },
    ],
    parameters: [
      { name: "audio", type: "File / Buffer", required: true, description: "Raw audio buffer (PCM, WAV, or MP3). Maximum duration 60s." },
      { name: "webhook_url", type: "string (HTTPS)", required: false, description: "Optional TLS endpoint to receive asynchronous telemetry" },
      { name: "encoding", type: "string", required: false, description: "Audio sample encoding (defaults to auto-detect, or LINEAR16)" },
    ],
  },
  {
    id: "agents-chat",
    name: "Autonomous Agentic Chat",
    method: "POST",
    path: "/v1/agents/chat",
    tag: "Agentic Systems",
    description:
      "Enterprise agentic dialogue endpoint with deterministic tool calling, private RAG knowledge retrieval, and sub-200ms time-to-first-token streaming.",
    latency: "< 180ms TTFT",
    statusResponse: "200 OK",
    icon: Layers,
    curl: `curl -X POST https://api.logicintelligencetechnologies.in/v1/agents/chat \\
  -H "Authorization: Bearer lit_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "corp_support_v2",
    "session_id": "sess_9918bc",
    "stream": false,
    "messages": [
      { "role": "user", "content": "Fetch invoice INV-2026-049 status" }
    ]
  }'`,
    typescript: `import { LitClient } from "@lit-ai/sdk";

const client = new LitClient({ 
  apiKey: process.env.LIT_API_KEY 
});

const response = await client.agents.chat({
  agentId: "corp_support_v2",
  sessionId: "sess_9918bc",
  stream: false,
  messages: [
    { role: "user", content: "Fetch invoice INV-2026-049 status" }
  ],
});

console.log(response.message.content);`,
    python: `from lit_ai import LitClient

client = LitClient(api_key="lit_live_YOUR_API_KEY")

response = client.agents.chat(
    agent_id="corp_support_v2",
    session_id="sess_9918bc",
    messages=[{"role": "user", "content": "Fetch invoice INV-2026-049 status"}]
)

print(response.message["content"])`,
    response: `{
  "id": "chatcmpl_55ad9",
  "agent_id": "corp_support_v2",
  "message": {
    "role": "assistant",
    "content": "Invoice INV-2026-049 has been approved and cleared for payment on Oct 12, 2026."
  },
  "tool_invocations": [
    {
      "tool": "erp_query_invoice",
      "latency_ms": 24,
      "status": "success"
    }
  ],
  "time_to_first_token_ms": 142
}`,
    headers: [
      { name: "Authorization", required: true, description: "Bearer token issued through LIT Enterprise Console" },
      { name: "Content-Type", required: true, description: "application/json" },
      { name: "Accept", required: false, description: "text/event-stream for SSE, or application/json for batch" },
    ],
    parameters: [
      { name: "agent_id", type: "string", required: true, description: "Configured enterprise agent deployment identifier" },
      { name: "session_id", type: "string", required: true, description: "Thread/session context ID for conversation memory" },
      { name: "messages", type: "Message[]", required: true, description: "Array of message objects with 'role' and 'content'" },
      { name: "stream", type: "boolean", required: false, description: "Stream tokens via Server-Sent Events (default: false)" },
    ],
  },
  {
    id: "webhooks-subscribe",
    name: "Asynchronous Webhooks",
    method: "POST",
    path: "/v1/webhooks/subscribe",
    tag: "Event Bus",
    description:
      "Register a TLS webhook URL to receive asynchronous status updates, model inference results, and security alerts signed with HMAC-SHA256 signatures.",
    latency: "< 25ms",
    statusResponse: "201 Created",
    icon: Webhook,
    curl: `curl -X POST https://api.logicintelligencetechnologies.in/v1/webhooks/subscribe \\
  -H "Authorization: Bearer lit_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-domain.com/api/lit-events",
    "events": ["voice.analyzed", "agent.completed", "security.alert"],
    "secret": "whsec_YOUR_HMAC_SIGNING_SECRET"
  }'`,
    typescript: `import { LitClient } from "@lit-ai/sdk";

const client = new LitClient({ 
  apiKey: process.env.LIT_API_KEY 
});

const webhook = await client.webhooks.create({
  url: "https://your-domain.com/api/lit-events",
  events: ["voice.analyzed", "agent.completed", "security.alert"],
  secret: "whsec_YOUR_HMAC_SIGNING_SECRET",
});

console.log(\`Webhook registered with ID: \${webhook.id}\`);`,
    python: `from lit_ai import LitClient

client = LitClient(api_key="lit_live_YOUR_API_KEY")

webhook = client.webhooks.create(
    url="https://your-domain.com/api/lit-events",
    events=["voice.analyzed", "agent.completed", "security.alert"],
    secret="whsec_YOUR_HMAC_SIGNING_SECRET"
)

print(f"Registered webhook: {webhook.id}")`,
    response: `{
  "id": "whk_77180bc",
  "url": "https://your-domain.com/api/lit-events",
  "events": ["voice.analyzed", "agent.completed", "security.alert"],
  "status": "active",
  "created_at": "2026-10-11T00:45:00Z",
  "hmac_algorithm": "sha256"
}`,
    headers: [
      { name: "Authorization", required: true, description: "Bearer token with admin or write permissions" },
      { name: "Content-Type", required: true, description: "application/json" },
    ],
    parameters: [
      { name: "url", type: "string (HTTPS)", required: true, description: "Publicly resolvable HTTPS endpoint for delivery" },
      { name: "events", type: "string[]", required: true, description: "Array of subscribed topic events" },
      { name: "secret", type: "string", required: true, description: "Custom HMAC secret for signature verification" },
    ],
  },
  {
    id: "cluster-status",
    name: "Cluster Telemetry & Health",
    method: "GET",
    path: "/v1/models/status",
    tag: "Infrastructure",
    description:
      "Query current edge GPU cluster availability, average p95/p99 inferencing latencies, and online model deployment versions across active regions.",
    latency: "< 15ms",
    statusResponse: "200 OK",
    icon: Activity,
    curl: `curl -X GET https://api.logicintelligencetechnologies.in/v1/models/status \\
  -H "Authorization: Bearer lit_live_YOUR_API_KEY"`,
    typescript: `import { LitClient } from "@lit-ai/sdk";

const client = new LitClient({ 
  apiKey: process.env.LIT_API_KEY 
});

const status = await client.models.getStatus();
console.log(\`Cluster Health: \${status.operationalStatus}\`);`,
    python: `from lit_ai import LitClient

client = LitClient(api_key="lit_live_YOUR_API_KEY")
status = client.models.get_status()

print(f"Status: {status.operational_status}, p95: {status.p95_latency_ms}ms")`,
    response: `{
  "operational_status": "OPERATIONAL",
  "region": "asia-south1",
  "active_cluster_nodes": 48,
  "p95_latency_ms": 38.6,
  "p99_latency_ms": 52.1,
  "models": {
    "dnn_voice_v3": "online",
    "llm_orchestrator_v2": "online",
    "rag_embedding_v1": "online"
  }
}`,
    headers: [
      { name: "Authorization", required: true, description: "Bearer API key" },
    ],
    parameters: [
      { name: "region", type: "string", required: false, description: "Optional region filter (e.g., 'asia-south1', 'us-east1')" },
    ],
  },
];

export default function ApiDocsInteractive() {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("voice-analyze");
  const [activeLanguage, setActiveLanguage] = useState<"curl" | "typescript" | "python">("curl");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const selectedEndpoint = ENDPOINTS.find((e) => e.id === selectedEndpointId) || ENDPOINTS[0];

  const handleCopy = (code: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedSection(id);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  const getActiveCode = () => {
    switch (activeLanguage) {
      case "typescript":
        return selectedEndpoint.typescript;
      case "python":
        return selectedEndpoint.python;
      case "curl":
      default:
        return selectedEndpoint.curl;
    }
  };

  return (
    <div className="space-y-12">
      {/* Protocol Quick-Specs Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[var(--lit-teal,#1FA9A2)] mb-1 uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Protocols</span>
          </div>
          <div className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
            REST &amp; WebSockets
          </div>
          <div className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
            JSON &amp; Binary gRPC
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#1565C0] mb-1 uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Latency SLA</span>
          </div>
          <div className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
            &lt; 42ms p95
          </div>
          <div className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
            Voice DNN Inference
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#2E7D32] mb-1 uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Auth &amp; Encryption</span>
          </div>
          <div className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
            TLS 1.3 / Bearer
          </div>
          <div className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
            HMAC-SHA256 Webhooks
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#5E35B1] mb-1 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Data Privacy</span>
          </div>
          <div className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
            Zero-Persistence
          </div>
          <div className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
            Volatile RAM Processing
          </div>
        </div>
      </div>

      {/* Main Two-Column Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Endpoint Navigation & Specs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
              <h2 className="font-poppins text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                API Endpoints
              </h2>
              <span className="text-[11px] font-mono text-[var(--lit-teal,#1FA9A2)] font-semibold">
                v1.2 Active
              </span>
            </div>

            <div className="space-y-2">
              {ENDPOINTS.map((endpoint) => {
                const isSelected = endpoint.id === selectedEndpointId;
                const Icon = endpoint.icon;
                return (
                  <button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpointId(endpoint.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 border flex items-start gap-3 ${
                      isSelected
                        ? "bg-[#E7F3FF] border-[#BBDEFB] shadow-xs"
                        : "bg-white border-transparent hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-[var(--lit-border-light,#DFE7EF)]"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        isSelected
                          ? "bg-[#1565C0] text-white"
                          : "bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-text-muted,#52677C)]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`font-poppins text-xs font-bold truncate ${
                            isSelected
                              ? "text-[#1565C0]"
                              : "text-[var(--lit-navy,#0B2545)]"
                          }`}
                        >
                          {endpoint.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            endpoint.method === "POST"
                              ? "bg-[#E0F2F1] text-[#00796B]"
                              : "bg-[#EDE7F6] text-[#5E35B1]"
                          }`}
                        >
                          {endpoint.method}
                        </span>
                      </div>
                      <code className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] truncate block">
                        {endpoint.path}
                      </code>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Authentication Overview Card */}
          <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FFF8E1] text-[#B78103]">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="font-poppins text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Bearer Authentication
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
              Every request must present an authorized API key in the{" "}
              <code className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--lit-cloud,#F7F9FC)] text-[#1565C0] border border-[var(--lit-border-light,#DFE7EF)]">
                Authorization
              </code>{" "}
              header. Live keys prefixed with <code className="font-mono text-xs text-[#00796B]">lit_live_</code> are cryptographically verified against hardware security modules.
            </p>
            <div className="pt-2 text-xs font-mono text-[var(--lit-text-muted,#52677C)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
              <span>Rotated via Enterprise Security Dashboard</span>
            </div>
          </div>

          {/* Selected Endpoint Details & Parameters */}
          <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 sm:p-8 space-y-5 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#E7F3FF] text-[#1565C0] font-mono text-[11px] font-bold mb-2">
                <span>{selectedEndpoint.method}</span>
                <span>{selectedEndpoint.path}</span>
              </div>
              <h3 className="font-poppins text-base font-bold text-[var(--lit-navy,#0B2545)]">
                {selectedEndpoint.name}
              </h3>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1.5 leading-relaxed">
                {selectedEndpoint.description}
              </p>
            </div>

            {/* Parameters Table */}
            <div className="space-y-3 pt-2">
              <h4 className="font-poppins text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Request Parameters
              </h4>
              <div className="space-y-2">
                {selectedEndpoint.parameters.map((param) => (
                  <div
                    key={param.name}
                    className="p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 font-mono font-bold text-[var(--lit-navy,#0B2545)]">
                        <span>{param.name}</span>
                        <span className="text-[10px] text-[var(--lit-text-muted,#52677C)] font-normal">
                          ({param.type})
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                          param.required
                            ? "bg-[#FCE4EC] text-[#C2185B]"
                            : "bg-[#EDE7F6] text-[#5E35B1]"
                        }`}
                      >
                        {param.required ? "Required" : "Optional"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                      {param.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Code Playground & Response Viewer */}
        <div className="lg:col-span-7 space-y-6">
          {/* Request Example Box */}
          <div className="rounded-3xl border border-[#0B2545] bg-[#0B2545] text-white shadow-xl overflow-hidden">
            {/* Header & Language Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#071930] border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]/80" />
                </div>
                <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase ml-2">
                  Request Example
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Buttons */}
                <div className="flex items-center bg-[#0B2545] rounded-xl p-1 border border-white/10">
                  <button
                    onClick={() => setActiveLanguage("curl")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                      activeLanguage === "curl"
                        ? "bg-[#1FA9A2] text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setActiveLanguage("typescript")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                      activeLanguage === "typescript"
                        ? "bg-[#1FA9A2] text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    TypeScript
                  </button>
                  <button
                    onClick={() => setActiveLanguage("python")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                      activeLanguage === "python"
                        ? "bg-[#1FA9A2] text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Python
                  </button>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => handleCopy(getActiveCode(), "request")}
                  aria-label="Copy request code snippet"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                >
                  {copiedSection === "request" ? (
                    <Check className="w-4 h-4 text-[#45D9D2]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-6 overflow-x-auto text-xs font-mono leading-relaxed bg-[#0B2545] text-[#E7F3FF]">
              <pre>
                <code>{getActiveCode()}</code>
              </pre>
            </div>
          </div>

          {/* Response Payload Box */}
          <div className="rounded-3xl border border-[#0B2545] bg-[#0B2545] text-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#071930] border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-[#45D9D2]" />
                <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                  Response Payload
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#45D9D2]/20 text-[#45D9D2] border border-[#45D9D2]/30">
                  {selectedEndpoint.statusResponse}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Latency: {selectedEndpoint.latency}
                </span>
                <button
                  onClick={() => handleCopy(selectedEndpoint.response, "response")}
                  aria-label="Copy response JSON payload"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors ml-1"
                >
                  {copiedSection === "response" ? (
                    <Check className="w-3.5 h-3.5 text-[#45D9D2]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-6 overflow-x-auto text-xs font-mono leading-relaxed bg-[#0B2545] text-[#45D9D2]">
              <pre>
                <code>{selectedEndpoint.response}</code>
              </pre>
            </div>
          </div>

          {/* Quickstart SDK Installation Strip */}
          <div className="bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 shadow-sm space-y-4">
            <h4 className="font-poppins text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Official SDK Libraries
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                    TypeScript / Node.js
                  </div>
                  <code className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
                    npm i @lit-ai/sdk
                  </code>
                </div>
                <button
                  onClick={() => handleCopy("npm i @lit-ai/sdk", "npm")}
                  className="p-1.5 rounded-lg hover:bg-white text-[var(--lit-text-muted,#52677C)] transition-colors"
                  aria-label="Copy npm install command"
                >
                  {copiedSection === "npm" ? (
                    <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                    Python (3.9+)
                  </div>
                  <code className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
                    pip install lit-ai-sdk
                  </code>
                </div>
                <button
                  onClick={() => handleCopy("pip install lit-ai-sdk", "pip")}
                  className="p-1.5 rounded-lg hover:bg-white text-[var(--lit-text-muted,#52677C)] transition-colors"
                  aria-label="Copy pip install command"
                >
                  {copiedSection === "pip" ? (
                    <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
                <ShieldCheck className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                <span>Zero-Trust Enterprise Key Verification</span>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#153e75] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
              >
                <span>Request API Credentials</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
