"use client";

import { useState, useTransition } from "react";
import {
  Settings,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Key,
  Globe,
  Lock,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { testN8nConnectionAction, saveN8nConfigAction } from "./actions";

interface ConfigureN8nDialogProps {
  currentBase?: string;
  isOpen?: boolean;
  onClose?: () => void;
  triggerButtonText?: string;
  triggerButtonClass?: string;
}

export default function ConfigureN8nDialog({
  currentBase = "https://automation.logicintelligencetechnologies.in",
  triggerButtonText = "Configure Engine",
  triggerButtonClass,
}: ConfigureN8nDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [base, setBase] = useState(currentBase);
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showKey, setShowKey] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    status: number;
    message: string;
    workflowCount?: number;
  } | null>(null);

  const [saving, startSaving] = useTransition();
  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    setSaveStatus(null);
    try {
      const res = await testN8nConnectionAction({ base, apiKey });
      setTestResult(res);
    } catch (err) {
      setTestResult({
        ok: false,
        status: 500,
        message: err instanceof Error ? err.message : "Test request failed",
      });
    } finally {
      setTesting(false);
    }
  }

  function handleSave() {
    startSaving(async () => {
      setSaveStatus(null);
      try {
        const res = await saveN8nConfigAction({ base, apiKey, webhookSecret });
        setSaveStatus(res);
        if (res.ok) {
          setTimeout(() => {
            setIsOpen(false);
          }, 1200);
        }
      } catch (err) {
        setSaveStatus({
          ok: false,
          message: err instanceof Error ? err.message : "Failed to save configuration",
        });
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setTestResult(null);
          setSaveStatus(null);
        }}
        className={
          triggerButtonClass ??
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs font-semibold text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-slate-50 transition-colors"
        }
      >
        <Settings className="w-3.5 h-3.5 text-[var(--lit-blue,#1565C0)]" />
        {triggerButtonText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-50 text-[var(--lit-blue,#1565C0)] border border-blue-100">
                  <Settings className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                    Configure n8n Engine
                  </h3>
                  <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                    Link n8n Workflow Execution Runtime &amp; Public API
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Instructions Callout */}
              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 text-xs text-blue-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Generating an n8n Public API Key
                </div>
                <ol className="list-decimal list-inside text-[11px] text-blue-900/90 space-y-0.5 ml-1">
                  <li>
                    Open your n8n instance at{" "}
                    <a
                      href={base || currentBase}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-mono font-medium hover:text-blue-700 inline-flex items-center gap-0.5"
                    >
                      {base || currentBase} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </li>
                  <li>Go to <strong>Settings</strong> &gt; <strong>Public API</strong></li>
                  <li>Click <strong>Create API key</strong>, enter a label (e.g. <code>lit-admin</code>), and copy the key</li>
                  <li>Paste the key below and click <strong>Test Connection</strong></li>
                </ol>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                    n8n Instance Base URL
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="url"
                      value={base}
                      onChange={(e) => setBase(e.target.value)}
                      placeholder="https://automation.logicintelligencetechnologies.in"
                      className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs font-mono text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                    n8n API Key
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setTestResult(null);
                        setSaveStatus(null);
                      }}
                      placeholder="Paste your n8n Public API key here..."
                      className="w-full h-9 pl-9 pr-10 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs font-mono text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
                      aria-label={showKey ? "Hide key" : "Show key"}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--lit-text-muted,#52677C)] mt-1">
                    Used for health checks and workflow synchronization via authenticated REST endpoints.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                    Webhook HMAC Secret (Optional)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="password"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      placeholder="Leave blank to retain current webhook secret"
                      className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs font-mono text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--lit-text-muted,#52677C)] mt-1">
                    Used for HMAC-SHA256 signature verification on outbound dispatch events.
                  </p>
                </div>
              </div>

              {/* Real-time Test / Save Feedback */}
              {testing && (
                <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 text-xs text-blue-800 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Connecting to n8n and verifying API key...</span>
                </div>
              )}

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testResult.ok
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-rose-200 bg-rose-50 text-rose-900"
                  }`}
                >
                  {testResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold block">
                      {testResult.ok ? "Connection Verified" : `Connection Failed (HTTP ${testResult.status})`}
                    </span>
                    <span className="text-[11px] block mt-0.5">{testResult.message}</span>
                  </div>
                </div>
              )}

              {saveStatus && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    saveStatus.ok
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-rose-200 bg-rose-50 text-rose-900"
                  }`}
                >
                  {saveStatus.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{saveStatus.message}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || saving || !base || !apiKey}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-[var(--lit-navy,#0B2545)] shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                {testing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Test Connection
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || testing || !base || !apiKey}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--lit-navy,#0B2545)] text-xs font-semibold text-white shadow-2xs hover:bg-[#153a66] disabled:opacity-50 transition-colors"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save &amp; Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
