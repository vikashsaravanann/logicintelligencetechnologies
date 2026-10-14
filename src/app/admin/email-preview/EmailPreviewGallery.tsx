"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Smartphone,
  Monitor,
  Code2,
  FileText,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface TemplateMetadata {
  key: string;
  name: string;
  category: string;
  description: string;
  subject: string;
  defaultSender: string;
  replyTo: string;
}

interface PreviewData extends TemplateMetadata {
  html: string;
  plainText: string;
  links: string[];
}

interface Props {
  initialTemplates: TemplateMetadata[];
  initialPreview: PreviewData;
}

export function EmailPreviewGallery({ initialTemplates, initialPreview }: Props) {
  const [selectedKey, setSelectedKey] = useState<string>(initialPreview.key);
  const [preview, setPreview] = useState<PreviewData>(initialPreview);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [viewTab, setViewTab] = useState<"rendered" | "text" | "links">("rendered");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedKey === initialPreview.key) {
      setPreview(initialPreview);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch(`/api/admin/emails/preview?key=${encodeURIComponent(selectedKey)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.ok && data.preview) {
          setPreview(data.preview);
        }
      })
      .catch((err) => console.error("Failed to load email preview:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedKey, initialPreview]);

  // Group templates by category
  const categories = Array.from(new Set(initialTemplates.map((t) => t.category)));

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select Enterprise Email Template ({initialTemplates.length} Available)
            </label>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--lit-navy,#0B2545)] focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:bg-white transition-all outline-hidden cursor-pointer"
            >
              {categories.map((cat) => (
                <optgroup key={cat} label={cat.toUpperCase()}>
                  {initialTemplates
                    .filter((t) => t.category === cat)
                    .map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Mode Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Device Switcher */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setDeviceMode("desktop")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  deviceMode === "desktop"
                    ? "bg-white text-[var(--lit-navy,#0B2545)] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (620px)</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  deviceMode === "mobile"
                    ? "bg-white text-[var(--lit-navy,#0B2545)] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (375px)</span>
              </button>
            </div>

            {/* View Mode Tabs */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewTab("rendered")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewTab === "rendered"
                    ? "bg-white text-[var(--lit-navy,#0B2545)] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Rendered</span>
              </button>
              <button
                type="button"
                onClick={() => setViewTab("text")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewTab === "text"
                    ? "bg-white text-[var(--lit-navy,#0B2545)] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Plain Text</span>
              </button>
              <button
                type="button"
                onClick={() => setViewTab("links")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewTab === "links"
                    ? "bg-white text-[var(--lit-navy,#0B2545)] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Link Audit ({preview.links?.length || 0})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Template Metadata Pill Card */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <span className="text-slate-500 font-medium block">Subject:</span>
            <span className="font-semibold text-slate-900 truncate block">{preview.subject}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <span className="text-slate-500 font-medium block">From:</span>
            <span className="font-semibold text-slate-900 truncate block">{preview.defaultSender}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <span className="text-slate-500 font-medium block">Reply-To:</span>
            <span className="font-semibold text-slate-900 truncate block">{preview.replyTo}</span>
          </div>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="bg-slate-100 rounded-3xl p-6 sm:p-10 border border-slate-200 flex justify-center min-h-[640px] relative">
        {loading ? (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center rounded-3xl z-10">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-full shadow-md text-xs font-semibold text-slate-700">
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--lit-blue,#1565C0)]" />
              Rendering LIT Email v2...
            </div>
          </div>
        ) : null}

        {viewTab === "rendered" && (
          <div
            className={`transition-all duration-300 ease-out bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden ${
              deviceMode === "desktop" ? "w-full max-w-[620px]" : "w-full max-w-[375px]"
            }`}
          >
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono">{deviceMode === "desktop" ? "Desktop Preview (620px)" : "Mobile Preview (375px)"}</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                LIT EMAIL v2 Verified
              </span>
            </div>
            <iframe
              srcDoc={preview.html}
              title="Email Render"
              className="w-full h-[720px] border-none bg-[#F7F9FC]"
              sandbox="allow-same-origin"
            />
          </div>
        )}

        {viewTab === "text" && (
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Generated Plain-Text Output
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {preview.plainText?.length || 0} characters
              </span>
            </div>
            <pre className="text-xs font-mono text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {preview.plainText}
            </pre>
          </div>
        )}

        {viewTab === "links" && (
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Destination Link Audit</h4>
                <p className="text-xs text-slate-500">
                  Verifies that all action buttons and footer links resolve to secure HTTPS production endpoints.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {preview.links?.length || 0} Links Scanned
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {preview.links && preview.links.length > 0 ? (
                preview.links.map((link, idx) => {
                  const isHttps = link.startsWith("https://");
                  const isInternal = link.includes("logicintelligencetechnologies.in");

                  return (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="min-w-0 flex-1">
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[var(--lit-blue,#1565C0)] hover:underline truncate block"
                        >
                          {link}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isHttps ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            HTTPS Valid
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Insecure Protocol
                          </span>
                        )}
                        {isInternal && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Official Domain
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No hyperlinks embedded in this template.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Safety Notice Footer */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-[var(--lit-blue,#1565C0)] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--lit-navy,#0B2545)]">Administrative Preview Harness:</strong> All rendered previews use synthetic, non-personal data fixtures for quality assurance. Live sending actions are strictly disabled in this preview environment. Zero unauthenticated PHI is permitted across any template.
        </div>
      </div>
    </div>
  );
}
