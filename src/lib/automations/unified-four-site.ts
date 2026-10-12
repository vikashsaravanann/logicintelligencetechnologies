import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type SiteKey = "corporate" | "healthcare" | "logic_voice" | "voice_shield";
export type SiteFilter = "all" | SiteKey;

export interface FourSiteMeta {
  key: SiteKey;
  code: string;
  name: string;
  domain: string;
  repo: string;
  description: string;
  gscPropertyId: string;
  sitemapUrl: string;
  robotsUrl: string;
}

export const FOUR_SITES: Record<SiteKey, FourSiteMeta> = {
  corporate: {
    key: "corporate",
    code: "LIT-CORP",
    name: "Corporate LIT",
    domain: "https://www.logicintelligencetechnologies.in",
    repo: "logicintelligencetechnologies",
    description: "Central executive and staff administration, client onboarding, CRM pipeline & commercial ops.",
    gscPropertyId: "sc-domain:logicintelligencetechnologies.in",
    sitemapUrl: "https://www.logicintelligencetechnologies.in/sitemap.xml",
    robotsUrl: "https://www.logicintelligencetechnologies.in/robots.txt",
  },
  healthcare: {
    key: "healthcare",
    code: "LIT-HC",
    name: "Healthcare Platform",
    domain: "https://healthcare.logicintelligencetechnologies.in",
    repo: "lit-smart-hospital-platform",
    description: "Clinical automation, ABDM/Ayushman Bharat health records, patient scheduling & telemetry.",
    gscPropertyId: "https://healthcare.logicintelligencetechnologies.in/",
    sitemapUrl: "https://healthcare.logicintelligencetechnologies.in/sitemap.xml",
    robotsUrl: "https://healthcare.logicintelligencetechnologies.in/robots.txt",
  },
  logic_voice: {
    key: "logic_voice",
    code: "LIT-LV",
    name: "Logic Voice",
    domain: "https://logicvoice.logicintelligencetechnologies.in",
    repo: "logic-voice",
    description: "Conversational AI voice agents, telephony orchestration, real-time audio streams.",
    gscPropertyId: "https://logicvoice.logicintelligencetechnologies.in/",
    sitemapUrl: "https://logicvoice.logicintelligencetechnologies.in/sitemap.xml",
    robotsUrl: "https://logicvoice.logicintelligencetechnologies.in/robots.txt",
  },
  voice_shield: {
    key: "voice_shield",
    code: "LIT-VS",
    name: "VoiceShield",
    domain: "https://voiceshield.logicintelligencetechnologies.in",
    repo: "voice-shield",
    description: "Biometric deepfake defense, audio provenance authentication & fraud sentinel operations.",
    gscPropertyId: "https://voiceshield.logicintelligencetechnologies.in/",
    sitemapUrl: "https://voiceshield.logicintelligencetechnologies.in/sitemap.xml",
    robotsUrl: "https://voiceshield.logicintelligencetechnologies.in/robots.txt",
  },
};

export const SITES_ARRAY: FourSiteMeta[] = [
  FOUR_SITES.corporate,
  FOUR_SITES.healthcare,
  FOUR_SITES.logic_voice,
  FOUR_SITES.voice_shield,
];

