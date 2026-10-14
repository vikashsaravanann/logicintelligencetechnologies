#!/usr/bin/env node
/**
 * apply-suggestions.mjs — Visibility Engine Phase 3 apply helper.
 *
 * This is a DELIBERATELY SIMPLE assistant for the human-run apply step. It does
 * NOT push code or open PRs. It:
 *   1. fetches an entity's 'approved' content_suggestions from Supabase, and
 *      writes them + a ready-to-paste PR body into an output folder, so you can
 *      implement them idiomatically in the product repo and open a PR; and
 *   2. after a human merges that PR, marks those suggestions 'applied' and
 *      stores the PR url (--mark-applied --pr <url>).
 *
 * Nothing here publishes to a product site. A human writes the code, opens the
 * PR, and merges it. See scripts/apply-suggestions.md for the full procedure.
 *
 * Env (service-role; never commit these):
 *   SUPABASE_URL                e.g. https://lcmbwalrupoyparxsnjw.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/apply-suggestions.mjs --entity voiceshield.logicintelligencetechnologies.in [--out .visibility-apply]
 *   node scripts/apply-suggestions.mjs --entity <domain|uuid|name> --mark-applied \
 *        --suggestion <uuid>[,<uuid>...] --pr https://github.com/owner/repo/pull/123
 *   (mark-applied transitions ONLY the listed approved suggestions, and only after the PR is merged.)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SB_URL || !SB_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(1);
}

const entityArg = arg("entity");
if (!entityArg || entityArg === true) {
  console.error("Pass --entity <domain|uuid|name>.");
  process.exit(1);
}

const headers = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  "Content-Type": "application/json",
};

async function rest(path, init = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

async function resolveEntity(key) {
  if (isUuid(key)) {
    const r = await rest(`tracked_entities?id=eq.${key}&select=*`);
    return r?.[0];
  }
  const byDomain = await rest(`tracked_entities?domain=eq.${encodeURIComponent(key)}&select=*`);
  if (byDomain?.[0]) return byDomain[0];
  const byName = await rest(`tracked_entities?name=eq.${encodeURIComponent(key)}&select=*`);
  return byName?.[0];
}

const entity = await resolveEntity(entityArg);
if (!entity) {
  console.error(`No tracked_entities row matched "${entityArg}".`);
  process.exit(1);
}

// All approved suggestions for this entity (joined to their asset).
const approved = await rest(
  `content_suggestions?select=id,kind,payload,rationale,status,query_id,gap_id,content_assets!inner(url,repo,page_path,entity_id),target_queries(query_text)&content_assets.entity_id=eq.${entity.id}&status=eq.approved&order=created_at.asc`,
);

if (arg("mark-applied")) {
  const pr = arg("pr");
  if (!pr || pr === true || !/^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+$/.test(String(pr))) {
    console.error("Pass a specific merged PR with --pr https://github.com/<owner>/<repo>/pull/<n>.");
    process.exit(1);
  }
  // Require the exact suggestion id(s) that this PR actually applied — never
  // blanket-mark every approved row for the entity. Each suggestion gets the
  // PR that shipped it, so pr_url is a true suggestion->PR relationship.
  const idsArg = arg("suggestion") || arg("suggestions");
  if (!idsArg || idsArg === true) {
    console.error(
      "Pass --suggestion <uuid>[,<uuid>...] listing exactly the approved suggestions this PR applied.\n" +
        "Approved suggestions available (id — kind — page):",
    );
    for (const s of approved) {
      console.error(`  ${s.id}  ${s.kind}  ${s.content_assets?.url ?? ""}`);
    }
    process.exit(1);
  }
  const wanted = String(idsArg)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const approvedIds = new Set(approved.map((s) => s.id));
  const bad = wanted.filter((id) => !approvedIds.has(id));
  if (bad.length) {
    console.error(`These ids are not approved suggestions for this entity: ${bad.join(", ")}`);
    process.exit(1);
  }
  // Only transition approved -> applied for exactly these ids; return the rows
  // so we can confirm the affected count.
  const updated = await rest(
    `content_suggestions?id=in.(${wanted.join(",")})&status=eq.approved`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status: "applied", pr_url: pr }),
    },
  );
  console.log(`Marked ${(updated || []).length} of ${wanted.length} requested suggestion(s) applied; pr_url=${pr}`);
  console.log("Reminder: only run this after the PR is actually merged.");
  process.exit(0);
}

if (!approved.length) {
  console.log(`No approved suggestions for ${entity.name} (${entity.domain}). Approve some in the Content tab first.`);
  process.exit(0);
}

const outDir = typeof arg("out") === "string" ? arg("out") : ".visibility-apply";
const base = join(outDir, entity.domain || entity.id);
mkdirSync(base, { recursive: true });

const repo = approved[0]?.content_assets?.repo ?? "<product-repo>";
const byKind = {};
for (const s of approved) (byKind[s.kind] = byKind[s.kind] || []).push(s);

// Write raw payloads per kind.
writeFileSync(join(base, "suggestions.json"), JSON.stringify(approved, null, 2));
for (const [kind, rows] of Object.entries(byKind)) {
  const payloads = rows.map((r) => r.payload);
  const ext = kind === "factual_sentences" ? "txt" : "json";
  const content =
    kind === "factual_sentences"
      ? payloads.flat().join("\n")
      : JSON.stringify(payloads.length === 1 ? payloads[0] : payloads, null, 2);
  writeFileSync(join(base, `${kind}.${ext}`), content);
}

// Ready-to-paste PR body.
const date = new Date().toISOString().slice(0, 10);
const prLines = [
  `# Visibility Engine content for ${entity.name}`,
  "",
  `Applies ${approved.length} approved content suggestion(s) from the LIT Visibility Engine to **${repo}**.`,
  "",
  "Each item below was generated under the content-integrity rules and approved by a human in the Command Center. Implement them idiomatically (see `scripts/apply-suggestions.md`); this PR is for human review — do not auto-merge.",
  "",
  "## Applied suggestions",
  "",
];
for (const s of approved) {
  prLines.push(`### ${s.kind} — ${s.target_queries?.query_text ?? "general"}`);
  if (s.rationale) prLines.push(`_${s.rationale}_`);
  prLines.push("");
  prLines.push("```json");
  prLines.push(JSON.stringify(s.payload, null, 2));
  prLines.push("```");
  prLines.push("");
}
writeFileSync(join(base, "PR-BODY.md"), prLines.join("\n"));

console.log(`Entity : ${entity.name} (${entity.domain})`);
console.log(`Repo   : ${repo}`);
console.log(`Approved suggestions: ${approved.length} [${Object.keys(byKind).join(", ")}]`);
console.log(`Wrote  : ${base}/ (suggestions.json, per-kind files, PR-BODY.md)`);
console.log("");
console.log("Next:");
console.log(`  1. In ${repo}, implement the payloads idiomatically (JsonLd component, FAQ section, metadata, on-page copy).`);
console.log(`     Suggested branch: visibility/${(entity.domain || "page").split(".")[0]}-${date}`);
console.log("  2. Open a PR using PR-BODY.md. A human reviews and merges. Never push to main.");
console.log("  3. After merge: node scripts/apply-suggestions.mjs --entity " + (entity.domain || entity.id) + " --mark-applied --pr <pr-url>");
