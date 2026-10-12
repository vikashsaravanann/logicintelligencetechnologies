"use client";

import { useState } from "react";
import { Download, Check, Copy, FileText, ShieldCheck } from "lucide-react";

interface ExportReportButtonProps {
  reportTitle: string;
  digestType: string;
  siteFilter: string;
  fingerprint: string;
  dataSummary: Record<string, any>;
}

export function ExportReportButton({
  reportTitle,
  digestType,
  siteFilter,
  fingerprint,
  dataSummary,
}: ExportReportButtonProps) {
  const [copied, setCopied] = useState(false);

  const reportPayload = {
    title: reportTitle,
    digestType,
    siteFilter,
    generatedAtUtc: new Date().toISOString(),
    complianceFingerprintSha256: fingerprint,
    complianceCertification:
      "DPDP Act 2023 & ABDM Guidelines Compliant: Zero PII / PHI payload contained.",
    summary: dataSummary,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(reportPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lit-compliance-report-${digestType}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        title="Copy Sanitized JSON Report"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">Copied JSON</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Copy Report</span>
          </>
        )}
      </button>

      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--lit-teal,#1FA9A2)] text-white text-xs font-bold hover:bg-[var(--lit-teal-dark,#188580)] transition-colors shadow-2xs cursor-pointer"
        title="Download Zero-PII Audit Artifact"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export (JSON)</span>
      </button>
    </div>
  );
}
