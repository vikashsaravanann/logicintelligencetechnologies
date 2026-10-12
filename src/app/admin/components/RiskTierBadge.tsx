import React from "react";

export type RiskTier = "R0" | "R1" | "R2" | "R3" | "R4";

interface Props {
  tier?: RiskTier | string;
  riskClass?: RiskTier | string;
  showDescription?: boolean;
}

const TIER_META: Record<
  string,
  { label: string; desc: string; style: string; badge: string }
> = {
  R0: {
    label: "R0 · Telemetry / Probes",
    desc: "Read-only inspection, sitemap checks, telemetry",
    style: "bg-slate-100 text-slate-700 border-slate-200",
    badge: "R0",
  },
  R1: {
    label: "R1 · Internal Alerts",
    desc: "Operational notifications, team Slack/email alerts",
    style: "bg-blue-50 text-blue-700 border-blue-200",
    badge: "R1",
  },
  R2: {
    label: "R2 · Client Comms",
    desc: "Customer emails, appointment notifications, intake routing",
    style: "bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border-teal-200",
    badge: "R2",
  },
  R3: {
    label: "R3 · Security & CDN",
    desc: "Role changes, credentials, selective edge cache purges",
    style: "bg-amber-50 text-amber-800 border-amber-200",
    badge: "R3",
  },
  R4: {
    label: "R4 · Regulated / Financial",
    desc: "Invoicing, payment reconciliation, data retention",
    style: "bg-rose-50 text-rose-800 border-rose-200",
    badge: "R4",
  },
};

export function RiskTierBadge({ tier, riskClass, showDescription = false }: Props) {
  const effectiveTier = tier ?? riskClass ?? "R1";
  const meta = TIER_META[effectiveTier] || {
    label: `${effectiveTier} · Custom`,
    desc: "Unclassified risk tier",
    style: "bg-gray-100 text-gray-700 border-gray-200",
    badge: effectiveTier,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-bold font-mono tracking-wider ${meta.style}`}
      title={meta.desc}
    >
      <span>{meta.badge}</span>
      {showDescription && (
        <span className="font-sans font-medium text-[10px] text-gray-500 hidden sm:inline">
          ({meta.desc})
        </span>
      )}
    </span>
  );
}
