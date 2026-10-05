import { test, expect } from "@playwright/test";

test.describe("Site navigation interactions", () => {
  test("desktop More menu supports keyboard close", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    const more = page.getByRole("button", { name: "MORE", exact: true });
    await more.click();
    await expect(more).toHaveAttribute("aria-expanded", "true");
    const menu = page.locator("#more-menu");
    await expect(menu).toBeVisible();
    const bounds = await menu.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1441);
    await more.focus();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(more).toHaveAttribute("aria-expanded", "false");
  });

  test("mobile menu traps focus, closes with Escape and returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });
    const trigger = page.getByRole("button", { name: "Open menu", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Close menu", exact: true })).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    for (let i = 0; i < 35; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Shift+Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  });

  test("mobile menu navigation closes the dialog", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await dialog.getByRole("link", { name: "COMPANY", exact: true }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(dialog).toHaveCount(0);
  });
});

// Browser-only interception: no real subscriptions, email or database writes.
test.describe("Newsletter presentation states (mocked API)", () => {
  test("success is announced and submitted email is correct", async ({ page }) => {
    let submitted: unknown;
    await page.route("**/api/newsletter", async (route) => {
      submitted = route.request().postDataJSON();
      await route.fulfill({ status: 200, json: { success: true } });
    });
    await page.goto("/");
    const footer = page.locator("footer");
    await footer.getByRole("textbox", { name: "Email address" }).fill("ui-check@example.com");
    await footer.getByRole("button", { name: "Subscribe to newsletter" }).click();
    await expect(footer.getByRole("status")).toContainText("THANK YOU FOR SUBSCRIBING!");
    expect(submitted).toEqual({ email: "ui-check@example.com" });
  });

  test("request errors are announced without false success", async ({ page }) => {
    await page.route("**/api/newsletter", (route) => route.fulfill({
      status: 503, json: { message: "Please try again later." },
    }));
    await page.goto("/");
    const footer = page.locator("footer");
    await footer.getByRole("textbox", { name: "Email address" }).fill("ui-check@example.com");
    await footer.getByRole("button", { name: "Subscribe to newsletter" }).click();
    await expect(footer.getByRole("alert")).toHaveText("Please try again later.");
    await expect(footer.getByRole("status")).toHaveCount(0);
  });

  test("invalid email never calls the subscription API", async ({ page }) => {
    let called = false;
    await page.route("**/api/newsletter", async (route) => {
      called = true;
      await route.fulfill({ status: 200, json: { success: true } });
    });
    await page.goto("/");
    const footer = page.locator("footer");
    const email = footer.getByRole("textbox", { name: "Email address" });
    await email.fill("not-an-email");
    await footer.getByRole("button", { name: "Subscribe to newsletter" }).click();
    expect(await email.evaluate((el) => (el as HTMLInputElement).validity.valid)).toBe(false);
    expect(called).toBe(false);
  });
});
