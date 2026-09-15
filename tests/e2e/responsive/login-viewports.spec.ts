import { test, expect } from "@playwright/test";
import {
  assertNoHorizontalOverflow,
  assertLoginVerticalReasonable,
} from "../helpers/overflow";

const VIEWPORTS = [
  { name: "320x568", width: 320, height: 568 },
  { name: "360x800", width: 360, height: 800 },
  { name: "375x812", width: 375, height: 812 },
  { name: "390x844", width: 390, height: 844 },
  { name: "414x896", width: 414, height: 896 },
] as const;

for (const vp of VIEWPORTS) {
  test.describe(`Login @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("no horizontal overflow; critical controls visible", async ({
      page,
    }) => {
      await page.goto("/login", { waitUntil: "domcontentloaded" });
      await page.waitForSelector("main, form, h1", { timeout: 15000 });

      await assertNoHorizontalOverflow(page);
      const maxV = vp.height <= 600 ? 200 : 120;
      await assertLoginVerticalReasonable(page, maxV);

      await expect(
        page.getByRole("heading", { level: 1 }).first()
      ).toBeVisible();
      await expect(
        page.getByLabel(/email/i).or(page.locator('input[type="email"]')).first()
      ).toBeVisible();
      await expect(
        page
          .getByRole("button", { name: /sign in|log in|continue|submit/i })
          .or(page.locator('button[type="submit"]'))
          .first()
      ).toBeVisible();

      const back = page
        .getByRole("link", { name: /back to home/i })
        .or(page.getByText(/back to home/i));
      await expect(back.first()).toBeVisible();

      const excess = await page.evaluate((vw) => {
        const nodes = Array.from(
          document.querySelectorAll("main, form, section, input, button, a")
        );
        let worst = 0;
        for (const n of nodes) {
          const r = (n as HTMLElement).getBoundingClientRect();
          if (r.width > vw + 2) worst = Math.max(worst, r.width - vw);
        }
        return worst;
      }, vp.width);
      expect(excess, `Element exceeds viewport by ${excess}px`).toBeLessThanOrEqual(2);
    });
  });
}
