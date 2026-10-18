import { expect, test, type Page } from "@playwright/test";

/**
 * REAL browser test against an isolated Supabase/Vercel test deployment.
 *
 * This suite does NOT create accounts or production records. The test environment
 * must be provisioned in advance with:
 *  - a synthetic client identity
 *  - a synthetic staff identity whose email is verified and MFA/onboarding completed
 *  - ONE active engagement/project linking the client to the staff employee
 *  - a thread/routing configuration that permits the client to message assigned staff
 *
 * CI sets RUN_SYNTHETIC_HANDOFF=1 and fails closed if fixtures are unavailable.
 * Do not run against the production domain or real customers.
 */
const requiredNames = [
  "PLAYWRIGHT_BASE_URL",
  "E2E_CLIENT_EMAIL",
  "E2E_CLIENT_PASSWORD",
  "E2E_STAFF_EMAIL",
  "E2E_STAFF_PASSWORD",
  "E2E_PROJECT_LABEL",
] as const;

const fixture = Object.fromEntries(
  requiredNames.map((name) => [name, process.env[name] || ""])
) as Record<(typeof requiredNames)[number], string>;

async function signIn(page: Page, email: string, password: string, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.locator('input[type="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.getByRole("button", { name: /sign in/i }).first().click();
  await page.waitForURL((url) => url.pathname !== "/login", { timeout: 30_000 });
}

test.describe("synthetic client ↔ assigned staff project handoff", () => {
  // Mandatory under the explicit release gate; ordinary public smoke suites
  // must not touch any mutable or real project records.
  test.skip(process.env.RUN_SYNTHETIC_HANDOFF !== "1", "Run only in isolated handoff CI");

  test("assignment → client message → staff reply → client receives reply", async ({ browser }) => {
    test.setTimeout(180_000);
    const missing = requiredNames.filter((name) => !fixture[name]);
    expect(missing, `Missing required synthetic E2E fixture variables: ${missing.join(", ")}`).toEqual([]);

    const base = new URL(fixture.PLAYWRIGHT_BASE_URL);
    expect(base.protocol, "Synthetic E2E must use an HTTPS test environment").toBe("https:");
    expect(
      base.hostname,
      "Never run account-changing synthetic E2E against the LIT production domain"
    ).not.toMatch(/^(www\.)?logicintelligencetechnologies\.in$/i);

    const clientContext = await browser.newContext({ baseURL: base.origin });
    const staffContext = await browser.newContext({ baseURL: base.origin });
    const client = await clientContext.newPage();
    const staff = await staffContext.newPage();

    try {
      await signIn(staff, fixture.E2E_STAFF_EMAIL, fixture.E2E_STAFF_PASSWORD, "/staff/dashboard");
      await staff.goto("/staff/projects");
      await expect(
        staff.getByText(fixture.E2E_PROJECT_LABEL, { exact: false }).first(),
        "Super Admin's synthetic project assignment must be visible to this staff account"
      ).toBeVisible();

      await signIn(client, fixture.E2E_CLIENT_EMAIL, fixture.E2E_CLIENT_PASSWORD, "/client/messages");
      await client.goto("/client/messages");
      const requestText = `E2E client request ${Date.now()} -- ${fixture.E2E_PROJECT_LABEL}`;
      await client.getByPlaceholder(/type a message or architectural question/i).fill(requestText);
      await client.getByRole("button", { name: /^send$/i }).click();
      await expect(client.getByText(requestText).first()).toBeVisible();

      await staff.goto("/staff/messages");
      await staff.reload();
      const threadButton = staff.getByRole("button").filter({
        hasText: fixture.E2E_PROJECT_LABEL,
      }).first();
      await expect(
        threadButton,
        "The client request must be routed to the assigned staff member and correct project"
      ).toBeVisible();
      await threadButton.click();
      await expect(staff.getByText(requestText).first()).toBeVisible();

      const replyText = `E2E staff reply ${Date.now()}`;
      await staff.getByPlaceholder(/write a client-visible reply/i).fill(replyText);
      await staff.getByRole("button", { name: /^send$/i }).last().click();
      await expect(staff.getByText(replyText).first()).toBeVisible();

      await client.reload();
      await expect(
        client.getByText(replyText).first(),
        "A staff reply must persist and become visible to the correct client"
      ).toBeVisible();
    } finally {
      await Promise.allSettled([clientContext.close(), staffContext.close()]);
    }
  });
});
