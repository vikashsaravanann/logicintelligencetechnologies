import { test, expect } from "@playwright/test";

const PROTECTED = [
  "/dashboard",
  "/admin",
  "/admin/command-center",
  "/profile",
  "/client/dashboard",
  "/client/projects",
  "/client/documents",
  "/client/invoices",
  "/client/messages",
  "/client/support",
];

test.describe("Auth gate", () => {
  for (const path of PROTECTED) {
    test(`logged-out ${path} redirects to login with next`, async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForURL(/\/login/, { timeout: 15000 });
      const url = page.url();
      expect(url).toContain("/login");
      expect(new URL(url).searchParams.get("next")).toBe(path);
    });
  }

  test("homepage remains public", async ({ page }) => {
    const res = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(400);
    expect(page.url()).not.toContain("/login");
  });

  test("login is public", async ({ page }) => {
    const res = await page.goto("/login", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator("main, form, h1").first()).toBeVisible();
  });

  test("external next stays on-site (no open redirect navigation)", async ({
    page,
  }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const origin = new URL(page.url()).origin;
    await page.goto("/login?next=https://evil.example.com", {
      waitUntil: "domcontentloaded",
    });
    const u = new URL(page.url());
    expect(u.pathname).toBe("/login");
    expect(u.origin).toBe(origin);
  });
});
