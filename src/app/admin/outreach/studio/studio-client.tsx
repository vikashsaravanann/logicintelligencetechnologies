"use client";

import { useState } from "react";
import {
  Loader2,
  Sparkles,
  Check,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Edit3,
  RefreshCw,
  AlertTriangle,
  Tag,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { generateDraft, approveDraft, type StudioGenerateResult } from "./actions";

interface EvidenceItemSummary {
  kind: string;
  statement: string;
  source?: string;
  measured_value?: string;
}

interface LeadDataSummary {
  domain?: string;
  industry?: string;
  city?: string;
  country_code?: string;
  opportunityType?: string;
  evidenceItems?: EvidenceItemSummary[];
}

export function StudioPanel({
  businessId,
  companyName,
  compliance,
  evidenceCount,
  hasOpportunity,
  leadData,
}: {
  businessId: string;
  companyName: string;
  compliance: {
    cleared: boolean;
    reason: string;
    jurisdictionStatus: string;
    suppressed: boolean;
  };
  evidenceCount: number;
  hasOpportunity: boolean;
  leadData?: LeadDataSummary;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudioGenerateResult | null>(null);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

  // Template / Prompt Editor state
  const [channel, setChannel] = useState("email");
  const [tone, setTone] = useState("professional");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");

  const canGenerate = hasOpportunity && evidenceCount > 0;

  // Variables available for preview and copy
  const variables = [
    { label: "Company", tag: "{{company_name}}", value: companyName },
    { label: "Industry", tag: "{{industry}}", value: leadData?.industry || "Technology" },
    { label: "Location", tag: "{{city}}", value: leadData?.city || "HQ" },
    { label: "Domain", tag: "{{domain}}", value: leadData?.domain || "Official Website" },
    { label: "Opportunity", tag: "{{opportunity}}", value: leadData?.opportunityType || "Performance" },
    {
      label: "Evidence",
      tag: "{{measured_fact}}",
      value: leadData?.evidenceItems?.[0]?.statement?.slice(0, 35) + "..." || "Observed measurement",
    },
  ];

  async function handleGenerate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setResult(null);
    setApproved(false);
    setIsEditingDraft(false);

    try {
      const fd = new FormData();
      fd.set("businessId", businessId);
      fd.set("channel", channel);
      fd.set("tone", tone);
      if (customPrompt.trim()) {
        fd.set("customPrompt", customPrompt.trim());
      }
      const res = await generateDraft(fd);
      setResult(res);
      if (res.draft) {
        setEditedSubject(res.draft.subject || "");
        setEditedBody(res.draft.body || "");
      }
    } catch {
      setResult({ ok: false, message: "Something went wrong generating the draft." });
    } finally {
      setLoading(false);
    }
  }

  async function onApprove() {
    if (!result?.savedId) return;
    setApproving(true);
    try {
      const r = await approveDraft(result.savedId);
      setApproved(r.ok);
      if (!r.ok) setResult({ ...result, message: r.message });
    } finally {
      setApproving(false);
    }
  }

  function copyVariableTag(tag: string) {
    navigator.clipboard?.writeText(tag).then(() => {
      setCopiedVariable(tag);
      setTimeout(() => setCopiedVariable(null), 2000);
    }).catch(() => {});
  }

  const draft = result?.draft;
  const gates = result?.gates ?? [];
  const currentSubject = isEditingDraft ? editedSubject : (draft?.subject || "");
  const currentBody = isEditingDraft ? editedBody : (draft?.body || "");

  return (
    <div className="space-y-6">
      {/* Compliance Quality Banner */}
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 text-xs shadow-2xs ${
          compliance.cleared
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        {compliance.cleared ? (
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        ) : (
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        )}
        <div className="flex-1">
          <span className="font-bold">
            {compliance.cleared ? "Compliance Cleared: " : "Restricted / Review Required: "}
          </span>
          <span>{compliance.reason}. </span>
          <span className="text-[11px] opacity-90 block mt-0.5">
            Jurisdiction clearance and do-not-contact suppressions are strictly enforced by database triggers on every send.
          </span>
        </div>
      </div>

      {/* Variable Preview Chips */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Lead Variable Preview Chips
            </h3>
          </div>
          {copiedVariable ? (
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Copied {copiedVariable}
            </span>
          ) : (
            <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              Click any chip to copy token
            </span>
          )}
        </div>

        <div className="mt-3.5 flex flex-wrap gap-2">
          {variables.map((v) => (
            <button
              key={v.tag}
              type="button"
              onClick={() => copyVariableTag(v.tag)}
              title={`Click to copy ${v.tag} (Value: ${v.value})`}
              className="group inline-flex items-center gap-1.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-3 py-1.5 text-xs text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-blue,#1565C0)] hover:bg-white transition-all shadow-2xs cursor-pointer"
            >
              <span className="font-mono text-[10px] font-bold text-[var(--lit-blue,#1565C0)]">
                {v.tag}
              </span>
              <span className="text-slate-400 group-hover:text-slate-600">•</span>
              <span className="text-xs font-medium text-[var(--lit-text-muted,#52677C)] max-w-[140px] truncate">
                {v.value}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt / Template Editor Form */}
      <form
        onSubmit={handleGenerate}
        className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-[var(--lit-blue,#1565C0)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Campaign Copy Parameters
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
            AI Engine: Claude 3.5 Sonnet / OpenAI GPT-4o
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Channel selector */}
          <label className="text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
            Target Channel
            <div className="relative mt-1.5">
              <select
                name="channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-3.5 py-2.5 text-xs font-medium text-[var(--lit-navy,#0B2545)] focus:bg-white focus:border-[var(--lit-blue,#1565C0)] focus:outline-none transition-all cursor-pointer"
              >
                <option value="email">Email (Sequenced multi-touch)</option>
                <option value="linkedin">LinkedIn (Direct message)</option>
                <option value="whatsapp">WhatsApp (Direct short-form)</option>
              </select>
            </div>
          </label>

          {/* Tone selector */}
          <label className="text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
            Tone of Voice
            <div className="relative mt-1.5">
              <select
                name="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-3.5 py-2.5 text-xs font-medium text-[var(--lit-navy,#0B2545)] focus:bg-white focus:border-[var(--lit-blue,#1565C0)] focus:outline-none transition-all cursor-pointer"
              >
                <option value="professional">Professional (Clinical &amp; Evidence-Driven)</option>
                <option value="friendly">Friendly (Consultative &amp; Warm)</option>
                <option value="concise">Concise (Executive Bullet Summary)</option>
              </select>
            </div>
          </label>
        </div>

        {/* Custom guidance / Angle editor */}
        <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
          Custom Template Angle / Call to Action (Optional)
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={2}
            placeholder="e.g. Reference their high Largest Contentful Paint score and offer a brief 10-minute technical audit review..."
            className="mt-1.5 w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-3.5 py-2.5 text-xs text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:bg-white focus:border-[var(--lit-blue,#1565C0)] focus:outline-none transition-all resize-none"
          />
        </label>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {!canGenerate ? (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              {hasOpportunity
                ? "No verified evidence on this lead yet."
                : "This lead has no classified opportunity."}{" "}
              Enrich the lead before drafting.
            </p>
          ) : (
            <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              Generation takes ~2 seconds and runs through 10 QA blockers.
            </span>
          )}

          <button
            type="submit"
            disabled={loading || !canGenerate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-2xs disabled:opacity-40 cursor-pointer shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[var(--lit-teal,#1FA9A2)]" />
            ) : (
              <Sparkles className="h-4 w-4 text-[var(--lit-teal,#1FA9A2)]" />
            )}
            {loading ? "Generating Evidence Draft..." : "Generate Draft Variant"}
          </button>
        </div>
      </form>

      {/* Generation Error Display */}
      {result && !result.ok ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{result.message}</span>
        </div>
      ) : null}

      {/* AI Generated Copy Variant Viewer & QA Gating */}
      {draft ? (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs p-6 space-y-5">
          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
                  Variant Generated
                </span>
                <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                  For {companyName}
                </span>
              </div>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                Channel: <span className="capitalize font-medium">{channel}</span> • Tone: <span className="capitalize font-medium">{tone}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {typeof result?.score?.total === "number" ? (
                <span className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-xs font-bold text-blue-800">
                  QA Score: {result.score.total}/60
                </span>
              ) : null}

              <button
                type="button"
                onClick={() => setIsEditingDraft(!isEditingDraft)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  isEditingDraft
                    ? "border-blue-300 bg-blue-50 text-blue-800"
                    : "border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:bg-slate-50"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingDraft ? "Done Editing" : "Edit Text"}
              </button>
            </div>
          </div>

          {/* Subject Line */}
          {draft.subject || isEditingDraft ? (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                Subject Line
              </label>
              {isEditingDraft ? (
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-3.5 py-2 text-sm font-semibold text-[var(--lit-navy,#0B2545)] focus:bg-white focus:border-[var(--lit-blue,#1565C0)] focus:outline-none"
                />
              ) : (
                <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-3.5 py-2.5 text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  {currentSubject}
                </div>
              )}
            </div>
          ) : null}

          {/* Body Content */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
              Message Body Copy
            </label>
            {isEditingDraft ? (
              <textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={10}
                className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 font-mono text-xs leading-relaxed text-[var(--lit-navy,#0B2545)] focus:border-[var(--lit-blue,#1565C0)] focus:outline-none"
              />
            ) : (
              <pre className="whitespace-pre-wrap rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-4 text-xs font-mono leading-relaxed text-[var(--lit-navy,#0B2545)]">
                {currentBody}
              </pre>
            )}
          </div>

          {/* Claims Requiring Review Alert */}
          {draft.claims_requiring_review && draft.claims_requiring_review.length > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <span className="font-bold">Claims Needing Human Verification: </span>
              {draft.claims_requiring_review.join("; ")}
            </div>
          ) : null}

          {/* QA Quality Gates Checkers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                QA Verification Gates ({gates.filter((g) => g.pass).length}/{gates.length} Passed)
              </h4>
              <span className="text-[10px] text-[var(--lit-text-muted,#52677C)] font-mono">
                Mandatory for queue approval
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {gates.map((g) => (
                <span
                  key={g.key}
                  title={g.detail}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold ${
                    g.pass
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : g.blocker
                        ? "border border-rose-200 bg-rose-50 text-rose-700"
                        : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  <span>{g.pass ? "✓" : "✗"}</span>
                  <span>{g.key}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Clinical Action Controls */}
          <div className="pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Copy to Clipboard Button */}
              <button
                type="button"
                onClick={() => {
                  const textToCopy = `${currentSubject ? currentSubject + "\n\n" : ""}${currentBody}`;
                  navigator.clipboard?.writeText(textToCopy).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }).catch(() => {});
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3.5 py-2 text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy to Clipboard"}
              </button>

              {/* Regenerate Variant Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleGenerate()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-[var(--lit-blue,#1565C0)] hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Regenerate Variant
              </button>
            </div>

            <div className="flex items-center gap-3">
              {!result?.blockersPass ? (
                <span className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                  Blocked by a QA gate — cannot be approved.
                </span>
              ) : approved ? (
                <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Approved. Message queued for controlled dispatch.
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onApprove}
                  disabled={approving || approved || !result?.blockersPass || !result?.savedId}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all shadow-2xs disabled:opacity-40 cursor-pointer"
                >
                  {approving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {approved ? "Approved" : "Approve for Queue"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