export interface CanonicalWorkflow {
  workflowKey: string;
  workflowId: string;
  rawSite: string;
  siteKey: SiteKey;
  siteName: string;
  name: string;
  category: string;
  triggerType: string;
  sourceStatus: string;
  sourceReference: string;
  riskClass: "R0" | "R1" | "R2" | "R3" | "R4";
  engine: string;
  liveStatus: "STAGED" | "ACTIVE" | "PAUSED" | "DEPRECATED" | "RETIRED" | "UNVERIFIED";
  status: string;
  ownerApprovalRequired: string;
  requiresApproval: boolean;
  dataClassification: string;
  notes: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function mapSiteToKey(rawSite: string): SiteKey {
  const norm = rawSite.trim().toUpperCase();
  if (norm.includes("HEALTHCARE")) return "healthcare";
  if (norm.includes("VOICE_SHIELD") || norm.includes("VOICESHIELD")) return "voice_shield";
  if (norm.includes("LOGIC_VOICE") || norm.includes("VOICE")) return "logic_voice";
  return "corporate";
}

let cachedWorkflows: CanonicalWorkflow[] | null = null;

export function getCanonicalWorkflows(): CanonicalWorkflow[] {
  if (cachedWorkflows) return cachedWorkflows;

  const csvPath = path.join(process.cwd(), "docs/automation-program/CANONICAL_WORKFLOW_REGISTRY.csv");
  if (!fs.existsSync(csvPath)) {
    return [];
  }

  const content = fs.readFileSync(csvPath, "utf8");
  const lines = content.trim().split("\n");
  const workflows: CanonicalWorkflow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = parseCsvLine(line);
    if (parts.length < 8) continue;

    const [
      workflowKey,
      rawSite,
      name,
      sourceStatus,
      sourceReference,
      riskClassRaw,
      engine,
      liveStatusRaw,
      ownerApprovalRequired,
      notes,
    ] = parts;

    const siteKey = mapSiteToKey(rawSite);
    const siteMeta = FOUR_SITES[siteKey];

    let riskClass: "R0" | "R1" | "R2" | "R3" | "R4" = "R1";
    if (["R0", "R1", "R2", "R3", "R4"].includes(riskClassRaw)) {
      riskClass = riskClassRaw as "R0" | "R1" | "R2" | "R3" | "R4";
    }

    let liveStatus: CanonicalWorkflow["liveStatus"] = "STAGED";
    const statusUpper = (liveStatusRaw || "").toUpperCase();
    if (["ACTIVE", "PAUSED", "DEPRECATED", "RETIRED", "UNVERIFIED", "STAGED"].includes(statusUpper)) {
      liveStatus = statusUpper as CanonicalWorkflow["liveStatus"];
    }

    const requiresApproval =
      (ownerApprovalRequired || "").trim().toUpperCase() === "YES" ||
      riskClass === "R3" ||
      riskClass === "R4";

    workflows.push({
      workflowKey,
      workflowId: workflowKey,
      rawSite,
      siteKey,
      siteName: siteMeta.name,
      name: name.replace(/^"|"$/g, ""),
      category: sourceStatus || "Operations",
      triggerType: engine || "Manual/Cron",
      sourceStatus,
      sourceReference,
      riskClass,
      engine: engine || "n8n",
      liveStatus,
      status: liveStatus,
      ownerApprovalRequired: ownerApprovalRequired || "NO",
      requiresApproval,
      dataClassification: riskClass === "R4" || riskClass === "R3" ? "Restricted Financial/Audit" : "Operational Internal",
      notes: notes || "",
    });
  }

  cachedWorkflows = workflows;
  return workflows;
}

export function getWorkflowById(id: string): CanonicalWorkflow | undefined {
  return getCanonicalWorkflows().find((w) => w.workflowKey === id || w.workflowId === id);
}

export function filterWorkflows(workflows: CanonicalWorkflow[], site?: SiteFilter, search?: string, risk?: string): CanonicalWorkflow[] {
  let list = workflows;
  if (site && site !== "all") {
    list = list.filter((w) => w.siteKey === site);
  }
  if (risk && risk !== "all") {
    list = list.filter((w) => w.riskClass === risk);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (w) =>
        w.workflowKey.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q) ||
        w.notes.toLowerCase().includes(q)
    );
  }
  return list;
}

export function getWorkflowCountsBySite(workflows: CanonicalWorkflow[]): Record<SiteKey, number> {
  const counts: Record<SiteKey, number> = {
    corporate: 0,
    healthcare: 0,
    logic_voice: 0,
    voice_shield: 0,
  };
  for (const w of workflows) {
    if (counts[w.siteKey] !== undefined) {
      counts[w.siteKey]++;
    }
  }
  return counts;
}

export function getWorkflowCountsByRisk(workflows: CanonicalWorkflow[]): Record<string, number> {
  const counts: Record<string, number> = {
    R0: 0,
    R1: 0,
    R2: 0,
    R3: 0,
    R4: 0,
  };
  for (const w of workflows) {
    if (counts[w.riskClass] !== undefined) {
      counts[w.riskClass]++;
    }
  }
  return counts;
}

export function getWorkflowCountsByStatus(workflows: CanonicalWorkflow[]): Record<string, number> {
  const counts: Record<string, number> = {
    STAGED: 0,
    ACTIVE: 0,
    PAUSED: 0,
    DEPRECATED: 0,
    RETIRED: 0,
    UNVERIFIED: 0,
  };
  for (const w of workflows) {
    if (counts[w.liveStatus] !== undefined) {
      counts[w.liveStatus]++;
    }
  }
  return counts;
}
