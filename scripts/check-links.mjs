#!/usr/bin/env node
const BASE = process.env.SITE_URL || "https://www.logicintelligencetechnologies.in";
const ROUTES = ["/", "/ai", "/ai-assistant", "/investors", "/jobs", "/about", "/packages", "/blog", "/contact", "/free-demo", "/work"];

async function main() {
  const rows = [];
  for (const r of ROUTES) {
    const url = `${BASE}${r}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      rows.push({ url, status: res.status, ok: res.ok });
    } catch (e) {
      rows.push({ url, status: 0, ok: false, error: String(e) });
    }
  }
  console.table(rows);
  const failed = rows.filter((r) => !r.ok);
  if (failed.length) {
    console.error(`FAIL ${failed.length} routes`);
    process.exit(1);
  }
  console.log("OK", rows.length, "routes");
}

main();
