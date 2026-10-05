/**
 * Seed knowledge_chunks into Supabase (service role).
 *
 * Requires env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: node --env-file=.env.local scripts/seed-knowledge.mjs
 * Or export vars then: node scripts/seed-knowledge.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Lightweight parse of packages from TS is fragile; embed minimal seed inline + policy
// Prefer calling API route in production; this script seeds essential constrained facts.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const rows = [
  {
    source: "packages",
    source_id: "digital-launch-pack",
    title: "Digital Launch Pack",
    content:
      "Digital Launch Pack Starting from ₹8,999. Everything needed to launch online: up to 5 pages, mobile-responsive, basic SEO, contact form, Google Maps, WhatsApp button, 1-month support. Payment 50% advance, 50% on delivery. Timeline about 5-7 working days.",
    is_price_constrained: true,
    metadata: { price: "Starting from ₹8,999" },
  },
  {
    source: "packages",
    source_id: "business-pro-pack",
    title: "Business Pro Pack",
    content:
      "Business Pro Pack Starting from ₹18,999. Booking system, admin panel, blog, payment gateway, advanced animations, 3-month support, up to 10 pages. Payment 50% advance, 50% on delivery.",
    is_price_constrained: true,
    metadata: { price: "Starting from ₹18,999" },
  },
  {
    source: "packages",
    source_id: "enterprise-pack",
    title: "Enterprise Pack",
    content:
      "Enterprise Pack Custom Quote starts from ₹50,000. Dedicated project manager, unlimited pages/revisions within scope, 6-month support, advanced backend. Milestone-based payments.",
    is_price_constrained: true,
    metadata: { price: "Custom from ₹50,000" },
  },
  {
    source: "policy",
    source_id: "payment-terms",
    title: "Payment terms",
    content:
      "Launch and Pro packages typically use 50% advance and 50% on delivery. Enterprise uses milestone-based payments.",
    is_price_constrained: true,
    metadata: {},
  },
  {
    source: "policy",
    source_id: "free-demo",
    title: "Free demo policy",
    content:
      "Free demo when scope fits — see direction before payment. Start at /free-demo or WhatsApp +91 75500 67712.",
    is_price_constrained: false,
    metadata: {},
  },
  {
    source: "policy",
    source_id: "support-windows",
    title: "Support windows",
    content:
      "Digital Launch Pack: about 1 month free support. Business Pro Pack: about 3 months. Enterprise: about 6 months.",
    is_price_constrained: true,
    metadata: {},
  },
  {
    source: "policy",
    source_id: "refund",
    title: "Refund policy summary",
    content:
      "Initial deposits typically non-refundable once discovery/design started. Mid-development cancellation billed for work completed. Post-deployment: no refunds; bug-fix warranty per SOW.",
    is_price_constrained: true,
    metadata: {},
  },
  {
    source: "policy",
    source_id: "contact",
    title: "Contact",
    content:
      "WhatsApp/Phone +91 75500 67712. Email support@logicintelligencetechnologies.in. Coimbatore, Tamil Nadu, India.",
    is_price_constrained: false,
    metadata: {},
  },
  {
    source: "portfolio",
    source_id: "freshbite",
    title: "FreshBite — Restaurant Ordering Platform",
    content:
      "FreshBite restaurant ordering platform: order tracking, payments, multi-location admin. Tech Next.js Stripe Supabase.",
    is_price_constrained: false,
    metadata: {},
  },
  {
    source: "services",
    source_id: "hotel",
    title: "Hotel & Hospitality Website Development",
    content:
      "Hotel and hospitality websites with booking-ready design for hotels, resorts, and homestays.",
    is_price_constrained: false,
    metadata: {},
  },
  {
    source: "services",
    source_id: "ecommerce",
    title: "E-Commerce Website Development",
    content:
      "E-commerce stores with secure payments including Razorpay UPI Netbanking Cards.",
    is_price_constrained: false,
    metadata: {},
  },
];

const { error: delErr } = await supabase
  .from("knowledge_chunks")
  .delete()
  .in("source", ["packages", "services", "portfolio", "policy"]);

if (delErr) {
  console.error("Delete failed:", delErr.message);
  process.exit(1);
}

const { error } = await supabase.from("knowledge_chunks").insert(rows);
if (error) {
  console.error("Insert failed:", error.message);
  process.exit(1);
}

console.log(`Seeded ${rows.length} knowledge_chunks rows.`);
// silence unused
void readFileSync;
