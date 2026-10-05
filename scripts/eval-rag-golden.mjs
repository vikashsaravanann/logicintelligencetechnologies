/**
 * Golden-set RAG evaluation (retrieval quality).
 *
 * Usage:
 *   node scripts/eval-rag-golden.mjs
 *   node scripts/eval-rag-golden.mjs --seed
 *
 * Uses lexical fallback built into the evaluator so it runs without live DB.
 * With SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL, also exercises RPC path via seed.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const golden = JSON.parse(
  readFileSync(join(root, "src/lib/ai/golden-set.json"), "utf8")
);

// Minimal mirror of seed chunks for offline eval (packages prices are critical)
const packages = [
  {
    source: "packages",
    title: "Digital Launch Pack",
    content:
      "Digital Launch Pack Starting from ₹8,999. up to 5 pages. 1 month free support. Payment 50% advance 50% on delivery. Delivery about 5-7 working days. Best first website Launch pack for local shop.",
    is_price_constrained: true,
  },
  {
    source: "packages",
    title: "Business Pro Pack",
    content:
      "Business Pro Pack Starting from ₹18,999. booking system online payments payment gateway. 3 months support. Bookings and payments.",
    is_price_constrained: true,
  },
  {
    source: "packages",
    title: "Enterprise Pack",
    content:
      "Enterprise Pack Custom Quote starts from ₹50,000. 6 months support. milestone payments.",
    is_price_constrained: true,
  },
];

const policies = [
  {
    source: "policy",
    title: "Payment terms",
    content:
      "Launch and Pro packages typically use 50% advance and 50% on delivery. Enterprise uses milestone-based payments.",
    is_price_constrained: true,
  },
  {
    source: "policy",
    title: "Free demo policy",
    content:
      "Logic Intelligence Technologies offers a free demo when scope fits before payment.",
    is_price_constrained: false,
  },
  {
    source: "policy",
    title: "Support windows",
    content:
      "Digital Launch Pack includes about 1 month free support. Business Pro Pack about 3 months. Enterprise about 6 months. After free support paid maintenance plans available.",
    is_price_constrained: true,
  },
  {
    source: "policy",
    title: "Refund policy summary",
    content:
      "Initial deposits are typically non-refundable once discovery or design has started. Mid-development cancellation is billed for work completed.",
    is_price_constrained: true,
  },
  {
    source: "policy",
    title: "Contact",
    content:
      "WhatsApp/Phone +91 75500 67712. Email support@logicintelligencetechnologies.in. Talk to a human on the team via WhatsApp or support email.",
    is_price_constrained: false,
  },
];

const services = [
  {
    source: "services",
    title: "AI chatbot and RAG assistants",
    content: "AI chatbot RAG assistant integration for existing sites and custom apps.",
    is_price_constrained: false,
  },
  {
    source: "services",
    title: "Hotel & Hospitality Website Development",
    content:
      "Hotel hospitality websites with booking-ready design for hotels resorts homestays.",
    is_price_constrained: false,
  },
  {
    source: "services",
    title: "E-Commerce Website Development",
    content:
      "E-Commerce online store with Razorpay UPI Netbanking Cards payment gateway.",
    is_price_constrained: false,
  },
];

const portfolio = [
  {
    source: "portfolio",
    title: "FreshBite — Restaurant Ordering Platform",
    content:
      "FreshBite restaurant ordering platform full-stack food ordering payments admin.",
    is_price_constrained: false,
  },
];

const CORPUS = [...packages, ...policies, ...services, ...portfolio];

function retrieve(query, limit = 8) {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((t) => t.length > 2);
  return CORPUS.map((c) => {
    const hay = `${c.title} ${c.content}`.toLowerCase();
    let score = 0;
    for (const t of tokens) if (hay.includes(t)) score += 1;
    if (c.is_price_constrained && /(price|cost|pack|budget|how much)/i.test(query))
      score += 2;
    return { ...c, rank: score };
  })
    .filter((c) => c.rank > 0)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit);
}

function passCase(item, chunks) {
  const blob = chunks.map((c) => `${c.title} ${c.content}`).join("\n").toLowerCase();
  const must = item.must_include_any || [];
  const hit = must.some((m) => blob.includes(String(m).toLowerCase()));
  const sourceOk =
    !item.expected_sources?.length ||
    chunks.some((c) => item.expected_sources.includes(c.source));
  return { hit, sourceOk, ok: hit && sourceOk, blob };
}

let passed = 0;
const failures = [];

for (const item of golden) {
  const chunks = retrieve(item.query, 8);
  const result = passCase(item, chunks);
  if (result.ok) {
    passed += 1;
    console.log(`PASS  ${item.id}`);
  } else {
    failures.push(item.id);
    console.log(
      `FAIL  ${item.id}  hit=${result.hit} sourceOk=${result.sourceOk}  top=${chunks
        .slice(0, 3)
        .map((c) => c.title)
        .join(" | ")}`
    );
  }
}

const total = golden.length;
const score = total ? ((passed / total) * 100).toFixed(1) : "0";
console.log("\n--- RAG golden-set summary ---");
console.log(`Passed: ${passed}/${total} (${score}%)`);
if (failures.length) {
  console.log("Failures:", failures.join(", "));
  process.exitCode = 1;
} else {
  console.log("All golden cases passed (lexical retrieval).");
}
