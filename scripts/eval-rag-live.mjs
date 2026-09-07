/**
 * Nightly live-model golden eval. Asserts catalog prices appear in the model reply.
 * Requires SITE_URL. Optional XAI/GROQ keys are on the server, not here.
 */
const SITE = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
const cases = [
  { id: "launch-price", q: "How much is the Digital Launch Pack?", must: ["8,999", "8999"] },
  { id: "pro-price", q: "What does the Business Pro Pack cost?", must: ["18,999", "18999"] },
  { id: "enterprise", q: "Enterprise pack starting price?", must: ["50,000", "50000"] },
  { id: "launch-support", q: "How long is free support on Digital Launch Pack?", must: ["1 month", "one month"] },
  { id: "pro-support", q: "Support window on Business Pro Pack?", must: ["3 month"] },
  { id: "payment", q: "Payment terms for Launch pack?", must: ["50%"] },
  { id: "demo", q: "Do you offer a free demo before payment?", must: ["demo"] },
  { id: "whatsapp", q: "What is your WhatsApp number?", must: ["93428"] },
  { id: "pages", q: "How many pages in Digital Launch Pack?", must: ["5"] },
  { id: "pro-gateway", q: "Does Business Pro include a payment gateway?", must: ["payment", "razorpay", "gateway"] },
];

if (!SITE) {
  console.log("SITE_URL missing — skip live eval");
  process.exit(0);
}

let passed = 0;
const failures = [];
for (const item of cases) {
  try {
    const res = await fetch(`${SITE.replace(/\/$/, "")}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: item.q, text: item.q, stream: false, mode: "company", max_tokens: 400 }),
      signal: AbortSignal.timeout(35000),
    });
    const data = await res.json().catch(() => ({}));
    const reply = String(data.generated_text || data.reply || "").toLowerCase();
    const hit = item.must.some((m) => reply.includes(m.toLowerCase()));
    if (hit) {
      passed += 1;
      console.log(`PASS  ${item.id}`);
    } else {
      failures.push(item.id);
      console.log(`FAIL  ${item.id}  reply=${reply.slice(0, 180)}`);
    }
  } catch (err) {
    failures.push(item.id);
    console.log(`FAIL  ${item.id}  ${err instanceof Error ? err.message : err}`);
  }
}
console.log(`\nLive golden: ${passed}/${cases.length}`);
if (failures.length) {
  console.log("Failures:", failures.join(", "));
  process.exitCode = 1;
}
