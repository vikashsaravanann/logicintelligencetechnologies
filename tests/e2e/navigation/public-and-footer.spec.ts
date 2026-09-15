import { test, expect } from "@playwright/test";

test.describe("Public navigation", () => {
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
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.status || json.checks).toBeTruthy();
  });
});
