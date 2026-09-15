import { test, expect } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
const hasCreds = Boolean(email && password);

test.describe("Credentialed auth", () => {
  test.skip(!hasCreds, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

  test("login with valid credentials reaches authenticated state", async ({
    page,
  }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.waitForSelector('input[type="email"], input[name="email"]', {
      timeout: 15000,
    });

    await page.locator('input[type="email"]').first().fill(email!);
    await page.locator('input[type="password"]').first().fill(password!);
    await page
      .getByRole("button", { name: /sign in|log in|continue/i })
      .or(page.locator('button[type="submit"]'))
      .first()
      .click();

    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 30000,
    });
    expect(page.url()).not.toMatch(/\/login/);
  });

  test("protected route accessible after login; logout restores gate", async ({
    page,
  }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.locator('input[type="email"]').first().fill(email!);
    await page.locator('input[type="password"]').first().fill(password!);
    await page
      .locator('button[type="submit"]')
      .or(page.getByRole("button", { name: /sign in|log in/i }))
      .first()
      .click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 30000,
    });

    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    expect(page.url()).not.toMatch(/\/login/);

    const logout = page
      .getByRole("button", { name: /log\s*out|sign\s*out/i })
      .or(page.getByRole("link", { name: /log\s*out|sign\s*out/i }));
    if (await logout.first().isVisible().catch(() => false)) {
      await logout.first().click();
      await page.waitForTimeout(1000);
    } else {
      await page.context().clearCookies();
      await page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {}
      });
    }

    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/login/, { timeout: 15000 });
    expect(page.url()).toMatch(/\/login/);
  });

  test("invalid password shows error, stays on login", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.locator('input[type="email"]').first().fill(email!);
    await page.locator('input[type="password"]').first().fill("WrongPass!999");
    await page
      .locator('button[type="submit"]')
      .or(page.getByRole("button", { name: /sign in|log in/i }))
      .first()
      .click();
    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/\/login/);
    const err = page.getByText(/incorrect|invalid|failed|wrong/i).or(
      page.locator(".text-red-200, .text-red-400, [role=alert]")
    );
    await expect(err.first()).toBeVisible({ timeout: 10000 });
  });
});
