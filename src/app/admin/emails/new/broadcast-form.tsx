"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Loader2,
  Send,
  User,
  Mail,
  FileText,
  Sparkles,
  Eye,
  Edit3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Type,
  Bold,
  Italic,
  List,
  Link2,
  Minus,
} from "lucide-react";

interface MessageTemplate {
  id: string;
  name: string;
  badge: string;
  subject: string;
  body: string;
}

const TEMPLATES: MessageTemplate[] = [
  {
    id: "custom",
    name: "Custom Blank",
    badge: "Blank Canvas",
    subject: "",
    body: "",
  },
  {
    id: "maintenance",
    name: "Maintenance Advisory",
    badge: "Operations",
    subject: "Notice: Scheduled Platform Maintenance Window",
    body: `Hello {{fullName}},

We are writing to inform you that Logic Intelligence Technologies has scheduled a routine infrastructure maintenance window on {{date}}.

• Expected Duration: 30 minutes
• Scope: Database replication index optimization and security patch application
• Impact: Read-only access or brief momentary disconnection

All system data remains strictly protected and verified. If you encounter any unexpected behavior following the maintenance window, please reply directly to this notice or contact support at {{supportEmail}}.

Warm regards,
Operations Engineering Team
{{company}}`,
  },
  {
    id: "security",
    name: "Security Notification",
    badge: "Security",
    subject: "Security Advisory: Notice of Account Credential Verification",
    body: `Hello {{fullName}},

Our automated security systems logged an access update or credential confirmation request associated with {{email}}.

If this operation was initiated by your team, no additional action is required. If you did not authorize this action, please notify our incident response team immediately at {{supportEmail}}.

Security Incident Ref: SEC-{{date}}
System Origin: Logic Intelligence Security Console

Sincerely,
Information Security & Compliance
{{company}}`,
  },
  {
    id: "service_update",
    name: "Platform Update",
    badge: "Product",
    subject: "Platform Release: New Capabilities & Operational Improvements",
    body: `Hello {{fullName}},

We are pleased to share that an updated release of your application environment has been successfully deployed.

Highlights of this release:
• Optimized query execution latency and dashboard throughput
• Reinforced administrative audit logging and export capabilities
• Refined UI accessibility and workflow ergonomics

Please let us know if your team has any questions regarding this update.

Best regards,
Client Engineering
{{company}}`,
  },
  {
    id: "milestone_checkin",
    name: "Milestone Check-in",
    badge: "Delivery",
    subject: "Project Status & Milestone Delivery Review",
    body: `Hello {{fullName}},

Following our latest engineering cycle, we wanted to provide a direct update on your project progress and upcoming milestone checkpoints.

• Current Status: On track according to specification
• Next Deliverable: Staging environment review and validation access
• Recommended Action: Review the latest scope items when convenient

Please feel free to reply directly to this email to coordinate our next sync.

Warm regards,
Technical Delivery Lead
{{company}}`,
  },
];

const DYNAMIC_TOKENS = [
  { token: "{{fullName}}", label: "Full Name", description: "Recipient's name or fallback" },
  { token: "{{email}}", label: "Email", description: "Recipient's email address" },
  { token: "{{date}}", label: "Today's Date", description: "Current date in IST" },
  { token: "{{company}}", label: "Company", description: "Logic Intelligence Technologies" },
  { token: "{{supportEmail}}", label: "Support Email", description: "support@logicintelligencetechnologies.com" },
];

const RECIPIENT_PRESETS = [
  { label: "Direct Recipient", hint: "Manual address entry" },
  { label: "Executive Stakeholder", hint: "Formal client update" },
  { label: "Technical Lead", hint: "System / API advisory" },
  { label: "Billing Contact", hint: "Commercial communications" },
];

/**
 * Admin single-recipient transactional message composer.
 * Formatted in clinical light design with template selection,
 * token interpolation hints, and rich preview capability.
 */
