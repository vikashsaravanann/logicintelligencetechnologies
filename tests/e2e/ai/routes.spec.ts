import { test, expect } from "@playwright/test";

test.describe("AI routes", () => {
  test("/ai landing remains public", async ({ page }) => {
    const response = await page.goto("/ai", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/ai");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
