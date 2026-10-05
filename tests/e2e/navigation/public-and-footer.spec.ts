import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/contact", "/services", "/industries", "/free-demo", "/book-consultation",
  "/checklist", "/about", "/blog", "/careers",
];

test.describe("Public navigation", () => {
  for (const path of PUBLIC_ROUTES) {
    test(`${path} remains public`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);
      expect(new URL(page.url()).pathname).toBe(path);
      await expect(page.locator("main").first()).toBeVisible();
    });
  }

  test("homepage loads without crash", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(res?.ok() || (res?.status() ?? 500) < 400).toBeTruthy();
    await expect(page.locator("body")).toBeVisible();
    const critical = errors.filter(
      (m) => !/ResizeObserver|Script error|Non-Error/i.test(m)
    );
    expect(critical, critical.join("\n")).toEqual([]);
  });

  test("robots and sitemap available", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
  });

  test("health endpoint ok", async ({ request }) => {
    const res = await request.get("/api/health");
    const json = await res.json();
    expect(res.status(), JSON.stringify(json.checks)).toBe(200);
    expect(json.status).toBe("ok");
    for (const name of ["database", "smtp", "emailIsolation", "cronSecret", "unsubscribeSecret"]) {
      expect(json.checks[name]?.status, `Health check: ${name}`).toBe("ok");
    }
  });
});