export function BroadcastForm() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [recipientRole, setRecipientRole] = useState(RECIPIENT_PRESETS[0].label);
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getFormattedDate = () => {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeZone: "Asia/Kolkata",
    }).format(new Date());
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    if (templateId === "custom") {
      setSubject("");
      setMessage("");
    } else {
      setSubject(tmpl.subject);
      setMessage(tmpl.body);
    }
    setError("");
  };

  const handleInsertToken = (token: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setMessage((prev) => prev + token);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = message;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    setMessage(before + token + after);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + token.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleApplyFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);

    const replacement = `${prefix}${selectedText || "text"}${suffix}`;
    const before = message.substring(0, start);
    const after = message.substring(end, message.length);

    setMessage(before + replacement + after);

    setTimeout(() => {
      textarea.focus();
      const cursorStart = start + prefix.length;
      const cursorEnd = cursorStart + (selectedText.length || 4);
      textarea.setSelectionRange(cursorStart, cursorEnd);
    }, 0);
  };

  const getRenderedPreview = () => {
    const dateStr = getFormattedDate();
    let body = message;
    body = body.replace(/{{fullName}}/g, fullName.trim() || "Valued Client");
    body = body.replace(/{{email}}/g, email.trim() || "recipient@example.com");
    body = body.replace(/{{date}}/g, dateStr);
    body = body.replace(/{{company}}/g, "Logic Intelligence Technologies");
    body = body.replace(/{{supportEmail}}/g, "support@logicintelligencetechnologies.com");

    let sub = subject;
    sub = sub.replace(/{{fullName}}/g, fullName.trim() || "Valued Client");
    sub = sub.replace(/{{date}}/g, dateStr);

    return { subject: sub || "(No subject provided)", body };
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/admin/send-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          type: "broadcast",
          email: email.trim(),
          fullName: fullName.trim(),
          data: {
            subject: subject.trim(),
            message: message.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const bits = [
          data.error || "Failed to send message",
          data.errorCategory ? `[${data.errorCategory}]` : "",
          data.errorCode ? `(${data.errorCode})` : "",
        ].filter(Boolean);
        throw new Error(bits.join(" "));
      }

      const skip = data.skipped
        ? " — dry-run recorded (not dispatched to external SMTP relay)"
        : "";
      setSuccess(`Email ${data.status || "sent"} successfully to ${email.trim()}${skip}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to queue message");
    } finally {
      setLoading(false);
    }
  }

  const previewData = getRenderedPreview();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            Transactional Message Composer
          </h2>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
            Dispatches a single message via the central SMTP pipeline with strict audit attribution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-[var(--lit-text-muted,#52677C)] text-xs font-mono font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Single-recipient mode
          </span>
        </div>
      </div>

      {/* Recipient Section */}
      <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            1. Recipient Selector
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {RECIPIENT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setRecipientRole(preset.label)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                  recipientRole === preset.label
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-white text-[var(--lit-text-muted,#52677C)] border border-[var(--lit-border-light,#DFE7EF)] hover:bg-slate-100"
                }`}
                title={preset.hint}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
              To (Email Address) <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. client@example.com"
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider mb-1.5">
              Recipient Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Template Selector Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">
            2. Operational Template Preset
          </label>
          {selectedTemplate !== "custom" && (
            <button
              type="button"
              onClick={() => handleSelectTemplate("custom")}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to blank
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleSelectTemplate(tmpl.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedTemplate === tmpl.id
                  ? "border-blue-500 bg-blue-50/50 text-[var(--lit-navy,#0B2545)] shadow-2xs ring-1 ring-blue-500/20"
                  : "border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-text-muted,#52677C)] hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                {tmpl.badge}
              </span>
              <span className="block text-xs font-bold text-[var(--lit-navy,#0B2545)] mt-0.5 truncate">
                {tmpl.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Subject Line */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">
            3. Subject Line <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {subject.length} / 200
          </span>
        </div>
        <input
          required
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          placeholder="e.g. Project Delivery Update & Review Call"
          className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm transition-colors"
        />
      </div>

      {/* Dynamic Token Pill Hints */}
      <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Dynamic Interpolation Tokens
          </span>
          <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Click to insert into message body
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DYNAMIC_TOKENS.map((item) => (
            <button
              key={item.token}
              type="button"
              onClick={() => handleInsertToken(item.token)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-xs font-mono text-[var(--lit-navy,#0B2545)] transition-colors group"
              title={item.description}
            >
              <span className="text-blue-600 font-semibold">{item.token}</span>
              <span className="text-slate-400 text-[10px] group-hover:text-blue-700">
                ({item.label})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Rich Body Textarea & Live Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">
            4. Message Body <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("compose")}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "compose"
                  ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
                  : "bg-slate-100 text-[var(--lit-text-muted,#52677C)] hover:bg-slate-200"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Compose
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "preview"
                  ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
                  : "bg-slate-100 text-[var(--lit-text-muted,#52677C)] hover:bg-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Live Preview
            </button>
          </div>
        </div>

        {activeTab === "compose" ? (
          <div className="space-y-1.5">
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 p-1 rounded-t-xl border border-b-0 border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/70">
              <button
                type="button"
                onClick={() => handleApplyFormatting("**", "**")}
                className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-slate-600 hover:text-[var(--lit-navy,#0B2545)] text-xs font-bold transition-all"
                title="Bold (**text**)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleApplyFormatting("_", "_")}
                className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-slate-600 hover:text-[var(--lit-navy,#0B2545)] text-xs transition-all"
                title="Italic (_text_)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <div className="h-4 w-px bg-slate-300 mx-1" />
              <button
                type="button"
                onClick={() => handleApplyFormatting("• ")}
                className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-slate-600 hover:text-[var(--lit-navy,#0B2545)] text-xs transition-all"
                title="Bullet point"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleApplyFormatting("[", "](https://example.com)")}
                className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-slate-600 hover:text-[var(--lit-navy,#0B2545)] text-xs transition-all"
                title="Insert link"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleApplyFormatting("\n---\n")}
                className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-slate-600 hover:text-[var(--lit-navy,#0B2545)] text-xs transition-all"
                title="Horizontal Divider"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="ml-auto text-[11px] font-mono text-slate-400 pr-2">
                {message.length} / 8000
              </span>
            </div>

            <textarea
              ref={textareaRef}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={8000}
              rows={9}
              placeholder="Write your transactional message or select a template above..."
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 rounded-b-xl px-4 py-3 text-sm resize-y leading-relaxed font-sans"
            />
          </div>
        ) : (
          /* Live Preview Mode */
          <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Subject Preview:
              </span>
              <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)] mt-0.5">
                {previewData.subject}
              </h3>
              <div className="flex items-center gap-3 text-xs text-[var(--lit-text-muted,#52677C)] mt-1">
                <span>To: <strong className="text-[var(--lit-navy,#0B2545)]">{fullName || "Client"}</strong> &lt;{email || "recipient@example.com"}&gt;</span>
                <span>•</span>
                <span>From: hello@logicintelligence.com</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50/70 border border-slate-200/80 p-5 space-y-4 text-sm text-[var(--lit-navy,#0B2545)] leading-relaxed whitespace-pre-wrap font-sans">
              {previewData.body ? (
                previewData.body
              ) : (
                <span className="text-slate-400 italic">No message body written yet.</span>
              )}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-3">
              <span>Layout: Standard Logic Intelligence Branded Email Container</span>
              <span>Audited Delivery ID: Generated on Send</span>
            </div>
          </div>
        )}
      </div>

      {/* Alert Banners */}
      {error && (
        <div
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-2xs flex items-center gap-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-2xs flex items-center gap-2"
          role="status"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-[var(--lit-border-light,#DFE7EF)]">
        <Link
          href="/admin/emails"
          className="px-5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] font-semibold text-sm hover:bg-slate-50 transition-colors shadow-2xs"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white hover:bg-[var(--lit-navy,#0B2545)]/90 font-semibold text-sm transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Dispatching…</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-white" />
              <span>Send Transactional Message</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
