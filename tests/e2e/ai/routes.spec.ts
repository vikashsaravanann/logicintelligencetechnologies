import { test, expect } from "@playwright/test";

test.describe("AI routes", () => {
  test("/ai requires authentication", async ({ page }) => {
    await page.goto("/ai", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/login/, { timeout: 15000 });
    expect(page.url()).toMatch(/next=/);
  });
});
