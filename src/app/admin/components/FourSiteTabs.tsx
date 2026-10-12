import Link from "next/link";
import { Building2, HeartPulse, Mic, ShieldCheck, Globe } from "lucide-react";
import { SiteFilter } from "@/lib/automations/unified-four-site";

interface Props {
  currentSite?: SiteFilter | string;
  activeSite?: SiteFilter | string;
  counts?: {
    all?: number;
    corporate?: number;
    healthcare?: number;
    logic_voice?: number;
    voice_shield?: number;
  } | Record<string, number>;
  basePath?: string;
  baseUrl?: string;
}

export function FourSiteTabs({ currentSite, activeSite, counts, basePath, baseUrl }: Props) {
  const activeKey = activeSite ?? currentSite ?? "all";
  const effectiveBase = baseUrl ?? basePath ?? "";
  const tabs = [
    {
      key: "all",
      label: "All Sites",
      icon: Globe,
      count: counts?.all,
    },
    {
      key: "corporate",
      label: "Corporate LIT",
      icon: Building2,
      count: counts?.corporate,
    },
    {
      key: "healthcare",
      label: "Healthcare",
      icon: HeartPulse,
      count: counts?.healthcare,
    },
    {
      key: "logic_voice",
      label: "Logic Voice",
      icon: Mic,
      count: counts?.logic_voice,
    },
    {
      key: "voice_shield",
      label: "VoiceShield",
      icon: ShieldCheck,
      count: counts?.voice_shield,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--lit-border-light,#DFE7EF)]">
      {tabs.map((tab) => {
        const isActive = activeKey === tab.key;
        const Icon = tab.icon;
        const href = tab.key === "all" ? effectiveBase : `${effectiveBase}?site=${tab.key}`;

        return (
          <Link
            key={tab.key}
            href={href}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs"
                : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-white"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[var(--lit-teal,#1FA9A2)]" : "text-gray-400"}`} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
